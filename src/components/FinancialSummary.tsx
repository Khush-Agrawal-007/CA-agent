import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { FinancialData } from '@/contexts/ChatContext';

interface FinancialSummaryProps {
  data: FinancialData;
  isLoading?: boolean;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const FinancialSummary = ({ data, isLoading }: FinancialSummaryProps) => {
  if (isLoading) {
    return (
      <div className="my-3 clay-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="clay-card p-3 space-y-2">
              <div className="h-3 w-16 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-24 bg-muted rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = [
    {
      label: 'Total Credit',
      value: data.totalCredit,
      icon: TrendingUp,
      color: 'text-emerald-500',
      badgeBg: 'bg-emerald-500/15',
    },
    {
      label: 'Total Debit',
      value: data.totalDebit,
      icon: TrendingDown,
      color: 'text-rose-500',
      badgeBg: 'bg-rose-500/15',
    },
    {
      label: 'Estimated Tax',
      value: data.estimatedTax,
      icon: Receipt,
      color: 'text-primary',
      badgeBg: 'bg-primary/15',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-3"
    >
      <p className="text-[11px] font-extrabold text-muted-foreground mb-2 uppercase tracking-wider">
        Financial Snapshot
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map(({ label, value, icon: Icon, color, badgeBg }) => (
          <div key={label} className="clay-card p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <div className={`w-6 h-6 rounded-lg ${badgeBg} flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
              <span className="text-xs text-muted-foreground font-semibold">{label}</span>
            </div>
            <p className={`text-base font-extrabold tabular-nums ${color}`}>{formatCurrency(value)}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FinancialSummary;
