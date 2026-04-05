"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  getCaseDocuments,
  uploadEvidence,
  getDocumentDownloadUrl,
  CaseDocument,
} from "@/services/documentService";
import {
  Flame,
  Sparkles,
  Infinity,
  Component,
  ArrowUpRight,
  Mountain,
  Orbit,
  ChevronLeft,
  FileText,
  Send,
  Plus,
  Loader2,
  X,
  ShieldCheck,
  Scale,
  CheckCircle2,
} from "lucide-react";

// --- The Optimized Stages (Matches your original LEGAL_STAGES) ---
const LEGAL_STAGES = [
  "PENDING",
  "AT ISSUE",
  "IN DISCOVERY",
  "IN TRIAL",
  "VERDICT REACHED",
  "JUDGEMENT ENTERED",
  "ON APPEAL",
  "REMANDED",
  "CLOSED",
  "DISMISSED",
];

export default function WholesomeHadesVault({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const caseId = id ? Number(id) : null;

  // --- State Management ---
  const [caseData, setCaseData] = useState<any>(null);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState("");

  // Modal & Upload State
  const [showCertifyModal, setShowCertifyModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceOrigin, setSourceOrigin] = useState("");

  // Current Coordinates Card State
  const [coordinatesStatus, setCoordinatesStatus] = useState({
    message: "Sector_Elysium_Optima",
    isSuccess: false,
    filename: "",
  });

  // Helper to safely parse backend auditLogs
  const parseLog = (log: any): { content: string; timestamp: string } => {
    if (typeof log === "string") {
      const lastBracket = log.lastIndexOf(" [");
      if (lastBracket > -1 && log.endsWith("]")) {
        return {
          content: log.substring(0, lastBracket),
          timestamp: log.substring(lastBracket + 2, log.length - 1),
        };
      }
      return { content: log, timestamp: "" };
    }
    return log || { content: "", timestamp: "" };
  };

  // --- Data Fetching ---
  const fetchAllData = useCallback(async () => {
    if (!caseId) return;
    try {
      setLoading(true);
      const [caseRes, docsRes] = await Promise.all([
        api.get(`/api/cases/${caseId}`),
        getCaseDocuments(caseId),
      ]);

      setCaseData(caseRes.data);
      setDocuments(docsRes);
      setError(false);
    } catch (err) {
      console.error("Vault Access Failure:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // --- Actions ---
  const handleUpload = async () => {
    if (!selectedFile || !sourceOrigin.trim() || !caseId) return;

    try {
      setActionLoading(true);
      const newDoc = await uploadEvidence(caseId, selectedFile, sourceOrigin);

      // Update Coordinates Card with success feedback
      setCoordinatesStatus({
        message: "Document Certified • Chain Secured",
        isSuccess: true,
        filename: selectedFile.name,
      });

      setDocuments((prev) => [newDoc, ...prev]);
      setShowCertifyModal(false);
      setSelectedFile(null);
      setSourceOrigin("");

      await fetchAllData();

      // Auto-reset coordinates card after 6 seconds
      setTimeout(() => {
        setCoordinatesStatus({
          message: "Sector_Elysium_Optima",
          isSuccess: false,
          filename: "",
        });
      }, 6000);
    } catch (err) {
      console.error("Certification failed. Integrity check not passed.");
      setCoordinatesStatus({
        message: "Upload Failed • Integrity Check Failed",
        isSuccess: false,
        filename: "",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!caseId) return;
    try {
      setActionLoading(true);
      await api.put(`/api/cases/${caseId}/status`, { status: newStatus });
      await fetchAllData();
    } catch (err) {
      console.error("Status transition failed");
    } finally {
      setActionLoading(false);
    }
  };

  const addAuditEntry = async () => {
    if (!note.trim() || !caseId) return;
    try {
      setActionLoading(true);
      await api.post(`/api/cases/${caseId}/audit`, { note });
      setNote("");
      await fetchAllData();
    } catch (err) {
      console.error("Audit recording failed");
    } finally {
      setActionLoading(false);
    }
  };

  // --- View States ---
  if (loading)
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-6">
        <Orbit className="w-12 h-12 text-orange-500 animate-spin" />
        <span className="font-black text-orange-500 uppercase tracking-[0.4em] text-[10px] animate-pulse">
          Synchronizing Ethereal Ledger...
        </span>
      </div>
    );

  if (error || !caseData)
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-8">
        <div className="bg-stone-900/50 p-12 rounded-[3.5rem] border border-red-900/30 text-center max-w-sm backdrop-blur-3xl">
          <Scale size={48} className="mx-auto mb-6 text-red-600" />
          <h2 className="text-2xl font-black text-stone-100 uppercase italic tracking-tighter">
            Forbidden Entry
          </h2>
          <p className="text-stone-500 text-[10px] font-bold mt-4 uppercase tracking-widest leading-loose">
            Your soul link to this dossier has been severed by the overseers.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-8 w-full bg-stone-100 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 hover:text-white transition-all"
          >
            Return to the Crossing
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] text-stone-200 font-sans selection:bg-orange-500/30">
      {/* AMBIENT SILICON VALLEY ARTWORK BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[50%] bg-blue-900/10 blur-[100px] rounded-full" />
      </div>

      {/* MODAL: THE CERTIFICATION VOID */}
      {showCertifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="bg-[#0a0a0a] w-full max-w-md rounded-[3.5rem] border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-8 flex justify-between items-center text-white">
              <span className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <ShieldCheck size={16} /> Certify Soul Fragment
              </span>
              <button onClick={() => setShowCertifyModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="p-10 space-y-6">
              <div className="bg-stone-900/50 p-5 rounded-3xl border border-white/5">
                <p className="text-[10px] font-black text-stone-600 uppercase mb-1">
                  Target Identity
                </p>
                <p className="text-sm font-bold text-stone-200 truncate">
                  {selectedFile?.name}
                </p>
              </div>
              <textarea
                value={sourceOrigin}
                onChange={(e) => setSourceOrigin(e.target.value)}
                placeholder="Declare the origin of this fragment..."
                className="w-full bg-stone-900/50 rounded-3xl p-6 text-xs font-medium outline-none h-32 border border-white/5 focus:border-orange-500/50 transition-all resize-none placeholder:text-stone-700"
              />
              <button
                onClick={handleUpload}
                disabled={actionLoading || !sourceOrigin.trim()}
                className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white transition-all disabled:opacity-20"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Commit to Perpetual Record"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVIGATION BAR */}
      <nav className="relative z-10 max-w-7xl mx-auto px-8 py-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.4)]">
            <Component className="text-white" size={24} />
          </div>
          <span className="font-black tracking-[0.2em] uppercase text-xs text-stone-500 italic">
            Hades.io
          </span>
        </div>
        <button
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-stone-600 hover:text-white transition-colors uppercase text-[10px] font-black tracking-[0.3em]"
        >
          <ChevronLeft
            size={14}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Exit to Registry
        </button>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-12 gap-12 pb-20">
        {/* LEFT SECTION: CONTENT & PAINTINGS */}
        <div className="col-span-8 space-y-12">
          {/* HERO DOSSIER PAINTING */}
          <div className="relative h-[520px] rounded-[4.5rem] overflow-hidden border border-white/5 shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/10 to-transparent z-10" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />

            <div className="absolute bottom-12 left-12 z-20 pr-12">
              <div className="flex items-center gap-4 mb-8">
                <span className="px-5 py-2 bg-orange-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                  {caseData.status}
                </span>
                <div className="px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 font-mono text-[10px] text-stone-400">
                  ID_{caseData.caseNumber}
                </div>
              </div>
              <h1 className="text-7xl font-bold tracking-tighter text-white mb-6 italic leading-none uppercase">
                {caseData.title}
              </h1>
              <p className="text-stone-400 max-w-2xl font-medium leading-relaxed italic text-xl border-l-2 border-orange-500/40 pl-8">
                {caseData.description ||
                  "The silence of the void remains unbroken."}
              </p>
            </div>
          </div>

          {/* QUICK ACTIONS GRID */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-stone-900/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] hover:bg-stone-900/60 transition-all">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-stone-500 text-[10px] font-black uppercase tracking-[0.3em]">
                  Lifecycle State
                </h2>
                <div className="text-orange-600/50">
                  <Flame size={20} />
                </div>
              </div>
              <div className="relative">
                <select
                  onChange={(e) => updateStatus(e.target.value)}
                  value={caseData.status}
                  className="w-full bg-[#0a0a0a] border-2 border-white/5 rounded-2xl p-5 text-xs font-black text-stone-200 outline-none focus:border-orange-500 transition-all appearance-none cursor-pointer shadow-inner uppercase tracking-widest"
                >
                  {LEGAL_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-700">
                  <ArrowUpRight size={14} />
                </div>
              </div>
            </div>

            <div
              onClick={() => document.getElementById("file-input")?.click()}
              className="bg-stone-900/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[3.5rem] group cursor-pointer hover:bg-orange-600/10 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-stone-500 text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-orange-400 transition-colors">
                  Manifest Fragment
                </h2>
                <Plus
                  size={20}
                  className="text-stone-800 group-hover:text-orange-500 transition-colors"
                />
              </div>
              <p className="text-white font-bold text-2xl tracking-tight uppercase italic group-hover:translate-x-1 transition-transform">
                Certify Evidence
              </p>
              <input
                id="file-input"
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setSelectedFile(e.target.files[0]);
                    setShowCertifyModal(true);
                  }
                }}
              />
            </div>
          </div>

          {/* THE FRAGMENT VAULT (Documents) */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h3 className="text-stone-600 text-[10px] font-black uppercase tracking-[0.5em]">
                Digital Evidence Ledger
              </h3>
              <div className="h-px flex-1 mx-8 bg-stone-900" />
              <span className="text-[10px] font-mono text-orange-600/50 tracking-tighter">
                {documents.length} SECURED
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group flex justify-between items-center p-10 bg-stone-900/20 border border-white/5 rounded-[3rem] hover:border-orange-500/20 transition-all"
                >
                  <div className="flex items-center gap-8">
                    <div className="p-5 bg-stone-900 text-stone-700 group-hover:text-orange-600 transition-colors rounded-3xl border border-white/5">
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="font-black text-stone-100 uppercase tracking-tight text-lg">
                        {doc.fileName}
                      </p>
                      <p className="text-[10px] font-mono text-stone-600 mt-2 italic uppercase tracking-tighter">
                        Origin: {doc.sourceOrigin}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="hidden lg:block text-right">
                      <p className="text-[9px] font-black text-stone-800 uppercase tracking-widest mb-1">
                        SHA-256 Fingerprint
                      </p>
                      <p className="text-[10px] font-mono text-stone-500 group-hover:text-stone-300 transition-colors">
  {doc.fileHash ? doc.fileHash.substring(0, 24) : 'No hash available'}...
</p>
                    </div>
                    <button
                      onClick={() =>
                        window.open(getDocumentDownloadUrl(doc.id), "_blank")
                      }
                      className="p-4 bg-white/5 hover:bg-orange-600 text-stone-500 hover:text-white rounded-2xl transition-all shadow-xl"
                    >
                      <ArrowUpRight size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: THE CONCIERGE & LOGS */}
        <div className="col-span-4 space-y-8">
          <div className="bg-gradient-to-b from-orange-600/30 to-transparent p-[1px] rounded-[4rem] shadow-2xl">
            <div className="bg-[#0a0a0a] rounded-[3.9rem] p-12 border border-white/5 h-[800px] flex flex-col">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3.5 bg-stone-900 rounded-2xl text-orange-500 animate-pulse border border-white/5">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-white text-xl font-bold tracking-tight">
                    Audit Concierge
                  </h3>
                  <p className="text-[9px] font-black text-stone-600 uppercase tracking-widest">
                    Post-Life Optimization
                  </p>
                </div>
              </div>

              {/* LOG INPUT */}
              <div className="relative mb-12">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAuditEntry()}
                  placeholder="Whisper into the record..."
                  className="w-full bg-[#0d0d0d] border border-white/5 p-6 pr-16 rounded-[2rem] text-xs font-medium outline-none focus:border-orange-500/40 transition-all placeholder:text-stone-800 text-stone-200"
                />
                <button
                  onClick={addAuditEntry}
                  disabled={actionLoading || !note.trim()}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-orange-600 hover:scale-110 transition-transform disabled:opacity-0"
                >
                  <Send size={22} />
                </button>
              </div>

              {/* THE ETERNAL LEDGER */}
              <div className="flex-1 space-y-10 overflow-y-auto pr-4 custom-scrollbar">
                {caseData.auditLogs
                  ?.slice()
                  .reverse()
                  .map((log: any, i: number) => {
                    const parsed = parseLog(log);
                    return (
                      <div
                        key={i}
                        className="relative pl-8 border-l border-stone-900 py-1 group"
                      >
                        <div className="absolute -left-[5.5px] top-4 w-2.5 h-2.5 rounded-full bg-stone-900 group-hover:bg-orange-500 transition-all duration-500 border-2 border-black" />
                        <p className="text-sm text-stone-400 font-medium leading-relaxed italic group-hover:text-stone-100 transition-colors tracking-tight">
                          "{parsed.content}"
                        </p>
                        <p className="text-[10px] font-mono text-stone-700 mt-3 uppercase tracking-tighter font-bold">
                          {parsed.timestamp}
                        </p>
                      </div>
                    );
                  })}

                {(!caseData.auditLogs || caseData.auditLogs.length === 0) && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <Infinity size={48} className="mb-4 text-stone-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                      Genesis Block Pending
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-10 pt-10 border-t border-white/5">
                <p className="text-[10px] font-black text-stone-800 uppercase mb-4 tracking-widest">
                  Overseer Assignment
                </p>
                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center font-black text-white text-xs">
                    {caseData.primaryCounsel?.charAt(0) || "U"}
                  </div>
                  <p className="text-stone-200 font-bold text-sm tracking-tight italic">
                    {caseData.primaryCounsel || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* UPDATED CURRENT COORDINATES CARD */}
          <div
            className={`bg-stone-900/40 border p-12 rounded-[4rem] text-center backdrop-blur-3xl relative overflow-hidden group transition-all duration-500 ${
              coordinatesStatus.isSuccess
                ? "border-emerald-500/50 bg-emerald-950/30"
                : "border-white/5"
            }`}
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80')] bg-cover opacity-5 grayscale group-hover:scale-110 transition-transform duration-1000" />

            <div className="relative z-10">
              {coordinatesStatus.isSuccess ? (
                <CheckCircle2
                  className="mx-auto text-emerald-500 mb-6"
                  size={48}
                />
              ) : (
                <Mountain
                  className="mx-auto text-stone-800 mb-8 group-hover:text-orange-900 transition-colors"
                  size={48}
                />
              )}

              <h4 className="text-stone-600 text-[10px] font-black uppercase tracking-[0.4em] mb-3 relative z-10">
                Current Coordinates
              </h4>

              <p
                className={`font-mono text-sm uppercase italic tracking-widest transition-colors ${
                  coordinatesStatus.isSuccess
                    ? "text-emerald-400"
                    : "text-stone-300"
                }`}
              >
                {coordinatesStatus.message}
              </p>

              {coordinatesStatus.filename && (
                <p className="text-[10px] text-emerald-500 mt-2 font-medium">
                  {coordinatesStatus.filename}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
