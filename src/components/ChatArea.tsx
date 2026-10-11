import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trash2, LogOut, User, ChevronDown, PanelLeft, Bot } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Logo from './Logo';
import ThemeToggle from '@/components/ThemeToggle';

const ChatArea = () => {
  const { activeConversation, clearChat, sendMessage, isProcessing } = useChat();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col h-screen min-w-0 bg-background relative overflow-hidden transition-colors duration-200">
      {/* Top bar */}
      <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-5 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {activeConversation ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl clay-btn flex items-center justify-center text-primary">
                <Bot size={16} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground truncate max-w-xs sm:max-w-md">{activeConversation.title}</h2>
                <p className="text-[11px] text-muted-foreground font-medium">Income Tax & Statutory Assistant</p>
              </div>
            </div>
          ) : (
            <Logo size="sm" />
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          {activeConversation && activeConversation.messages.length > 0 && (
            <button
              onClick={clearChat}
              className="clay-btn p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="clay-btn flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all"
            >
              <div className="w-7 h-7 rounded-lg clay-btn-primary flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground hidden sm:block">{user?.name || 'Account'}</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-12 w-48 clay-card p-1.5 z-50">
                <div className="px-3 py-2 border-b border-border text-xs">
                  <p className="font-bold text-foreground">{user?.name}</p>
                  <p className="text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 rounded-lg transition-colors mt-1"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
        {!activeConversation || activeConversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 rounded-2xl clay-btn-primary flex items-center justify-center mb-5"
            >
              <Sparkles size={30} className="text-white drop-shadow-sm" />
            </motion.div>
            <h3 className="text-xl font-extrabold text-foreground mb-2">Welcome to your AI CA Partner</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Upload your bank statements, compute advance tax liability, analyze 80C/80D deductions, or check ITR filing requirements.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {[
                { title: 'Tax Slab Calculation', q: 'What are the income tax slabs under the New Regime for FY 2024-25?' },
                { title: 'Bank Statement Check', q: 'How do I detect unusual high-value cash deposits in my account?' },
                { title: 'Standard Deduction', q: 'Is standard deduction available for salaried individuals in both regimes?' },
                { title: 'ITR-1 vs ITR-2', q: 'Which ITR form should I file if I have salary income and capital gains?' },
              ].map(({ title, q }) => (
                <button
                  key={title}
                  onClick={() => sendMessage(q)}
                  className="clay-card-interactive p-3.5 text-left group"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">{q}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-4">
            {activeConversation.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput />
    </div>
  );
};

export default ChatArea;
