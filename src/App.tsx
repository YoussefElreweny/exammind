/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap,
  Users,
  CheckCircle2,
  ArrowRight,
  Twitter,
  Zap,
  Target
} from 'lucide-react';

export default function App() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    fetch('/api/waitlist/count')
      .then(res => res.json())
      .then(data => setWaitlistCount(data.count))
      .catch(err => console.error('Error fetching waitlist count:', err));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setWaitlistCount(data.count);
        setIsSubmitted(true);
      } else {
        console.error('Error joining waitlist:', data.error);
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col">
      {/* Navigation */}
      <nav className="w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">ExamMind</span>
            </div>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="flex items-center justify-center px-6 py-20 min-h-[80vh]">
          <div className="max-w-2xl w-full text-center space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-slate-900">
                Turn Past Exams Into a <br />
                <span className="text-indigo-600 font-black">Study Strategy.</span>
              </h1>
              
              <div className="space-y-4">
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-lg mx-auto">
                  Upload past exams and discover the topics, patterns, and question styles your professor repeats.
                </p>
                <p className="text-sm sm:text-base text-indigo-600 font-semibold italic">
                  Then study with an AI partner trained on your exam style.
                </p>
              </div>
            </motion.div>

            {/* CTA Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative space-y-6"
            >
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <div className="space-y-4">
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col sm:flex-row gap-3 p-2 bg-slate-50 rounded-2xl sm:rounded-full border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm"
                    >
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white px-8 py-3 rounded-xl sm:rounded-full font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Joining...' : 'Get Early Access'}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                      </button>
                    </motion.form>

                    {/* Waitlist Counter - Moved below input */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium"
                    >
                      <Users className="w-4 h-4 text-indigo-500" />
                      <span>{waitlistCount} students already on the waitlist</span>
                    </motion.div>
                  </div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl text-center space-y-4"
                  >
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-slate-900">You're in!</h2>
                      <p className="text-slate-600">
                        Welcome to the future of studying. <br />
                        Your position in the waitlist is:
                      </p>
                      <div className="text-4xl font-black text-indigo-600 tracking-tighter">
                        #{waitlistCount}
                      </div>
                    </div>
                    <p className="text-sm text-slate-500">We'll email you as soon as we launch.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </section>

        {/* Unified Product Section */}
        <section className="py-32 bg-white border-t border-slate-100 min-h-screen flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-6">
            {/* Analysis Card & Description */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-6 text-center lg:text-left">
                <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight">Study With Your <br className="hidden sm:block" /><span className="text-indigo-600">Exam Style.</span></h2>
                <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Our AI transforms messy past papers into a clear, prioritized roadmap. Know exactly what to study, what to skip, and how your professor thinks.
                </p>
                <p className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
                  Once you have your roadmap, chat with an AI that explains your lectures and topics through the lens of the exam. It doesn't just teach you the subject—it teaches you how to answer it.
                </p>
                <div className="space-y-4 pt-4 flex flex-col items-center lg:items-start">
                  {[
                    "Identify high-frequency topics",
                    "Detect professor's questioning style",
                    "Get prioritized chapter focus",
                    "Chat with AI for exam-style explanations"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-700 font-medium w-full max-w-xs lg:max-w-none">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Example Analysis Card</span>
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                      <div className="w-2 h-2 rounded-full bg-slate-200" />
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-indigo-600 uppercase tracking-tight">Exam Pattern Analysis</h4>
                      <div className="h-0.5 w-full bg-slate-100" />
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Most Asked Topics:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 flex items-center gap-2 text-left">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Fourier Transform
                          </span>
                          <span className="font-bold text-slate-900">85%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 flex items-center gap-2 text-left">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Control Systems
                          </span>
                          <span className="font-bold text-slate-900">72%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Professor Style:</p>
                      <ul className="text-sm text-slate-600 space-y-1.5">
                        <li className="flex items-center gap-2">• Problem-solving heavy</li>
                        <li className="flex items-center gap-2">• Rare theory questions</li>
                        <li className="flex items-center gap-2">• Repeats previous structures</li>
                      </ul>
                    </div>

                    <div className="p-4 bg-indigo-50 rounded-xl space-y-3">
                      <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Recommended Study Focus:</p>
                      <div className="text-sm space-y-1">
                        <p className="text-slate-700"><span className="font-bold">High Priority</span> → Chapters 3, 5, 7</p>
                        <p className="text-slate-500 italic">Skim Chapters 1 and 2</p>
                        <p className="text-slate-600">Memorize definitions in Chapter 4</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contrast Section */}
        <section className="py-32 bg-slate-50 border-y border-slate-100 min-h-screen flex items-center justify-center">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Stop the Guesswork.</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Most students spend 80% of their time on topics that never appear on the exam. We fix that.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* The Old Way */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold uppercase tracking-widest">
                  <Zap className="w-3 h-3" />
                  The Old Way
                </div>
                <h3 className="text-2xl font-bold text-slate-900">The 100% Grind</h3>
                <ul className="space-y-4 text-slate-500">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    <span>Studying 100% of the textbook out of fear</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    <span>Spending hours manually comparing past exams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    <span>Guessing which topics the professor favors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    <span>Reviewing every single lecture slide equally</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                    <span>Walking into the exam room stressed and unsure</span>
                  </li>
                </ul>
              </div>

              {/* The ExamMind Way */}
              <div className="bg-white p-8 rounded-3xl border-2 border-indigo-100 shadow-xl shadow-indigo-50 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg uppercase tracking-tighter">
                  Recommended
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-bold uppercase tracking-widest">
                  <Target className="w-3 h-3" />
                  The ExamMind Way
                </div>
                <h3 className="text-2xl font-bold text-slate-900">The 20% Edge</h3>
                <ul className="space-y-4 text-slate-700 font-medium">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Focus on the 20% of topics that actually matter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>AI automatically detects recurring professor patterns</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Know the exact style of questions before they're asked</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Skip irrelevant parts and focus on high-probability content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>Study less, get better grades, and stay confident</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Simple Value Points */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
            {[
              { label: "No More Guessing", desc: "Know what's on the exam" },
              { label: "Save Hours", desc: "Study what matters" },
              { label: "Better Grades", desc: "Optimized for your exam" }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <p className="font-bold text-slate-900 text-sm uppercase tracking-wider">{item.label}</p>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-50">
        <p>© {new Date().getFullYear()} ExamMind. Made for students, by students.</p>
      </footer>
    </div>
  );
}
