import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useChat, type UploadedDocItem } from "../contexts/ChatContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { ChevronDown, FileText, TrendingUp, TrendingDown, Banknote, Receipt, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const COLORS = ["#10b981", "#f43f5e", "#f59e0b", "#6366f1"];

function getDocMetrics(doc: UploadedDocItem) {
  if (doc.totalCredits != null || doc.totalDebits != null || doc.estimatedTax != null) {
    return {
      totalCredits: doc.totalCredits ?? 0,
      totalDebits: doc.totalDebits ?? 0,
      estimatedTax: doc.estimatedTax ?? 0,
    };
  }
  const structured = doc.doc_data as Record<string, unknown> | undefined;
  const bank = structured?.bank as Record<string, unknown> | undefined;
  return {
    totalCredits: Number(bank?.total_credits ?? structured?.total_credits ?? 0) || 0,
    totalDebits: Number(bank?.total_debits ?? structured?.total_debits ?? 0) || 0,
    estimatedTax: Number(structured?.estimated_tax_new_regime_fy_2025_26 ?? 0) || 0,
  };
}

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

// ── FlatDoc: doc + which chat it came from ───────────────────────────────────
interface FlatDoc extends UploadedDocItem {
  chatTitle: string;
}

// ── Dropdown ─────────────────────────────────────────────────────────────────
function StatementDropdown({
  docs,
  selected,
  onSelect,
}: {
  docs: FlatDoc[];
  selected: number;
  onSelect: (i: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected_doc = docs[selected];
  const label = selected_doc?.filename ?? `Statement ${selected + 1}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="clay-btn flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-foreground min-w-[220px] max-w-xs transition-all"
      >
        <FileText size={14} className="text-primary shrink-0" />
        <span className="truncate flex-1 text-left">{label}</span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-full min-w-[220px] clay-card p-1 max-h-64 overflow-y-auto">
          {docs.map((doc, i) => (
            <button
              key={i}
              onClick={() => {
                onSelect(i);
                setOpen(false);
              }}
              className={`w-full flex items-start gap-2 px-3 py-2 text-left rounded-xl transition-all ${
                i === selected ? "bg-primary/15 text-primary font-bold" : "hover:bg-muted/60 text-foreground"
              }`}
            >
              <FileText size={13} className={`mt-0.5 shrink-0 ${i === selected ? "text-primary" : "text-muted-foreground"}`} />
              <div className="min-w-0">
                <p className="text-xs truncate font-semibold">
                  {doc.filename ?? `Statement ${i + 1}`}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{doc.chatTitle}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon: Icon,
  accentBg,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accentBg: string;
}) {
  return (
    <div className="clay-card p-4 flex items-center gap-3.5">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${accentBg}`}>
        <Icon size={18} className="text-white drop-shadow-sm" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-semibold truncate">{label}</p>
        <p className="text-base font-extrabold text-foreground tabular-nums mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { conversations } = useChat();
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Flatten every uploaded doc across ALL conversations
  const docs: FlatDoc[] = conversations.flatMap((conv) =>
    (conv.uploadedDocs ?? []).map((d) => ({
      ...d,
      chatTitle: conv.title || "Untitled Chat",
    }))
  );

  const safeIdx = Math.min(selectedIdx, Math.max(0, docs.length - 1));

  if (docs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6 relative transition-colors duration-200">
        <div className="absolute top-6 left-6 flex items-center gap-3">
          <Link to="/chat" className="clay-btn p-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <ArrowLeft size={16} />
            <span>Back to Chat</span>
          </Link>
        </div>
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="w-16 h-16 rounded-2xl clay-btn-primary flex items-center justify-center">
          <FileText size={28} className="text-white drop-shadow-sm" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No financial statements uploaded yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
          Upload a bank statement PDF or image in the tax consultation chat to see interactive visualizations and tax breakdowns.
        </p>
        <Link to="/chat" className="clay-btn-primary px-6 py-2.5 text-xs font-bold tracking-wide">
          Go to Tax Chat
        </Link>
      </div>
    );
  }

  const doc = docs[safeIdx];
  const { totalCredits, totalDebits, estimatedTax } = getDocMetrics(doc);
  const netCashFlow = totalCredits - totalDebits;

  const barData = [
    { name: "Credits", value: totalCredits, fill: "#10b981" },
    { name: "Debits", value: totalDebits, fill: "#f43f5e" },
    { name: "Est. Tax", value: estimatedTax, fill: "#f59e0b" },
  ];

  const pieData = [
    { name: "Net Income", value: Math.max(0, netCashFlow) },
    { name: "Total Debits", value: totalDebits },
    ...(estimatedTax > 0 ? [{ name: "Est. Tax", value: estimatedTax }] : []),
  ].filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-background p-6 space-y-6 overflow-y-auto max-w-6xl mx-auto transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link to="/chat" className="clay-btn p-2 rounded-xl text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Financial & Tax Analytics</h1>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {docs.length} statement{docs.length !== 1 ? "s" : ""} indexed across your tax consultations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatementDropdown docs={docs} selected={safeIdx} onSelect={setSelectedIdx} />
          <ThemeToggle />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Credits (Deposits)" value={fmt(totalCredits)} icon={TrendingUp} accentBg="bg-emerald-500" />
        <KpiCard label="Total Debits (Expenses)" value={fmt(totalDebits)} icon={TrendingDown} accentBg="bg-rose-500" />
        <KpiCard label="Net Annual Inflow" value={fmt(netCashFlow)} icon={Banknote} accentBg={netCashFlow >= 0 ? "clay-btn-primary" : "bg-amber-500"} />
        <KpiCard label="Est. Tax Liability (FY 25)" value={fmt(estimatedTax)} icon={Receipt} accentBg="bg-amber-500" />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bar chart */}
        <div className="clay-card p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Financial Balance Comparison
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "currentColor" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "currentColor" }}
                axisLine={false}
                tickLine={false}
                width={70}
                tickFormatter={(v) => "₹" + Number(v).toLocaleString("en-IN")}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 14,
                  fontSize: 12,
                  backgroundColor: "var(--card)",
                  borderColor: "var(--border)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                }}
                formatter={(v: unknown) => fmt(Number(v))}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="clay-card p-5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
            Income vs Outflow Allocation
          </p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 14,
                    fontSize: 12,
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                  }}
                  formatter={(v: unknown) => fmt(Number(v))}
                />
                <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-muted-foreground font-medium">
              No breakdown available for this statement
            </div>
          )}
        </div>
      </div>

      <div className="clay-card p-3.5 flex items-center justify-between text-xs font-semibold">
        <span className="text-muted-foreground">Inspected File:</span>
        <span className="text-primary font-bold">{doc.filename}</span>
      </div>
    </div>
  );
}
