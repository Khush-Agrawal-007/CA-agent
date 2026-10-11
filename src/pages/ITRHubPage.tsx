// src/pages/ITRHubPage.tsx
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Trash2, ArrowLeft, Bot, Zap, ArrowRight, ShieldCheck, FileCheck, HelpCircle } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

// ── types ─────────────────────────────────────────────────────────────
interface RecentSession {
  id: string;
  date: string; // ISO string stored in localStorage
  itrForm: string | null;
  fields: number; // count of collected fields
  stage: string;
}

// ── local storage helpers ─────────────────────────────────────────────
const SESSIONS_KEY = "ca_agent_itr_sessions";

function loadSessions(): RecentSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── entry point card ──────────────────────────────────────────────────
interface EntryCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  variant: "indigo" | "emerald";
  cta: string;
}

function EntryCard({
  to,
  icon,
  title,
  description,
  badge,
  variant,
  cta,
}: EntryCardProps) {
  const isIndigo = variant === "indigo";

  return (
    <div className="clay-card-interactive p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isIndigo ? "clay-btn-primary text-white" : "clay-btn-emerald text-white"
          }`}
        >
          {icon}
        </div>
        {badge && (
          <span
            className={`clay-pill text-xs font-bold px-3 py-1 ${
              isIndigo
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-base font-extrabold text-foreground mb-1.5">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">{description}</p>
      </div>

      <Link
        to={to}
        className={`mt-auto inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all ${
          isIndigo ? "clay-btn-primary" : "clay-btn-emerald"
        }`}
      >
        <span>{cta}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────
export default function ITRHubPage() {
  const [sessions, setSessions] = useState<RecentSession[]>([]);
  const currentYear = new Date().getFullYear();
  const assessmentYear = `AY ${currentYear}-${String(currentYear + 1).slice(2)}`;

  useEffect(() => {
    setSessions(loadSessions().slice(0, 3)); // show last 3
  }, []);

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    try {
      const raw = localStorage.getItem(SESSIONS_KEY);
      if (raw) {
        let allSessions = JSON.parse(raw);
        allSessions = allSessions.filter((s: any) => s.id !== id);
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(allSessions));
        setSessions(allSessions.slice(0, 3));
      }
    } catch {}
  };

  return (
    <div className="min-h-screen overflow-y-auto scrollbar-thin bg-background p-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-7">
        {/* ── PAGE HEADER ──────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="space-y-1">
            <Link
              to="/chat"
              className="clay-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft size={14} /> Back to Tax Chat
            </Link>
            <h1 className="text-2xl font-black text-foreground">ITR Filing Central</h1>
            <p className="text-xs text-muted-foreground font-medium">
              Statutory income computation and form identification for {assessmentYear}
            </p>
          </div>

          <ThemeToggle />
        </div>

        {/* ── ENTRY POINTS ─────────────────────────────────────── */}
        <div>
          <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3">
            Select Your Filing Workflow
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Chat assistant */}
            <EntryCard
              to="/itr-chat"
              badge="Conversational"
              variant="indigo"
              cta="Start Guided Assistant"
              icon={<Bot size={22} />}
              title="Interactive ITR Assistant"
              description="Guided interview with your CA agent. Answers questions, asks for clarification, ingests your documents, and builds a comprehensive downloadable computation draft."
            />

            {/* Quick analyse */}
            <EntryCard
              to="/itr"
              badge="Instant Scan"
              variant="emerald"
              cta="Run Instant Scanner"
              icon={<Zap size={22} />}
              title="Fast Statement Scanner"
              description="Drag and drop your bank statement PDF or images for 30-second automated anomaly inspection, regime comparisons, and required statutory document checklist."
            />
          </div>
        </div>

        {/* ── WHAT YOU NEED ─────────────────────────────────────── */}
        <div className="clay-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck className="text-emerald-500" size={18} />
            <h2 className="text-sm font-bold text-foreground">Required Checklist Before Filing</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: "🪪", label: "PAN Card", note: "10-character permanent account number" },
              { icon: "📄", label: "Form 16 (Part A & B)", note: "Employer TDS certificate for salaried individuals" },
              { icon: "🏦", label: "Annual Bank Statements", note: "Savings & current accounts (Apr 2024 – Mar 2025)" },
              { icon: "💰", label: "Form 26AS & AIS / TIS", note: "Tax credit & high-value reporting from e-filing portal" },
              { icon: "🏠", label: "Home Loan & Rent Receipts", note: "Interest certificate (Sec 24b) and HRA claims" },
              { icon: "📊", label: "Tax Saving Proofs", note: "80C, 80D, 80CCD (NPS), ELSS mutual fund statements" },
            ].map((item, i) => (
              <div key={i} className="clay-card p-3 flex items-center gap-3">
                <span className="text-xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ITR FORM GUIDE ────────────────────────────────────── */}
        <div className="clay-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="text-primary" size={18} />
            <h2 className="text-sm font-bold text-foreground">Quick Form Selector Guide</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                form: "ITR-1 (Sahaj)",
                badgeBg: "bg-primary/20 text-primary border-primary/30",
                who: "Salaried Individuals",
                rule: "Total income ≤ ₹50 Lakh, 1 house property, other sources (interest). No capital gains.",
              },
              {
                form: "ITR-2",
                badgeBg: "bg-emerald-500/20 text-emerald-500 border-emerald-500/30",
                who: "Capital Gains & Multi-Property",
                rule: "Income > ₹50 Lakh, stocks/mutual fund capital gains, foreign assets. No business income.",
              },
              {
                form: "ITR-3",
                badgeBg: "bg-amber-500/20 text-amber-500 border-amber-500/30",
                who: "Proprietors & Professionals",
                rule: "Has business or profession income with regular balance sheet & Profit/Loss accounting.",
              },
              {
                form: "ITR-4 (Sugam)",
                badgeBg: "bg-purple-500/20 text-purple-400 border-purple-500/30",
                who: "Presumptive Taxation",
                rule: "Small businesses & professionals opting for Sec 44AD / 44ADA deemed profit declarations.",
              },
            ].map((row, i) => (
              <div key={i} className="clay-card p-3.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`clay-pill px-2.5 py-0.5 text-xs font-bold ${row.badgeBg}`}>
                    {row.form}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-semibold">{row.who}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{row.rule}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RECENT SESSIONS ──────────────────────────────────── */}
        {sessions.length > 0 && (
          <div>
            <h2 className="text-xs font-extrabold text-muted-foreground uppercase tracking-wider mb-3">
              Saved Consultation Sessions
            </h2>
            <div className="space-y-2">
              {sessions.map((s, i) => (
                <Link
                  key={i}
                  to={`/itr-chat?sessionId=${s.id}`}
                  className="clay-card-interactive p-3.5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl clay-btn-primary flex items-center justify-center shrink-0">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {s.itrForm ?? "Filing Session In Progress"}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-medium">
                        {s.fields} items recorded · {new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`clay-pill px-2.5 py-0.5 text-[10px] font-bold ${
                        s.stage === "ready"
                          ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                          : "bg-primary/15 text-primary border-primary/30"
                      }`}
                    >
                      {s.stage === "ready" ? "Computation Ready" : "In Progress"}
                    </span>
                    <button
                      onClick={(e) => deleteSession(e, s.id)}
                      className="clay-btn p-1.5 rounded-lg text-muted-foreground hover:text-destructive"
                      title="Delete session"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── DISCLAIMER ───────────────────────────────────────── */}
        <div className="clay-card p-4 bg-amber-500/10 border-amber-500/30 text-amber-500 dark:text-amber-400">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">
              <strong>Statutory Compliance Disclaimer:</strong> CA Agent provides automated estimations and document analysis based on Indian Income Tax Act guidelines. It is not an authorized e-filing intermediary. Please consult with a practicing Chartered Accountant before filing on incometax.gov.in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
