import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { ArrowLeft, UploadCloud, Loader2, FileText, CheckCircle2, Download, AlertTriangle, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ThemeToggle from '@/components/ThemeToggle';

interface AnalyzeResult {
  analysis_summary: string;
  itr_form: string;
  checklist: string[];
  missing_info: string[];
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function ITRFilingPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    try {
      // 1. Upload the file to extract data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('context', 'itr');

      const uploadRes = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to process document');
      }

      const uploadData = await uploadRes.json();
      const extractedData = uploadData.doc_data || {};

      // 2. Send extracted data for ITR Quick Analysis
      const analyzeRes = await fetch(`${API_BASE}/api/itr/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extracted_data: extractedData }),
      });

      if (!analyzeRes.ok) {
        throw new Error('Failed to analyze ITR requirements');
      }

      const analyzeData: AnalyzeResult = await analyzeRes.json();
      setResult(analyzeData);
      toast.success('Document scan & analysis complete!');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during analysis');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
    maxFiles: 1,
    disabled: isUploading,
  });

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('Income Tax Return (ITR) Checklist', 14, 22);

    doc.setFontSize(12);
    doc.text(`Recommended Form: ${result.itr_form}`, 14, 32);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const splitSummary = doc.splitTextToSize(`Analysis Summary: ${result.analysis_summary}`, 180);
    doc.text(splitSummary, 14, 40);

    let currentY = 40 + splitSummary.length * 5 + 5;

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Required Documents:', 14, currentY);
    currentY += 5;

    const checklistData = result.checklist.map((item) => [item]);

    autoTable(doc, {
      startY: currentY,
      head: [['Document Name']],
      body: checklistData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    if (result.missing_info.length > 0) {
      doc.setFontSize(14);
      doc.text('Additional Details Needed:', 14, currentY);
      currentY += 5;
      const missingData = result.missing_info.map((item) => [item]);
      autoTable(doc, {
        startY: currentY,
        head: [['Detail / Question']],
        body: missingData,
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
      });
    }

    doc.save(`ITR_Checklist_${result.itr_form || 'Unknown'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 overflow-y-auto scrollbar-thin transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-7">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <Link
            to="/itr-hub"
            className="clay-btn inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} /> Back to Hub
          </Link>
          <ThemeToggle />
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Quick ITR Scanner</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium mt-1">
            Drop your Form 16, AIS, or Bank Statement to instantly identify your applicable ITR form and statutory checklist.
          </p>
        </div>

        {/* Upload Area with Claymorphic Bevel */}
        <div
          {...getRootProps()}
          className={`clay-card p-10 text-center transition-all cursor-pointer border-2 border-dashed ${
            isDragActive
              ? 'border-emerald-500 bg-emerald-500/10 scale-[1.01]'
              : 'border-border hover:border-emerald-500/60'
          } ${isUploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />

          <div className="w-16 h-16 rounded-2xl clay-btn-emerald flex items-center justify-center mx-auto mb-4">
            {isUploading ? (
              <Loader2 size={30} className="text-white animate-spin" />
            ) : (
              <UploadCloud size={30} className="text-white drop-shadow-sm" />
            )}
          </div>

          <h3 className="text-base font-bold text-foreground mb-1">
            {isUploading ? 'Analyzing Statement with Gemini OCR...' : 'Click or drop document here'}
          </h3>
          <p className="text-xs text-muted-foreground font-medium">
            {isUploading
              ? 'Cross-referencing tax clauses and salary deductions'
              : 'Supports bank statements & Form 16 (PDF, PNG, JPG up to 10MB)'}
          </p>
        </div>

        {/* Results Area */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {/* Form Recommendation Card */}
            <div className="md:col-span-1 clay-card p-6 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">
                  Recommended Form
                </span>
                <div className="text-4xl font-black text-emerald-500 mb-3 tracking-tight">
                  {result.itr_form}
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                  {result.analysis_summary}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border">
                <Link
                  to="/itr-chat"
                  className="clay-btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={14} />
                  <span>File With AI Assistant</span>
                </Link>
              </div>
            </div>

            {/* Checklist & Missing Info */}
            <div className="md:col-span-2 clay-card p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText size={18} className="text-emerald-500" />
                  <span>Required Statutory Documents</span>
                </h3>
                <button
                  onClick={exportPDF}
                  className="clay-btn-emerald px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
              </div>

              <div>
                {result.checklist.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {result.checklist.map((item, idx) => (
                      <li key={idx} className="clay-card p-3 flex items-start gap-2 text-xs font-semibold text-foreground">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground font-medium">No additional documents required.</p>
                )}
              </div>

              {result.missing_info.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-bold text-amber-500 mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={14} />
                    <span>Missing Details / Verifications Needed</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {result.missing_info.map((info, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
