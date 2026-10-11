import { Brain } from 'lucide-react';

const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: { icon: 18, text: 'text-base', padding: 'p-1.5' },
    md: { icon: 22, text: 'text-xl', padding: 'p-2' },
    lg: { icon: 32, text: 'text-3xl', padding: 'p-3' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`clay-btn-primary rounded-2xl ${s.padding} flex items-center justify-center`}>
        <Brain size={s.icon} className="text-white drop-shadow-sm" />
      </div>
      <span className={`font-extrabold tracking-tight ${s.text}`}>
        <span className="gradient-text font-black">CA_AI</span>
        <span className="text-foreground/80 font-semibold ml-1.5">Agent</span>
      </span>
    </div>
  );
};

export default Logo;
