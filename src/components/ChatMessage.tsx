import { motion } from 'framer-motion';
import { Copy, AlertCircle, FileText, Image, ChevronDown, Check, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/contexts/ChatContext';
import FinancialSummary from './FinancialSummary';
import BankStatementCard from './BankStatementCard';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 py-2 px-2">
    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
  </div>
);

const ChatMessage = ({ message }: { message: ChatMessageType }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5`}
    >
      <div
        className={`${
          isUser ? 'max-w-[85%] lg:max-w-[75%]' : 'max-w-[95%] lg:max-w-[90%]'
        }`}
      >
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* Avatar with Clay styling */}
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isUser
                ? 'clay-btn-emerald text-white text-xs font-bold'
                : 'clay-btn-primary text-white text-xs font-bold'
            }`}
          >
            {isUser ? 'YOU' : <Sparkles size={16} />}
          </div>

          <div className="flex-1 min-w-0">
            {/* File attachment preview */}
            {message.fileName && (
              <div
                className={`flex items-center gap-2 mb-2 px-3 py-2 clay-card text-xs font-semibold ${
                  isUser ? 'ml-auto w-fit' : ''
                }`}
              >
                {message.fileType?.startsWith('image/') ? (
                  <Image size={15} className="text-primary" />
                ) : (
                  <FileText size={15} className="text-primary" />
                )}
                <span className="text-foreground truncate max-w-xs">{message.fileName}</span>
              </div>
            )}

            {/* Message bubble */}
            {!message.bankSummary && (
              <div
                className={`relative group rounded-2xl p-4 transition-all ${
                  isUser
                    ? 'clay-card bg-primary/10 border-primary/30 text-foreground font-medium'
                    : 'clay-card bg-card text-foreground'
                }`}
              >
                {message.isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <TypingIndicator />
                    <span>Analyzing statutory clauses & calculating...</span>
                  </div>
                ) : message.isError ? (
                  <div className="flex items-center gap-2 text-destructive text-sm font-semibold">
                    <AlertCircle size={16} />
                    <span>{message.content}</span>
                  </div>
                ) : (
                  <>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                      <ReactMarkdown remarkGfm={remarkGfm}>{message.content}</ReactMarkdown>
                    </div>

                    {!isUser && (
                      <button
                        onClick={copyToClipboard}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 clay-btn rounded-lg text-muted-foreground hover:text-foreground"
                        title="Copy text"
                      >
                        {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Embedded Bank Statement Card */}
            {message.bankSummary && (
              <BankStatementCard data={message.bankSummary} filename={message.fileName} />
            )}

            {/* Embedded Financial Summary */}
            {message.financialData && (
              <FinancialSummary data={message.financialData} />
            )}

            {/* Retrieved chunks / Knowledge references collapsible */}
            {message.retrievedChunks && message.retrievedChunks.length > 0 && (
              <Collapsible className="mt-2.5">
                <CollapsibleTrigger className="clay-btn px-3 py-1.5 rounded-xl text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors">
                  <FileText size={13} className="text-primary" />
                  <span>Referenced Tax Statutes ({message.retrievedChunks.length} sections)</span>
                  <ChevronDown size={12} className="transition-transform group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {message.retrievedChunks.map((chunk, i) => (
                    <div key={i} className="clay-card p-3 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground font-semibold mb-1 text-[11px]">
                        <span className="text-primary font-bold">{chunk.level || 'IT Act'} - {chunk.book || 'Direct Tax'}</span>
                        <span className="clay-pill px-2 py-0.5 text-[10px]">Chunk #{chunk.chunk_id}</span>
                      </div>
                      <p className="text-foreground/80 leading-relaxed font-mono text-[11px] whitespace-pre-wrap">{chunk.text}</p>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className={`mt-1 px-1 text-[10px] text-muted-foreground font-medium ${isUser ? 'text-right' : 'text-left'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
