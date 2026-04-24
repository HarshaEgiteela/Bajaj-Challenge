import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'https://backend-two-alpha-50.vercel.app/bfhl';

// Animated particle background
const ParticleBackground = () => {
  const particles = Array.from({ length: 30 }, (_, i) => i);
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-20"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            background: i % 2 === 0 ? '#6366f1' : '#8b5cf6',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.1, 0.4, 0.1],
          }}
          transition={{
            duration: Math.random() * 6 + 4,
            repeat: Infinity,
            delay: Math.random() * 4,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// Recursive tree node component
const TreeNode = ({ name, children, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = children && Object.keys(children).length > 0;
  const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
  const color = colors[Math.min(depth, colors.length - 1)];

  return (
    <div className="relative">
      <div className="flex items-center gap-2 py-1.5 group">
        {/* Tree line */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 border-l border-dashed border-white/10" style={{ left: -16 }} />
        )}
        {/* Connector */}
        {depth > 0 && (
          <div className="absolute border-t border-dashed border-white/10" style={{ left: -16, width: 16, top: '50%' }} />
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => hasChildren && setExpanded(!expanded)}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-mono font-bold transition-all duration-200"
          style={{
            background: `${color}22`,
            border: `1px solid ${color}44`,
            color: color,
            cursor: hasChildren ? 'pointer' : 'default',
            boxShadow: `0 0 12px ${color}22`,
          }}
        >
          {hasChildren && (
            <motion.span animate={{ rotate: expanded ? 90 : 0 }} className="text-xs">▶</motion.span>
          )}
          {name}
        </motion.button>
      </div>
      <AnimatePresence>
        {expanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-8 pl-4 border-l border-dashed border-white/10 overflow-hidden"
          >
            {Object.entries(children).map(([child, grandChildren]) => (
              <TreeNode key={child} name={child} children={grandChildren} depth={depth + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Stat card
const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="relative rounded-2xl p-5 overflow-hidden"
    style={{ background: `linear-gradient(135deg, ${color}15, ${color}05)`, border: `1px solid ${color}30` }}
  >
    <div className="text-3xl mb-1">{icon}</div>
    <div className="text-3xl font-bold font-mono" style={{ color }}>{value}</div>
    <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">{label}</div>
    <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10" style={{ background: color }} />
  </motion.div>
);

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [typed, setTyped] = useState('');
  const placeholder = 'A->B, A->C, B->D, C->E, X->Y, Y->Z, Z->X';
  const textareaRef = useRef(null);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(placeholder.slice(0, i));
      i++;
      if (i > placeholder.length) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const nodes = input.split(',').map(s => s.trim()).filter(Boolean);
      const { data } = await axios.post(API_URL, { data: nodes });
      setResponse(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed. Is the API running?');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e);
  };

  const sampleInputs = [
    'A->B, A->C, B->D',
    'X->Y, Y->Z, Z->X',
    'P->Q, Q->R, R->S',
  ];

  return (
    <div className="min-h-screen relative text-white" style={{ background: '#080a12', fontFamily: "'Inter', sans-serif" }}>
      <ParticleBackground />

      {/* Top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, #6366f1, transparent)' }} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="pt-12 pb-8 text-center px-4">
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
              SRM Full Stack Engineering Challenge
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-4 leading-none tracking-tight">
              <span style={{ background: 'linear-gradient(135deg, #e0e7ff, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Hierarchy
              </span>{' '}
              <span className="text-white">Visualizer</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Process node relationships. Detect trees, cycles, and hierarchies instantly.
            </p>
          </motion.div>
        </header>

        {/* Main */}
        <main className="flex-1 px-4 pb-16 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Input Panel */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="lg:col-span-2">
              <div className="rounded-3xl p-6 h-full" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>
                <h2 className="font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">⬡</span>
                  Input Edges
                </h2>

                {/* Sample inputs */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Quick samples:</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleInputs.map(s => (
                      <button key={s} onClick={() => setInput(s)}
                        className="text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-500/40 transition-all text-gray-400 hover:text-white font-mono">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={typed}
                  rows={6}
                  className="w-full rounded-2xl p-4 font-mono text-sm resize-none focus:outline-none transition-all"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#e0e7ff',
                  }}
                  onFocus={e => e.target.style.border = '1px solid rgba(99,102,241,0.6)'}
                  onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.08)'}
                />
                <p className="text-xs text-gray-600 mt-1 mb-4">Tip: Ctrl+Enter to submit</p>

                <motion.button
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-bold text-white relative overflow-hidden transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>⚡ Process Data</>
                    )}
                  </span>
                </motion.button>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="mt-4 p-4 rounded-2xl text-sm text-red-300 flex items-start gap-2"
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      ⚠️ {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Results Panel */}
            <div className="lg:col-span-3 space-y-6">
              <AnimatePresence mode="wait">
                {!response ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="rounded-3xl p-16 flex flex-col items-center justify-center text-center min-h-[400px]"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.06)' }}>
                    <div className="text-7xl mb-6 opacity-20">🌲</div>
                    <p className="text-gray-600 text-lg">Enter edges and click Process Data</p>
                    <p className="text-gray-700 text-sm mt-1">Trees, cycles, and hierarchies will appear here</p>
                  </motion.div>
                ) : (
                  <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* User info banner */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-4 flex flex-wrap gap-6 items-center"
                      style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <div>
                        <p className="text-xs text-indigo-400 uppercase tracking-wider">User ID</p>
                        <p className="font-mono font-semibold text-white">{response.user_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-indigo-400 uppercase tracking-wider">Email</p>
                        <p className="font-mono font-semibold text-white">{response.email_id}</p>
                      </div>
                      <div>
                        <p className="text-xs text-indigo-400 uppercase tracking-wider">Roll No</p>
                        <p className="font-mono font-semibold text-white">{response.college_roll_number}</p>
                      </div>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <StatCard icon="🌲" label="Trees" value={response.summary.total_trees} color="#6366f1" delay={0.1} />
                      <StatCard icon="🔄" label="Cycles" value={response.summary.total_cycles} color="#ec4899" delay={0.2} />
                      <StatCard icon="🏆" label="Largest Root" value={response.summary.largest_tree_root || '—'} color="#10b981" delay={0.3} />
                    </div>

                    {/* Hierarchies */}
                    {response.hierarchies.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        className="rounded-3xl p-6"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h3 className="font-semibold text-gray-300 mb-5 text-sm uppercase tracking-widest flex items-center gap-2">
                          <span className="text-indigo-400">◈</span> Hierarchy Map
                        </h3>
                        <div className="space-y-4">
                          {response.hierarchies.map((h, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                              className="rounded-2xl p-4"
                              style={{
                                background: h.has_cycle ? 'rgba(236,72,153,0.05)' : 'rgba(99,102,241,0.05)',
                                border: `1px solid ${h.has_cycle ? 'rgba(236,72,153,0.2)' : 'rgba(99,102,241,0.15)'}`,
                              }}>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: h.has_cycle ? '#ec4899' : '#6366f1' }}>
                                  Root: {h.root}
                                </span>
                                {h.has_cycle ? (
                                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(236,72,153,0.15)', color: '#ec4899', border: '1px solid rgba(236,72,153,0.3)' }}>
                                    🔄 Cycle Detected
                                  </span>
                                ) : (
                                  <span className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                                    Depth: {h.depth}
                                  </span>
                                )}
                              </div>
                              {!h.has_cycle && h.tree[h.root] !== undefined && (
                                <div className="pl-2">
                                  <TreeNode name={h.root} children={h.tree[h.root]} depth={0} />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Invalids & Duplicates */}
                    {(response.invalid_entries.length > 0 || response.duplicate_edges.length > 0) && (
                      <div className="grid grid-cols-2 gap-4">
                        {response.invalid_entries.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                            className="rounded-2xl p-4"
                            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                            <p className="text-xs uppercase tracking-widest text-red-500 mb-3">⚠ Invalid Entries</p>
                            <div className="flex flex-wrap gap-2">
                              {response.invalid_entries.map((e, i) => (
                                <span key={i} className="text-xs px-2 py-1 rounded-lg font-mono" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>{e}</span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                        {response.duplicate_edges.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                            className="rounded-2xl p-4"
                            style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)' }}>
                            <p className="text-xs uppercase tracking-widest text-yellow-500 mb-3">↻ Duplicate Edges</p>
                            <div className="flex flex-wrap gap-2">
                              {response.duplicate_edges.map((e, i) => (
                                <span key={i} className="text-xs px-2 py-1 rounded-lg font-mono" style={{ background: 'rgba(251,191,36,0.1)', color: '#fde68a', border: '1px solid rgba(251,191,36,0.2)' }}>{e}</span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>

        <footer className="text-center pb-8 text-gray-700 text-sm z-10 relative">
          Built for SRM Engineering Challenge • RA2311003020727
        </footer>
      </div>
    </div>
  );
}
