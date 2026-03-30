"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import {
  Scale,
  Plus,
  FileText,
  ShieldCheck,
  X,
  Trash2,
  Search,
  AlertTriangle,
  LogOut,
  Paperclip,
  CheckCircle2,
  FileDown,
  Eye,
  ChevronRight,
  User,
  Mail,
  Loader2,
  TrendingUp,
  Printer,
  Moon,
  Sun,
  Filter,
  Info,
  Sparkles,
  Send,
  Calendar,
  Phone,
  MapPin,
  Cake,
  FileCheck,
  Stamp,
  Download,
} from "lucide-react";

// --- TYPES ---
interface CaseData {
  id: string;
  title: string;
  caseNumber: string;
  description: string;
  status: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientLocation?: string;
  clientAge?: number;
  clientDob?: string;
  createdAt?: string;
  nextHearingDate?: string;
  caseStage?: number;
}

interface GeneratedDocument {
  id: number;
  fileName: string;
  documentType: string;
  documentCategory: string;
  certified: boolean;
  certifiedAt?: string;
  certifiedBy?: string;
  fileHash: string;
  uploadedAt: string;
  uploadedBy: string;
  fileSize: number;
  displayDocumentType?: string;
  verificationCode?: string;
  verificationUrl?: string;
}
export default function LeviathanLedger() {
  const router = useRouter();

  // --- CORE STATE ---
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Richard Blaire");

  // --- UI & MODAL STATE ---
  const [modals, setModals] = useState({ create: false, delete: false });
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<CaseData | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [auditInput, setAuditInput] = useState("");
  
  // --- Document Generation State ---
  const [generating, setGenerating] = useState<string | null>(null);
  const [certifying, setCertifying] = useState<number | null>(null);
  const [caseDocuments, setCaseDocuments] = useState<GeneratedDocument[]>([]);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedCaseForDocs, setSelectedCaseForDocs] = useState<CaseData | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  // --- FORM STATE - UPDATED with all new fields ---
  const [formData, setFormData] = useState({
    title: "",
    caseNumber: "",
    description: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientLocation: "",
    clientAge: "",
    clientDob: "",
    status: "PENDING",
    nextHearingDate: "",
    caseStage: 0,
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    setMounted(true);

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }

    const storedUser = localStorage.getItem("userName");
    if (storedUser) setUserName(storedUser);

    fetchCases();
  }, []);

  // Apply dark mode class to html element when darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (modals.create) {
      const year = new Date().getFullYear();
      const random = Math.floor(1000 + Math.random() * 9000);
      setFormData((prev) => ({
        ...prev,
        caseNumber: `LEX-UG-${year}-${random}-KLA`,
      }));
    }
  }, [modals.create]);

  // Auto-calculate age from DOB
  useEffect(() => {
    if (formData.clientDob) {
      const birthDate = new Date(formData.clientDob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age > 0 && age < 120) {
        setFormData((prev) => ({ ...prev, clientAge: age.toString() }));
      }
    }
  }, [formData.clientDob]);

  // --- API ACTIONS ---
  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/cases");
      setCases(res.data);
      console.log("Fetched cases:", res.data);
      const statusCount: Record<string, number> = {};
      res.data.forEach((case_: CaseData) => {
        statusCount[case_.status] = (statusCount[case_.status] || 0) + 1;
      });
      console.log("Status distribution:", statusCount);
    } catch (err) {
      console.error("Registry sync failed");
    } finally {
      setLoading(false);
    }
  };

const fetchCaseDocuments = async (caseId: string) => {
  setLoadingDocuments(true);
  try {
    const response = await api.get(`/api/generate/case/${caseId}`);
    setCaseDocuments(response.data || []);
  } catch (err) {
    console.error("Failed to fetch documents:", err);
    setCaseDocuments([]);
  } finally {
    setLoadingDocuments(false);
  }
};

const generateDocument = async (caseId: string, documentType: string) => {
  setGenerating(documentType);
  try {
    const response = await api.post(`/api/generate/${documentType}/${caseId}`, {}, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    const fileName = `${documentType}_${caseId}_DRAFT.pdf`;
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    await fetchCaseDocuments(caseId);
    alert(`${documentType.toUpperCase()} DRAFT generated successfully!`);
  } catch (err) {
    console.error("Generation failed:", err);
    alert("Failed to generate document.");
  } finally {
    setGenerating(null);
  }
};

const certifyDocument = async (documentId: number, caseId: string) => {
  setCertifying(documentId);
  try {
    const response = await api.post(`/api/generate/certify/${documentId}`);
    if (response.data) {
      alert(`Document certified!\nVerification Code: ${response.data.verificationCode}`);
      await fetchCaseDocuments(caseId);
    }
  } catch (err) {
    console.error("Certification failed:", err);
    alert("Failed to certify document.");
  } finally {
    setCertifying(null);
  }
};

const downloadDocument = async (documentId: number, fileName: string) => {
  setDownloading(documentId);
  try {
    const response = await api.get(`/api/generate/download/${documentId}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download document.");
  } finally {
    setDownloading(null);
  }
};

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        caseNumber: formData.caseNumber,
        title: formData.title,
        description: formData.description,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientLocation: formData.clientLocation,
        clientAge: formData.clientAge ? parseInt(formData.clientAge) : null,
        clientDob: formData.clientDob || null,
        status: formData.status,
        nextHearingDate: formData.nextHearingDate || null,
        caseStage: formData.caseStage,
      };

      console.log("Sending case payload:", payload);

      const formPayload = new FormData();
      const jsonBlob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      formPayload.append("caseData", jsonBlob);

      const res = await api.post("/api/cases", formPayload);

      console.log("Case created successfully:", res.data);

      setCases([res.data, ...cases]);
      setModals({ ...modals, create: false });

      // Reset form
      setFormData({
        title: "",
        caseNumber: "",
        description: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientLocation: "",
        clientAge: "",
        clientDob: "",
        status: "PENDING",
        nextHearingDate: "",
        caseStage: 0,
      });
    } catch (err: any) {
      console.error("Create case failed:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      alert(
        "Encryption Error: Failed to write to ledger. Check console for details.",
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCase = async () => {
    if (!caseToDelete) return;
    try {
      await api.delete(`/api/cases/${caseToDelete.id}`);
      setCases(cases.filter((c) => c.id !== caseToDelete.id));
      setModals({ ...modals, delete: false });
      setCaseToDelete(null);
    } catch (err) {
      alert("Deletion Protocol Failed.");
    }
  };

  const handleCertify = async (id: string) => {
    try {
      const res = await api.patch(`/api/cases/${id}`, { status: "SECURED" });
      setCases(cases.map((c) => (c.id === id ? res.data : c)));
      setSelectedCase(res.data);
    } catch (err) {
      console.error("Certification failed");
    }
  };

  const handlePostAudit = () => {
    if (!auditInput.trim()) return;
    console.log("Audit Entry Recorded:", auditInput);
    setAuditInput("");
  };

  const openDocumentsModal = async (caseItem: CaseData) => {
    setSelectedCaseForDocs(caseItem);
    await fetchCaseDocuments(caseItem.id);
    setShowDocumentsModal(true);
  };

  // --- SEARCH & STATS ---
  const filteredCases = useMemo(
    () =>
      cases.filter(
        (c) =>
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.clientName &&
            c.clientName.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [cases, searchQuery],
  );

  const stats = useMemo(() => {
    const pending = cases.filter((c) => c.status === "PENDING").length;
    const active = cases.filter(
      (c) =>
        c.status === "ACTIVE" ||
        c.status === "AT ISSUE" ||
        c.status === "IN DISCOVERY" ||
        c.status === "IN TRIAL",
    ).length;
    const secured = cases.filter(
      (c) =>
        c.status === "SECURED" ||
        c.status === "VERDICT REACHED" ||
        c.status === "JUDGEMENT ENTERED",
    ).length;
    const closed = cases.filter(
      (c) =>
        c.status === "CLOSED" ||
        c.status === "DISMISSED" ||
        c.status === "REMANDED",
    ).length;

    return {
      total: cases.length,
      pending,
      active,
      secured,
      closed,
      completionRate:
        cases.length > 0
          ? Math.round(((secured + closed) / cases.length) * 100)
          : 0,
    };
  }, [cases]);

  const handleThemeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen transition-colors duration-500 bg-[#F9FBFC] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="min-h-screen">
        {/* --- NAVIGATION BAR --- */}
        <nav className="print:hidden sticky top-0 z-[100] bg-white/80 dark:bg-[#090B10]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-xl shadow-blue-500/20">
              <Scale size={22} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight leading-none uppercase">
                Leviathan
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-[0.2em] uppercase">
                Master Ledger
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={handleThemeToggle}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-black tracking-tight">
                {userName}
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Lead Counsel
              </span>
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                router.push("/");
              }}
              className="p-2.5 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </nav>

        <main className="max-w-[1400px] mx-auto p-6 md:p-12 lg:p-16">
          {/* --- HEADER --- */}
          <header className="print:hidden flex flex-col xl:flex-row justify-between items-start xl:items-center mb-16 gap-8">
            <div className="space-y-2">
              <h1 className="text-6xl font-black tracking-tighter dark:text-white">
                The Vault
              </h1>
              <div className="flex items-center gap-3">
                <span className="h-1 w-12 bg-blue-600 rounded-full" />
                <p className="text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-[0.3em]">
                  Central Case Registry
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 w-full xl:w-auto">
              <div className="relative flex-1 min-w-[350px]">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"
                  size={20}
                />
                <input
                  placeholder="QUERY REGISTRY..."
                  className="pl-16 pr-8 py-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50 outline-none w-full shadow-sm focus:ring-4 ring-blue-500/5 transition-all font-bold text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setModals({ ...modals, create: true })}
                className="px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                + Initialize Dossier
              </button>
            </div>
          </header>

          {/* --- ANALYTICS --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <StatCard
              label="Pending Review"
              value={stats.pending}
              trend={`${stats.pending} cases`}
              color="yellow"
              icon="⏳"
            />
            <StatCard
              label="Active Litigation"
              value={stats.active}
              trend={`${stats.active} in progress`}
              color="blue"
              icon="⚖️"
            />
            <StatCard
              label="Secured/Resolved"
              value={stats.secured}
              trend={`${stats.secured} concluded`}
              color="emerald"
              icon="✅"
            />
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Case Completion
                </p>
                <p className="text-4xl font-black text-slate-800 dark:text-white">
                  {stats.completionRate}%
                </p>
                <p className="text-[9px] text-slate-500 mt-1 font-bold">
                  {stats.secured + stats.closed} of {stats.total} resolved
                </p>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    className="text-slate-200 dark:text-slate-700"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="6"
                    strokeDasharray={`${stats.completionRate * 1.76} 176`}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black">
                    {stats.completionRate}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* --- LEDGER TABLE WITH DOCUMENT BUTTONS --- */}
          <div className="bg-white dark:bg-[#0F1219] rounded-[3rem] border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                    <th className="px-12 py-8">Reference</th>
                    <th className="px-12 py-8">Case Identity</th>
                    <th className="px-12 py-8">Client</th>
                    <th className="px-12 py-8">Status</th>
                    <th className="px-12 py-8 text-center">Documents</th>
                    <th className="px-12 py-8 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center">
                        <Loader2
                          className="animate-spin inline text-blue-600"
                          size={40}
                        />
                      </td>
                    </tr>
                  ) : filteredCases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-32 text-center text-slate-500 font-bold uppercase tracking-widest"
                      >
                        No Records Found
                      </td>
                    </tr>
                  ) : (
                    filteredCases.map((c) => (
                      <tr
                        key={c.id}
                        className="group hover:bg-blue-50/40 dark:hover:bg-blue-600/5 transition-all cursor-pointer"
                        onClick={() => setSelectedCase(c)}
                      >
                        <td className="px-12 py-8 font-mono text-[11px] text-blue-600 dark:text-blue-400 font-black tracking-tighter">
                          {c.caseNumber}
                        </td>
                        <td className="px-12 py-8">
                          <p className="font-black text-slate-800 dark:text-slate-100 text-[15px] tracking-tight mb-1">
                            {c.title}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold truncate max-w-[250px]">
                            {c.description}
                          </p>
                        </td>
                        <td className="px-12 py-8 text-sm font-bold text-slate-600 dark:text-slate-400">
                          {c.clientName || "UNSPECIFIED"}
                        </td>
                        <td className="px-12 py-8">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-12 py-8 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openDocumentsModal(c)}
                            className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                            title="View/Generate Documents"
                          >
                            <FileText size={18} />
                          </button>
                        </td>
                        <td
                          className="px-12 py-8 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              setCaseToDelete(c);
                              setModals({ ...modals, delete: true });
                            }}
                            className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-2xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* --- DOCUMENTS MODAL --- */}
        <AnimatePresence>
          {showDocumentsModal && selectedCaseForDocs && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 print:hidden">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={() => setShowDocumentsModal(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
              >
                <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black">Case Documents</h2>
                    <p className="text-xs text-slate-500">
                      {selectedCaseForDocs.caseNumber} - {selectedCaseForDocs.title}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDocumentsModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* Document Generation Buttons */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                      Generate New Document
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { type: "notice", label: "Notice of Intention", icon: FileText },
                        { type: "summons", label: "Summons to File Defence", icon: FileCheck },
                        { type: "originating", label: "Originating Summons", icon: Scale },
                        { type: "directions", label: "Summons for Directions", icon: ChevronRight },
                        { type: "extension", label: "Extension of Time", icon: Calendar },
                      ].map((doc) => (
                        <button
                          key={doc.type}
                          onClick={() => generateDocument(selectedCaseForDocs.id, doc.type)}
                          disabled={generating === doc.type}
                          className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all disabled:opacity-50 group"
                        >
                          <div className="flex items-center gap-2">
                            <doc.icon size={16} className="text-blue-600" />
                            <span className="text-xs font-medium">{doc.label}</span>
                          </div>
                          {generating === doc.type ? (
                            <Loader2 size={14} className="animate-spin text-blue-600" />
                          ) : (
                            <span className="text-[9px] font-bold text-blue-600 group-hover:text-blue-700">Generate</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Existing Documents - WITH VERIFY & SEAL BUTTON */}
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                      Generated Documents
                    </h3>
                    {caseDocuments.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm">
                        No documents generated yet. Generate a document above.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {caseDocuments.map((doc) => {
                          const isDraft = !doc.certified;
                          return (
                            <div
                              key={doc.id}
                              className={`flex items-center justify-between p-4 rounded-xl border ${
                                isDraft
                                  ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                                  : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                              }`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <FileText size={16} className={isDraft ? "text-amber-600" : "text-emerald-600"} />
                                  <span className="font-semibold text-sm">
                                    {doc.displayDocumentType || doc.documentType?.replace(/_/g, " ")}
                                  </span>
                                  {isDraft ? (
                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                                      <Stamp size={10} /> DRAFT
                                    </span>
                                  ) : (
                                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                                      <CheckCircle2 size={10} /> CERTIFIED
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-1">
  Generated: {new Date(doc.uploadedAt).toLocaleString()}
  {doc.uploadedBy && <span className="ml-2">by: {doc.uploadedBy}</span>}
</p>
                                {doc.certified && doc.certifiedBy && (
                                  <p className="text-[9px] text-emerald-600 mt-1 flex items-center gap-1">
                                    <Stamp size={10} /> Sealed by: {doc.certifiedBy}
                                  </p>
                                )}
                                {doc.certified && doc.verificationCode && (
                                  <p className="text-[8px] text-blue-600 mt-1 font-mono">
                                    Code: {doc.verificationCode}
                                  </p>
                                )}
                                {isDraft && (
                                  <p className="text-[8px] text-amber-600 mt-1 flex items-center gap-1">
                                    <Stamp size={8} /> Awaiting verification and seal
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => downloadDocument(doc.id, doc.fileName)}
                                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                  title="Download"
                                >
                                  <Download size={16} />
                                </button>
                                {isDraft && (
                                  <button
                                    onClick={() => certifyDocument(doc.id, selectedCaseForDocs.id)}
                                    disabled={certifying === doc.id}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-amber-700 transition-all disabled:opacity-50 shadow-md"
                                  >
                                    {certifying === doc.id ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <Stamp size={12} />
                                    )}
                                    Verify & Seal
                                  </button>
                                )}
                                {doc.certified && doc.verificationCode && (
                                  <span className="text-[8px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                    {doc.verificationCode}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
     

        {/* --- CASE DETAIL SIDEBAR --- */}
        <AnimatePresence>
          {selectedCase && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedCase(null)}
                className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-md z-[200]"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-[#0B0E14] shadow-2xl z-[300] p-12 flex flex-col border-l border-slate-100 dark:border-slate-800 overflow-y-auto"
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-3">
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-blue-500/20">
                      RECORD: {selectedCase.caseNumber}
                    </span>
                    <h2 className="text-4xl font-black mt-4 tracking-tighter leading-tight">
                      {selectedCase.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedCase(null)}
                    className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-3xl transition-all"
                  >
                    <X size={28} />
                  </button>
                </div>

                <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
                  <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">
                      Dossier Narrative
                    </label>
                    <p className="text-sm font-bold leading-relaxed text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                      {selectedCase.description ||
                        "No abstract provided for this entry."}
                    </p>
                  </section>

                  <section className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                        Client Contact
                      </label>
                      <p className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                        {selectedCase.clientEmail || "No Email"}
                      </p>
                      {selectedCase.clientPhone && (
                        <p className="text-xs text-slate-500 mt-1">
                          {selectedCase.clientPhone}
                        </p>
                      )}
                    </div>
                    <div className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-3">
                        Overseer
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-black text-white">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <p className="text-xs font-bold">{userName}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block">
                      Audit Concierge
                    </label>
                    <div className="relative">
                      <input
                        value={auditInput}
                        onChange={(e) => setAuditInput(e.target.value)}
                        placeholder="WHISPER INTO THE RECORD..."
                        className="w-full p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 outline-none text-[11px] font-bold uppercase tracking-widest italic"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handlePostAudit()
                        }
                      />
                      <button
                        onClick={handlePostAudit}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40" />
                        Created:{" "}
                        {new Date(
                          selectedCase.createdAt || Date.now(),
                        ).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40" />
                        Current Status: {selectedCase.status}
                      </div>
                    </div>
                  </section>

                  <section className="p-8 rounded-[2.5rem] bg-blue-600/5 border border-blue-500/10">
                    <p className="text-[10px] font-black text-blue-500/60 uppercase tracking-widest mb-4">
                      Manifest Certification
                    </p>
                    <button
                      onClick={() => handleCertify(selectedCase.id)}
                      disabled={selectedCase.status === "SECURED"}
                      className="w-full py-5 bg-white dark:bg-blue-600 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {selectedCase.status === "SECURED"
                        ? "PERPETUAL RECORD CERTIFIED"
                        : "COMMIT TO PERPETUAL RECORD"}
                    </button>
                  </section>
                </div>

                <div className="pt-8 grid grid-cols-2 gap-4">
                  <button className="py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                    <Paperclip size={16} /> Attach Evidence
                  </button>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/case/${selectedCase.id}`)
                    }
                    className="py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    View Timeline <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* --- CREATE CASE MODAL - FIXED SIZE AND SCROLLABLE --- */}
        <AnimatePresence>
          {modals.create && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 print:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModals({ ...modals, create: false })}
                className="absolute inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-md"
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                className="relative bg-white dark:bg-[#0F1219] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl"
              >
                <div className="sticky top-0 bg-white dark:bg-[#0F1219] border-b border-slate-200 dark:border-slate-800 px-8 py-6 flex justify-between items-center z-10">
                  <h2 className="text-2xl font-black tracking-tighter">
                    New Ledger Entry
                  </h2>
                  <button
                    onClick={() => setModals({ ...modals, create: false })}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateCase} className="p-8 space-y-6">
                  {/* Row 1: Case Designation & Reference ID */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Case Designation
                      </label>
                      <input
                        required
                        placeholder="Antitrust vs Goliath"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-blue-500/10 outline-none transition-all"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-blue-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                        <Sparkles size={12} /> Reference ID
                      </label>
                      <input
                        readOnly
                        className="w-full p-4 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl text-sm font-mono font-black text-blue-600 outline-none cursor-not-allowed"
                        value={formData.caseNumber}
                      />
                    </div>
                  </div>

                  {/* Row 2: Client Name & Email */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Client Name
                      </label>
                      <input
                        placeholder="Full legal name"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold outline-none"
                        value={formData.clientName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="client@example.com"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold outline-none"
                        value={formData.clientEmail}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientEmail: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Row 3: Client Phone & Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                        <Phone size={12} /> Phone Number
                      </label>
                      <input
                        placeholder="07XX XXX XXX"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold outline-none"
                        value={formData.clientPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientPhone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                        <MapPin size={12} /> Location
                      </label>
                      <input
                        placeholder="City, District"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold outline-none"
                        value={formData.clientLocation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientLocation: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Row 4: Date of Birth & Age */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                        <Cake size={12} /> Date of Birth
                      </label>
                      <input
                        type="date"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold outline-none"
                        value={formData.clientDob}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientDob: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Age (Auto-calculated)
                      </label>
                      <input
                        readOnly
                        placeholder="Auto-calculated from DOB"
                        className="w-full p-4 bg-slate-100 dark:bg-slate-700/30 border-none rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 outline-none cursor-not-allowed"
                        value={formData.clientAge}
                      />
                    </div>
                  </div>

                  {/* Row 5: Next Hearing Date & Case Stage */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
                        <Calendar size={12} /> Next Hearing Date
                      </label>
                      <input
                        type="datetime-local"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold outline-none"
                        value={formData.nextHearingDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nextHearingDate: e.target.value,
                          })
                        }
                      />
                      <p className="text-[8px] text-slate-500 ml-2">
                        Optional - Set the next court appearance
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Case Stage
                      </label>
                      <select
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold outline-none cursor-pointer"
                        value={formData.caseStage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            caseStage: parseInt(e.target.value),
                          })
                        }
                      >
                        <option value={0}>Filed</option>
                        <option value={1}>Discovery</option>
                        <option value={2}>Hearing</option>
                        <option value={3}>Judgment</option>
                      </select>
                      <p className="text-[8px] text-slate-500 ml-2">
                        Current stage of the case progression
                      </p>
                    </div>
                  </div>

                  {/* Row 6: Dossier Abstract */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                      Dossier Abstract
                    </label>
                    <textarea
                      placeholder="Legal grounds and core evidence..."
                      rows={3}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-sm font-bold outline-none resize-none"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>

                  <button
                    disabled={formLoading}
                    className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center mt-6"
                  >
                    {formLoading ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      "Finalize Registry Entry"
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- DELETE CONFIRMATION --- */}
        <AnimatePresence>
          {modals.delete && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 print:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModals({ ...modals, delete: false })}
                className="absolute inset-0 bg-red-950/20 backdrop-blur-xl"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-white dark:bg-[#0F1219] w-full max-w-md rounded-[3rem] shadow-2xl p-8 border border-red-100 dark:border-red-900/20 text-center"
              >
                <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">
                  Expunge Record?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-6 leading-relaxed uppercase tracking-widest">
                  This action is irreversible. The dossier will be permanently
                  shredded from the central vault.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setModals({ ...modals, delete: false })}
                    className="py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCase}
                    className="py-3 bg-red-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/30"
                  >
                    Purge
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #475569;
          }
          @media print {
            .print\:hidden {
              display: none !important;
            }
            body {
              background: white !important;
              color: black !important;
            }
            main {
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function StatCard({ label, value, trend, color, icon }: any) {
  const styles: any = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/50",
    emerald:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/50",
    purple:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-900/50",
    yellow:
      "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-500/10 border-yellow-100 dark:border-yellow-900/50",
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {label}
          </p>
        </div>
        <span
          className={`text-[8px] font-black px-2 py-0.5 rounded-md border ${styles[color]}`}
        >
          {trend}
        </span>
      </div>
      <p className="text-3xl font-black tracking-tighter text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusStyles = (status: string) => {
    const normalizedStatus = status?.toUpperCase() || "PENDING";
    const styles: Record<string, string> = {
      PENDING:
        "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
      ACTIVE:
        "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      "AT ISSUE":
        "bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
      "IN DISCOVERY":
        "bg-cyan-100 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
      "IN TRIAL":
        "bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
      SECURED:
        "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      "VERDICT REACHED":
        "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      "JUDGEMENT ENTERED":
        "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
      APPEAL:
        "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      "ON APPEAL":
        "bg-purple-100 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      CLOSED:
        "bg-gray-100 dark:bg-gray-800/50 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-700",
      DISMISSED:
        "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
      REMANDED:
        "bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    };
    return (
      styles[normalizedStatus] ||
      "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
    );
  };

  return (
    <span
      className={`px-3 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-tighter shadow-sm ${getStatusStyles(status)}`}
    >
      {status || "PENDING"}
    </span>
  );
}