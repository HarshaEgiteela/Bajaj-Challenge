import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  TreePine, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Database,
  Hash,
  Mail,
  User,
  Info
} from 'lucide-react';

const API_URL = 'https://backend-qbshy8qw1-harshas-projects-ea9be1e4.vercel.app/bfhl';

const TreeView = ({ data, nodeName }) => {
  const [isOpen, setIsOpen] = useState(true);
  const children = Object.keys(data);
  const hasChildren = children.length > 0;

  return (
    <div className="tree-node">
      <div 
        className="flex items-center gap-2 py-1 cursor-pointer hover:text-blue-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {hasChildren && (
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={14} />
          </motion.div>
        )}
        <span className="font-mono bg-blue-500/10 text-blue-400 px-2 rounded">{nodeName}</span>
      </div>
      
      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {children.map(child => (
              <TreeView key={child} nodeName={child} data={data[child]} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Split by comma and trim
      const nodes = input.split(',').map(s => s.trim()).filter(s => s !== '');
      const { data } = await axios.post(API_URL, { data: nodes });
      setResponse(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect to API. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Hierarchy Processor
        </h1>
        <p className="text-gray-400 text-lg">
          SRM Full Stack Engineering Challenge • BFS/DFS & Tree Construction
        </p>
      </motion.div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-1"
        >
          <div className="glass-card sticky top-8">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Database size={20} className="text-blue-400" />
              Input Data
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Enter edges (e.g. A-&gt;B, C-&gt;D)</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="A->B, A->C, B->D..."
                  className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-sm input-glow resize-none"
                  spellCheck="false"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading || !input}
                className="w-full btn-gradient flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    Process Data
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="md:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!response ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center text-gray-500 p-12 border-2 border-dashed border-white/5 rounded-3xl"
              >
                <TreePine size={64} className="mb-4 opacity-20" />
                <p>Waiting for data processing...</p>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Summary Row */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Trees', value: response.summary.total_trees, icon: TreePine, color: 'text-green-400' },
                    { label: 'Total Cycles', value: response.summary.total_cycles, icon: RotateCcw, color: 'text-red-400' },
                    { label: 'Largest Root', value: response.summary.largest_tree_root || 'N/A', icon: CheckCircle2, color: 'text-blue-400' },
                  ].map((stat, i) => (stat.label && (
                    <div key={i} className="glass-card !p-4 flex flex-col items-center justify-center text-center">
                      <stat.icon size={20} className={`${stat.color} mb-1`} />
                      <span className="text-2xl font-bold">{stat.value}</span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</span>
                    </div>
                  )))}
                </div>

                {/* Main Response Card */}
                <div className="glass-card">
                  <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <span className="text-sm font-medium">{response.user_id}</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-sm font-medium">{response.email_id}</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                      <Hash size={16} className="text-gray-500" />
                      <span className="text-sm font-medium">{response.college_roll_number}</span>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Trees Visualization */}
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
                        <TreePine size={14} /> Hierarchies
                      </h4>
                      <div className="space-y-4">
                        {response.hierarchies.map((h, i) => (
                          <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-500">ROOT: {h.root}</span>
                              {h.has_cycle ? (
                                <span className="tag text-red-400 border-red-500/20 bg-red-500/5">CYCLE DETECTED</span>
                              ) : (
                                <span className="tag text-green-400 border-green-500/20 bg-green-500/5">DEPTH: {h.depth}</span>
                              )}
                            </div>
                            {!h.has_cycle && <TreeView nodeName={h.root} data={h.tree[h.root]} />}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invalid & Duplicates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                          <AlertCircle size={14} /> Invalid Entries
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {response.invalid_entries.length > 0 ? (
                            response.invalid_entries.map((item, i) => (
                              <span key={i} className="tag text-red-400">{item}</span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-600">None</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
                          <Info size={14} /> Duplicate Edges
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {response.duplicate_edges.length > 0 ? (
                            response.duplicate_edges.map((item, i) => (
                              <span key={i} className="tag text-yellow-400">{item}</span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-600">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <footer className="mt-12 text-gray-600 text-sm flex items-center gap-2">
        <CheckCircle2 size={14} />
        System Operational • Version 1.0.4
      </footer>
    </div>
  );
}

export default App;
