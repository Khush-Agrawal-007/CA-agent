import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Plus, Trash2, MessageSquare, Edit2, Check, X, PanelLeftClose, PanelLeft, BarChart3, FileSpreadsheet, Bot } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ChatSidebar = ({ isOpen, onToggle }: ChatSidebarProps) => {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation,
    deleteConversation,
    renameConversation,
    setActiveConversation,
  } = useChat();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startRename = (id: string, title: string) => {
    setEditingId(id);
    setEditTitle(title);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const confirmRename = () => {
    if (editingId && editTitle.trim()) {
      renameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-72 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-1.5">
            <ThemeToggle className="scale-90" />
            <button
              onClick={onToggle}
              className="p-1.5 rounded-xl hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground transition-colors lg:hidden"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-3 space-y-2">
          <button
            onClick={() => createConversation()}
            className="w-full clay-btn-primary py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>

          <NavLink
            to="/itr-hub"
            className={({ isActive }) =>
              `w-full clay-btn py-2 px-3.5 flex items-center gap-2.5 text-xs font-semibold ${
                isActive
                  ? 'bg-secondary/20 text-secondary border-secondary/40'
                  : 'bg-sidebar-accent/50 text-sidebar-foreground hover:bg-sidebar-accent'
              }`
            }
          >
            <FileSpreadsheet size={15} className="text-secondary" />
            <span>ITR Filing Hub</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `w-full clay-btn py-2 px-3.5 flex items-center gap-2.5 text-xs font-semibold ${
                isActive
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-sidebar-accent/50 text-sidebar-foreground hover:bg-sidebar-accent'
              }`
            }
          >
            <BarChart3 size={15} className="text-primary" />
            <span>Financial Analytics</span>
          </NavLink>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 scrollbar-thin">
          <p className="px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Recent Tax Consultations
          </p>

          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-muted-foreground text-xs font-medium">
              No conversations yet. Start a new chat to consult on taxes!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConversation(conv.id)}
                  className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-medium transition-all ${
                    isActive
                      ? 'clay-card bg-sidebar-accent text-sidebar-accent-foreground font-semibold border-primary/30'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                  }`}
                >
                  <MessageSquare size={15} className={isActive ? 'text-primary shrink-0' : 'text-muted-foreground shrink-0'} />

                  {editingId === conv.id ? (
                    <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename();
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        className="flex-1 clay-input px-2 py-0.5 text-xs text-foreground outline-none"
                      />
                      <button onClick={confirmRename} className="p-1 text-emerald-500 hover:text-emerald-400">
                        <Check size={13} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1 text-muted-foreground hover:text-destructive">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 truncate text-xs">{conv.title}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 group-hover:hidden">
                        {formatDate(new Date(conv.updatedAt))}
                      </span>

                      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => startRename(conv.id, conv.title)}
                          className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                          title="Rename"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => deleteConversation(conv.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer info badge */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar/50">
          <div className="clay-card p-2.5 flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
            <div className="text-[11px] font-medium leading-tight">
              <span className="text-foreground font-semibold block">CA RAG Engine</span>
              <span className="text-muted-foreground">Ollama + Gemini Flash Active</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;
