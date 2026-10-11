import { motion } from 'framer-motion';
import { Building2, Calendar, TrendingUp, TrendingDown, Wallet, ArrowUpDown, Receipt, IndianRupee, FileSpreadsheet } from 'lucide-react';

export interface BankSummaryData {
  personEntity: string;
  period: string;
  openingBalance: string;
  totalCredits: string;
  totalDebits: string;
  closingBalance: string;
  estimatedAnnualIncome: string;
  estimatedTax: string;
}

interface BankStatementCardProps {
  data: BankSummaryData;
  filename?: string;
}

const StatRow = ({
  icon: Icon,
  label,
  value,
  colorClass,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  colorClass: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay }}
    className="clay-card p-3.5 flex items-center justify-between"
  >
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorClass} bg-current/15 shrink-0`}>
        <Icon size={16} className="text-current" />
      </div>
      <span className="text-xs text-muted-foreground font-semibold">{label}</span>
    </div>
    <span className={`text-sm font-extrabold tabular-nums ${colorClass}`}>{value}</span>
  </motion.div>
);

const BankStatementCard = ({ data, filename }: BankStatementCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="clay-card mt-3 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/15 via-primary/5 to-transparent flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl clay-btn-primary flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">
              {data.personEntity || 'Extracted Bank Statement'}
            </h3>
            {filename && (
              <p className="text-[11px] text-muted-foreground font-medium truncate max-w-xs">{filename}</p>
            )}
          </div>
        </div>

        {data.period && (
          <div className="clay-pill px-3 py-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground shrink-0">
            <Calendar size={12} className="text-primary" />
            <span>{data.period}</span>
          </div>
        )}
      </div>

      {/* Grid of stats */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <StatRow
          icon={TrendingUp}
          label="Total Credits (Deposits)"
          value={data.totalCredits || '₹0'}
          colorClass="text-emerald-500"
          delay={0.05}
        />
        <StatRow
          icon={TrendingDown}
          label="Total Debits (Withdrawals)"
          value={data.totalDebits || '₹0'}
          colorClass="text-rose-500"
          delay={0.1}
        />
        <StatRow
          icon={Wallet}
          label="Opening Balance"
          value={data.openingBalance || '₹0'}
          colorClass="text-foreground"
          delay={0.15}
        />
        <StatRow
          icon={ArrowUpDown}
          label="Closing Balance"
          value={data.closingBalance || '₹0'}
          colorClass="text-foreground"
          delay={0.2}
        />
      </div>

      {/* Estimated Tax Summary Banner */}
      <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/15 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block mb-0.5">
            FY 2024-25 Assessment projection
          </span>
          <p className="text-xs font-medium text-muted-foreground">
            Projected Net Annual Income: <strong className="text-foreground">{data.estimatedAnnualIncome || 'N/A'}</strong>
          </p>
        </div>
        <div className="clay-btn-primary px-4 py-2 rounded-xl text-center self-start sm:self-auto">
          <span className="text-[10px] block opacity-85 font-medium">Estimated New Regime Tax</span>
          <span className="text-sm font-extrabold">{data.estimatedTax || '₹0'}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BankStatementCard;
