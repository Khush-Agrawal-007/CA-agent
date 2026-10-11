import { useState, useCallback } from 'react';
import { Send, Paperclip, X, FileText, Image } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useChat } from '@/contexts/ChatContext';

const ChatInput = () => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const { sendMessage, isProcessing } = useChat();

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

  const handleSend = async () => {
    if ((!text.trim() && !file) || isProcessing) return;
    const msg = text.trim();
    const f = file;
    setText('');
    setFile(null);
    await sendMessage(msg || (f ? `Analyze this file: ${f.name}` : ''), f || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`p-4 border-t border-border bg-card/60 backdrop-blur-md transition-all ${
        isDragActive ? 'bg-primary/10 border-primary/40' : ''
      }`}
    >
      <input {...getInputProps()} />

      <div className="max-w-4xl mx-auto">
        {isDragActive && (
          <div className="text-center text-primary text-xs font-semibold mb-3 py-3 border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 animate-pulse">
            Drop financial statement or tax document here...
          </div>
        )}

        {file && (
          <div className="flex items-center gap-2.5 mb-3 px-3 py-2 clay-card w-fit text-xs font-semibold">
            {file.type.startsWith('image/') ? (
              <Image size={15} className="text-primary" />
            ) : (
              <FileText size={15} className="text-primary" />
            )}
            <span className="text-foreground truncate max-w-xs">{file.name}</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              ({(file.size / 1024).toFixed(0)} KB)
            </span>
            <button
              onClick={() => setFile(null)}
              className="text-muted-foreground hover:text-destructive transition-colors ml-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="clay-card p-2 flex items-center gap-2">
          <button
            type="button"
            onClick={open}
            className="clay-btn p-2.5 rounded-xl text-muted-foreground hover:text-primary transition-colors shrink-0"
            title="Attach Statement PDF or Image"
          >
            <Paperclip size={18} />
          </button>

          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              file
                ? 'Add specific questions about this document (or press Enter)...'
                : 'Ask any Indian Tax question or upload bank statements...'
            }
            disabled={isProcessing}
            className="flex-1 bg-transparent px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />

          <button
            onClick={handleSend}
            disabled={(!text.trim() && !file) || isProcessing}
            className="clay-btn-primary p-2.5 rounded-xl shrink-0 disabled:opacity-40 flex items-center justify-center transition-all"
            title="Send"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
