import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { createClient } from "@libsql/client";
import { fileURLToPath } from "url";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize database client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:waitlist.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function initDb() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function startServer() {
  await initDb();
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Get current total count
  app.get("/api/waitlist/count", async (req, res) => {
    try {
      const result = await db.execute("SELECT COUNT(*) as count FROM waitlist");
      const count = Number(result.rows[0].count);
      res.json({ count });
    } catch (error) {
      console.error("Error getting count:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: Join waitlist
  app.post("/api/waitlist/join", async (req, res) => {
    const { email } = req.body;
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email" });
    }

    try {
      // 1. Insert email into SQLite (IGNORE if it already exists)
      await db.execute({
        sql: "INSERT OR IGNORE INTO waitlist (email) VALUES (?)",
        args: [email]
      });
      
      // 2. Get the new total count (which is also the user's position)
      const result = await db.execute("SELECT COUNT(*) as count FROM waitlist");
      const count = Number(result.rows[0].count);
      
      // Return the real number to the user
      res.json({ count });
    } catch (error) {
      console.error("Error joining waitlist:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // API Route: Admin view (Protected by password)
  app.get("/admin", async (req, res) => {
    const password = req.query.password as string;
    
    // Ensure password matches .env (and .env has a password set)
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      if (!process.env.ADMIN_PASSWORD) {
        return res.status(500).send("Server Error: ADMIN_PASSWORD is not set in .env file.");
      }
      return res.status(401).send("Unauthorized: Please provide the correct password in the URL (?password=your_password)");
    }

    try {
      const result = await db.execute("SELECT email, created_at FROM waitlist ORDER BY created_at DESC");
      const rows = result.rows as unknown as { email: string, created_at: string }[];
      
      // Simple HTML view with delete functionality
      const html = `
        <html>
          <head>
            <title>Admin - Waitlist</title>
            <style>
              body { font-family: sans-serif; padding: 40px; max-width: 900px; margin: 0 auto; line-height: 1.6; color: #333; }
              h1 { color: #4f46e5; }
              textarea { width: 100%; height: 150px; padding: 12px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px; font-family: monospace; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
              th, td { padding: 12px; border: 1px solid #eee; text-align: left; }
              th { background: #f8fafc; font-weight: 600; }
              tr:hover { background: #f1f5f9; }
              .delete-btn { 
                background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; 
                cursor: pointer; font-size: 12px; text-decoration: none; display: inline-block; transition: background 0.2s;
              }
              .delete-btn:hover { background: #dc2626; }
            </style>
          </head>
          <body>
            <h1>Waitlist Management (${rows.length} students)</h1>
            
            <h3>Bulk Copy Emails</h3>
            <textarea readonly>${rows.map(r => r.email).join('\n')}</textarea>
            
            <h3>Student List</h3>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Joined At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rows.map(r => `
                  <tr>
                    <td>${r.email}</td>
                    <td>${new Date(r.created_at).toLocaleString()}</td>
                    <td>
                      <a 
                        href="/admin/delete?password=${password}&email=${encodeURIComponent(r.email)}" 
                        class="delete-btn"
                        onclick="return confirm('Delete ${r.email}?')"
                      >
                        Delete
                      </a>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      res.send(html);
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      res.status(500).send("Internal server error");
    }
  });

  // API Route: Admin Delete (Protected by password)
  app.get("/admin/delete", async (req, res) => {
    const { password, email } = req.query;

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send("Unauthorized");
    }

    try {
      if (typeof email !== "string") throw new Error("Email must be a string");
      await db.execute({
        sql: "DELETE FROM waitlist WHERE email = ?",
        args: [email]
      });
      // Redirect back to the admin page
      res.redirect(`/admin?password=${password}`);
    } catch (error) {
      console.error("Error deleting email:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, "dist");
    console.log("Serving static files from:", distPath);
    
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      const indexPath = path.resolve(distPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("Error sending index.html:", err);
          res.status(404).send("Front-end build (index.html) not found. Please check build logs.");
        }
      });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
