"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import {
  ShieldCheck,
  CreditCard,
  FileUp,
  CheckCircle2,
  ArrowRight,
  Zap,
  History,
  Loader2,
  AlertCircle,
  Scale,
} from "lucide-react";
import withAuth from "@/components/auth/withAuth";

interface CaseData {
  id: number;
  caseNumber: string;
  title: string;
  description: string;
  status: string;
  primaryCounsel: string;
  auditLogs: string[];
  balance: number;
  createdAt: string;
}

function ClientDashboard() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"idle" | "input">("idle");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 1. Hydration Guard: Ensures client and server match on first render
  useEffect(() => {
    setMounted(true);
    const fetchRealCase = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/api/cases/my-case");
        setCaseData(response.data);
      } catch (err: any) {
        setError(err.message || "Could not connect to the LexTracker Vault.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRealCase();
  }, []);

  // 2. Performance: Memoize reversed logs to prevent jitter on re-renders
  const memoizedLogs = useMemo(() => {
    if (!caseData?.auditLogs) return [];
    return [...caseData.auditLogs].reverse();
  }, [caseData?.auditLogs]);

  const getStageIndex = (status: string = "") => {
    const stages = ["PENDING", "DISCOVERY", "HEARING", "JUDGMENT"];
    const index = stages.indexOf(status.toUpperCase());
    return index === -1 ? 0 : index;
  };

  const handlePaymentInitiation = async (network: "MTN" | "Airtel") => {
    const phoneRegex = /^(07|2567)\d{8}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ""))) {
      alert("Please enter a valid Ugandan phone number (e.g., 0772...).");
      return;
    }

    setIsProcessing(true);
    try {
      await api.post("/api/payments/momo-initiate", {
        amount: caseData?.balance,
        phone: phoneNumber,
        network,
        caseId: caseData?.id,
      });
      alert(`STK Push sent to ${phoneNumber}! Check your phone to authorize.`);
      setPaymentStep("idle");
    } catch (err) {
      alert("Mobile Money gateway timed out. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted || isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Synchronizing Vault...
        </p>
      </div>
    );

  if (error || !caseData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 text-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Sync Error
          </h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );

  const currentStage = getStageIndex(caseData.status);

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-12">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Scale className="text-indigo-600" size={28} />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight italic uppercase">
              Transparency
            </h1>
          </div>
          <p className="text-slate-500 font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={18} />{" "}
            {caseData.caseNumber}
          </p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Lead Counsel
          </p>
          <p className="text-slate-900 font-black">
            {caseData.primaryCounsel || "NOT_ASSIGNED"}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* PROGRESS ANALYTICS */}
          <section className="bg-white rounded-[3rem] p-8 lg:p-10 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-10 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Progression Analytics
            </h3>
            <div className="relative flex justify-between items-center px-4">
              <div className="absolute top-6 left-0 w-full h-1 bg-slate-100" />
              {["Filed", "Discovery", "Hearing", "Judgment"].map((stage, i) => (
                <div
                  key={stage}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all duration-500 ${i <= currentStage ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"}`}
                  >
                    {i < currentStage ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <span className="text-sm font-black">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`mt-4 text-[10px] font-black uppercase tracking-widest ${i === currentStage ? "text-indigo-900" : "text-slate-400"}`}
                  >
                    {stage}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* AUDIT SHIELD */}
          <section className="bg-white rounded-[3rem] p-8 lg:p-10 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
              <History size={16} className="text-indigo-600" /> Audit Shield
            </h3>
            <div className="space-y-4">
              {memoizedLogs.length > 0 ? (
                memoizedLogs.map((log, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={i}
                    className="flex items-start gap-4 p-5 bg-slate-50/60 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-colors"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-1.5" />
                    <p className="flex-1 text-sm font-semibold text-slate-800 leading-relaxed">
                      {log}
                    </p>
                    <ArrowRight
                      size={16}
                      className="text-slate-300 group-hover:text-indigo-500 transition-colors"
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 italic">
                  Awaiting registry entries...
                </div>
              )}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">
              Financial Summary
            </h3>
            <p className="text-4xl font-black text-slate-900 mb-1">
              {new Intl.NumberFormat("en-UG", {
                style: "currency",
                currency: "UGX",
                maximumFractionDigits: 0,
              }).format(caseData.balance)}
            </p>
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-8">
              Pending Settlement
            </p>

            <AnimatePresence mode="wait">
              {paymentStep === "idle" ? (
                <button
                  onClick={() => setPaymentStep("input")}
                  className="w-full py-5 bg-indigo-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 transition-all active:scale-95"
                >
                  Settle with MoMo
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <input
                    type="tel"
                    placeholder="07XX XXX XXX"
                    className="w-full p-4 rounded-xl border-2 border-slate-200 font-semibold focus:border-indigo-600 outline-none transition-colors"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handlePaymentInitiation("MTN")}
                      disabled={isProcessing}
                      className="py-4 bg-[#ffcb05] rounded-xl font-black text-[10px] uppercase shadow-sm flex justify-center items-center"
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        "MTN MoMo"
                      )}
                    </button>
                    <button
                      onClick={() => handlePaymentInitiation("Airtel")}
                      disabled={isProcessing}
                      className="py-4 bg-[#ed1c24] text-white rounded-xl font-black text-[10px] uppercase shadow-sm flex justify-center items-center"
                    >
                      {isProcessing ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        "Airtel"
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => setPaymentStep("idle")}
                    className="w-full text-[10px] font-black text-slate-400 uppercase hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* EVIDENCE VAULT - Now with real file trigger */}
          <section className="bg-emerald-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <FileUp
              className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"
              size={120}
            />
            <h3 className="font-black text-lg uppercase mb-2">
              Evidence Vault
            </h3>
            <p className="text-emerald-100/70 text-sm mb-6 leading-relaxed">
              Encrypted upload to Lead Counsel.
            </p>

            <label className="block w-full py-4 bg-white/10 border border-white/20 rounded-2xl font-black text-xs uppercase text-center cursor-pointer hover:bg-white/20 transition-all active:scale-95">
              Secure Upload
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) =>
                  console.log("Evidence selected:", e.target.files?.[0]?.name)
                }
              />
            </label>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default withAuth(ClientDashboard, ["ROLE_CLIENT"]);
