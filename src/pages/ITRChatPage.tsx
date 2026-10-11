import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Loader2, Paperclip, X, FileText, Image, Download, Bot, Sparkles, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ThemeToggle from '@/components/ThemeToggle';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  options?: string[];
}

interface ChatState {
  bot_reply: string;
  itr_form: string | null;
  checklist: string[];
  missing_info: string[];
  stage: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function ITRChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      content: 'Hello! I am your AI Chartered Accountant. To determine your correct ITR form (ITR-1 to 4) and draft a personalized statutory checklist, please tell me about your income sources (e.g., salary, business, capital gains, freelance) or attach your Form 16 / bank statement.',
    },
  ]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [accumulatedData, setAccumulatedData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    bot_reply: '',
    itr_form: null,
    checklist: [],
    missing_info: [],
    stage: 'collecting',
  });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string>(
    () => searchParams.get('sessionId') || `itr_${Date.now()}`
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sid = searchParams.get('sessionId');
    if (sid) {
      try {
        const sessions = JSON.parse(localStorage.getItem('ca_agent_itr_sessions') ?? '[]');
        const session = sessions.find((s: any) => s.id === sid);
        if (session) {
          if (session.messages) setMessages(session.messages);
          if (session.accumulatedData) setAccumulatedData(session.accumulatedData);
          setChatState({
            bot_reply: '',
            itr_form: session.itrForm ?? null,
            checklist: session.checklist ?? [],
            missing_info: session.missing_info ?? [],
            stage: session.stage ?? 'collecting',
          });
        }
      } catch {
        // non-critical error
      }
    }
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleNewSession = () => {
    const newId = `itr_${Date.now()}`;
    setSessionId(newId);
    navigate(`/itr-chat?sessionId=${newId}`, { replace: true });
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        content:
          'Hello! I am your AI Chartered Accountant. To determine your correct ITR form and draft your document checklist, please describe your income sources or attach a financial statement.',
      },
    ]);
    setAccumulatedData({});
    setChatState({
      bot_reply: '',
      itr_form: null,
      checklist: [],
      missing_info: [],
      stage: 'collecting',
    });
  };

  const saveSession = (
    updatedChatState: ChatState,
    currentMessages: Message[],
    currentData: Record<string, any>
  ) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('ca_agent_itr_sessions') ?? '[]');
      const existingIdx = sessions.findIndex((s: any) => s.id === sessionId);

      const fieldCount =
        Object.keys(currentData).length + (updatedChatState.checklist?.length || 0);

      const sessionObj = {
        id: sessionId,
        date: new Date().toISOString(),
        itrForm: updatedChatState.itr_form,
        fields: fieldCount,
        stage: updatedChatState.stage,
        checklist: updatedChatState.checklist,
        missing_info: updatedChatState.missing_info,
        messages: currentMessages,
        accumulatedData: currentData,
      };

      if (existingIdx >= 0) {
        sessions[existingIdx] = sessionObj;
      } else {
        sessions.unshift(sessionObj);
      }

      localStorage.setItem('ca_agent_itr_sessions', JSON.stringify(sessions));
    } catch {
      // non-critical
    }
  };

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const exportPDF = () => {
    if (chatState.checklist.length === 0) return;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Income Tax Return (ITR) Checklist', 14, 22);

    doc.setFontSize(12);
    doc.text(`Recommended Form: ${chatState.itr_form || 'Unknown'}`, 14, 32);

    let currentY = 42;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Required Documents:', 14, currentY);
    currentY += 5;

    const checklistData = chatState.checklist.map((item) => [item]);

    autoTable(doc, {
      startY: currentY,
      head: [['Document Name']],
      body: checklistData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    if (chatState.missing_info.length > 0) {
      doc.setFontSize(14);
      doc.text('Additional Details Needed:', 14, currentY);
      currentY += 5;
      const missingData = chatState.missing_info.map((item) => [item]);
      autoTable(doc, {
        startY: currentY,
        head: [['Detail / Question']],
        body: missingData,
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
      });
    }

    doc.save(`ITR_Checklist_${chatState.itr_form || 'Unknown'}.pdf`);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !file) || isLoading) return;

    let userMessage = input.trim();
    if (file && !userMessage) userMessage = `I have uploaded a document: ${file.name}`;

    setInput('');
    const currentFile = file;
    setFile(null);

    const newUserMsg: Message = { id: Date.now().toString(), sender: 'user', content: userMessage };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      let newExtractedData = { ...accumulatedData };

      if (currentFile) {
        const formData = new FormData();
        formData.append('file', currentFile);
        formData.append('context', 'itr');
        const uploadRes = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        if (!uploadRes.ok) throw new Error('File upload failed');
        const uploadData = await uploadRes.json();
        if (uploadData.doc_data) {
          newExtractedData = { ...newExtractedData, ...uploadData.doc_data };
          setAccumulatedData(newExtractedData);
        }
      }

      // Build history payload
      const historyPayload = [];
      let currentUser = '';
      for (const msg of messages) {
        if (msg.sender === 'user') {
          currentUser = msg.content;
        } else if (msg.sender === 'bot') {
          if (currentUser) {
            historyPayload.push({ user: currentUser, assistant: msg.content });
            currentUser = '';
          } else {
            historyPayload.push({ user: '', assistant: msg.content });
          }
        }
      }
      if (currentUser) {
        historyPayload.push({ user: currentUser, assistant: '' });
      }

      const res = await fetch(`${API_BASE}/api/itr/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage,
          history: historyPayload,
          extracted_data: newExtractedData,
          current_stage: chatState.stage,
        }),
      });

      if (!res.ok) throw new Error('Failed to get response');
      const data: ChatState = await res.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        content: data.bot_reply || 'Okay.',
        options: (data as any).mcq_options || [],
      };

      setChatState(data);
      setMessages((prev) => {
        const newMessages = [...prev, botMsg];
        saveSession(data, newMessages, newExtractedData);
        return newMessages;
      });
    } catch (err) {
      toast.error('Failed to connect to assistant.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background transition-colors duration-200 overflow-hidden">
      {/* Sidebar for ITR Status */}
      <div className="w-80 border-r border-sidebar-border bg-sidebar p-5 flex flex-col hidden md:flex shrink-0">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-sidebar-border">
          <Link
            to="/itr-hub"
            className="clay-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-sidebar-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> ITR Hub
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-sm font-extrabold text-sidebar-foreground">Filing Dashboard</h2>
          <button
            onClick={handleNewSession}
            className="clay-btn px-2.5 py-1 text-[11px] font-bold text-primary flex items-center gap-1"
          >
            <Plus size={12} />
            <span>New Session</span>
          </button>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin pr-1">
          {/* Stage */}
          <div className="clay-card p-3.5 space-y-1.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Workflow Stage
            </span>
            <div
              className={`clay-pill inline-flex px-3 py-0.5 text-xs font-bold capitalize ${
                chatState.stage === 'ready'
                  ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                  : 'bg-primary/15 text-primary border-primary/30'
              }`}
            >
              {chatState.stage}
            </div>
          </div>

          {/* Form */}
          <div className="clay-card p-3.5 space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Applicable Form
            </span>
            <p className="text-lg font-black text-foreground">
              {chatState.itr_form || 'Analyzing Profile...'}
            </p>
          </div>

          {/* Missing info */}
          {chatState.missing_info.length > 0 && chatState.stage !== 'ready' && (
            <div className="clay-card p-3.5 space-y-2 border-amber-500/30">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle size={12} />
                <span>Pending Queries</span>
              </span>
              <ul className="space-y-1.5">
                {chatState.missing_info.map((info, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist */}
          {chatState.checklist.length > 0 && (
            <div className="clay-card p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                  Document Checklist ({chatState.checklist.length})
                </span>
                <button
                  onClick={exportPDF}
                  className="clay-btn p-1 text-emerald-500 rounded-lg hover:text-emerald-400"
                  title="Download PDF Checklist"
                >
                  <Download size={13} />
                </button>
              </div>
              <ul className="space-y-1.5">
                {chatState.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-foreground">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative">
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-5 shrink-0 md:hidden z-10">
          <Link to="/itr-hub" className="clay-btn p-2 rounded-xl text-muted-foreground">
            <ArrowLeft size={16} />
          </Link>
          <span className="text-xs font-bold text-foreground">ITR Assistant</span>
          <ThemeToggle />
        </header>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 scrollbar-thin max-w-4xl w-full mx-auto">
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-sm font-medium ${
                  msg.sender === 'user'
                    ? 'clay-card bg-primary/10 border-primary/30 text-foreground font-semibold'
                    : 'clay-card bg-card text-foreground'
                }`}
              >
                {msg.sender === 'bot' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>

              {/* MCQ Options Rendering with Clay Pill Buttons */}
              {msg.options && msg.options.length > 0 && msg.sender === 'bot' && (
                <div className="flex flex-wrap gap-2 mt-2.5 max-w-[85%] md:max-w-[75%]">
                  {msg.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(opt);
                        setTimeout(() => {
                          const formEvent = new Event('submit', {
                            bubbles: true,
                            cancelable: true,
                          }) as unknown as React.FormEvent;
                          handleSend(formEvent);
                        }, 10);
                      }}
                      disabled={isLoading}
                      className="clay-btn px-3.5 py-1.5 text-xs font-bold rounded-xl text-primary hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="clay-card p-3 flex items-center gap-2.5 text-xs font-medium text-muted-foreground">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span>Computing tax parameters & drafting reply...</span>
              </div>
            </div>
          )}

          {chatState.stage === 'ready' && chatState.checklist.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center pt-3 pb-2"
            >
              <div className="clay-card p-5 text-center max-w-md w-full bg-emerald-500/10 border-emerald-500/30">
                <h3 className="text-sm font-black text-emerald-500 mb-1.5">
                  Pre-filing Assessment Complete!
                </h3>
                <p className="text-xs text-muted-foreground mb-4 font-medium leading-relaxed">
                  Your income sources and required statutory schedules have been verified. Download your personalized filing checklist.
                </p>
                <button
                  onClick={exportPDF}
                  className="clay-btn-emerald py-2.5 px-4 text-xs font-bold inline-flex items-center gap-2 shadow-lg w-full justify-center"
                >
                  <Download size={14} />
                  <span>Download PDF Checklist</span>
                </button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div
          {...getRootProps()}
          className={`p-4 bg-card/60 backdrop-blur-md border-t border-border transition-colors ${
            isDragActive ? 'bg-primary/10 border-primary/40' : ''
          }`}
        >
          <input {...getInputProps()} />

          {isDragActive && (
            <div className="text-center text-primary text-xs font-semibold mb-3 py-2 border-2 border-dashed border-primary/40 rounded-xl bg-primary/5">
              Drop your Form 16 or statement here...
            </div>
          )}

          {file && (
            <div className="flex items-center gap-2 mb-2 px-3 py-1.5 clay-card w-fit text-xs font-semibold mx-auto max-w-4xl">
              {file.type.startsWith('image/') ? (
                <Image size={14} className="text-primary" />
              ) : (
                <FileText size={14} className="text-primary" />
              )}
              <span className="text-foreground truncate max-w-xs">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="text-muted-foreground hover:text-destructive ml-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <button
              onClick={open}
              disabled={isLoading}
              className="clay-btn p-3 rounded-xl text-muted-foreground hover:text-primary transition-all disabled:opacity-50 shrink-0"
              title="Attach statement or Form 16"
            >
              <Paperclip size={18} />
            </button>

            <div className="flex-1 clay-card p-1.5 flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  chatState.stage === 'ready'
                    ? 'Filing computation is ready! You can ask further questions...'
                    : 'Type your answer or upload a financial document...'
                }
                className="w-full bg-transparent px-3 py-1 text-sm text-foreground outline-none placeholder:text-muted-foreground font-medium disabled:opacity-50"
                disabled={isLoading}
              />
            </div>

            <button
              onClick={() => handleSend()}
              disabled={(!input.trim() && !file) || isLoading}
              className="clay-btn-primary p-3 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40"
              title="Send"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
