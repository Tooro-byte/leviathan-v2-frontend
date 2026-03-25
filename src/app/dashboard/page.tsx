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
} from "lucide-react";

// --- TYPES ---
interface CaseData {
  id: string;
  title: string;
  caseNumber: string;
  description: string;
  status: "ACTIVE" | "SECURED" | "APPEAL" | "PASSIVE" | "ARCHIVED";
  clientName?: string;
  clientEmail?: string;
  createdAt?: string;
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

  // --- FORM STATE ---
  const [formData, setFormData] = useState({
    title: "",
    caseNumber: "",
    description: "",
    clientName: "",
    clientEmail: "",
    status: "PENDING", // Changed from ACTIVE to match backend default
  });

  // --- INITIALIZATION ---
  useEffect(() => {
    setMounted(true);

    // Load saved theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setDarkMode(false);
    } else {
      setDarkMode(true);
    }

    const storedUser = localStorage.getItem("userName");
    if (storedUser) setUserName(storedUser);

    fetchCases();
  }, []);

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

  // --- API ACTIONS ---
  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/cases");
      setCases(res.data);
    } catch (err) {
      console.error("Registry sync failed");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Properly formatted JSON for backend
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Prepare the payload matching the LegalCase entity fields
      const payload = {
        caseNumber: formData.caseNumber,
        title: formData.title,
        description: formData.description,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        status: formData.status,
      };

      console.log("Sending case payload:", payload);

      // Create FormData with JSON blob
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
        status: "PENDING",
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

  const stats = useMemo(
    () => ({
      total: cases.length,
      active: cases.filter((c) => c.status === "ACTIVE").length,
      secured: cases.filter((c) => c.status === "SECURED").length,
      appeals: cases.filter((c) => c.status === "APPEAL").length,
    }),
    [cases],
  );

  if (!mounted) return null;

  return (
    <div
      className={`${darkMode ? "dark" : ""} min-h-screen transition-colors duration-500`}
    >
      <div className="min-h-screen bg-[#F9FBFC] dark:bg-[#090B10] text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-500/30">
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
              onClick={() => {
                const newMode = !darkMode;
                setDarkMode(newMode);
                localStorage.setItem("theme", newMode ? "dark" : "light");
              }}
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
              label="Active Files"
              value={stats.active}
              trend="+4"
              color="blue"
            />
            <StatCard
              label="Secured Assets"
              value={stats.secured}
              trend="Stable"
              color="emerald"
            />
            <StatCard
              label="Appellate Cases"
              value={stats.appeals}
              trend="-1"
              color="purple"
            />
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                  Vault Integrity
                </p>
                <p className="text-4xl font-black text-slate-800 dark:text-white">
                  99%
                </p>
              </div>
              <WholesomePieChart
                active={stats.active}
                secured={stats.secured}
                appeals={stats.appeals}
              />
            </div>
          </div>

          {/* --- LEDGER TABLE --- */}
          <div className="bg-white dark:bg-[#0F1219] rounded-[3rem] border border-slate-200/60 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
                    <th className="px-12 py-8">Reference</th>
                    <th className="px-12 py-8">Case Identity</th>
                    <th className="px-12 py-8">Client</th>
                    <th className="px-12 py-8">Status</th>
                    <th className="px-12 py-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <Loader2
                          className="animate-spin inline text-blue-600"
                          size={40}
                        />
                      </td>
                    </tr>
                  ) : filteredCases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
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
                className="fixed inset-y-0 right-0 w-full max-w-xl bg-white dark:bg-[#0B0E14] shadow-2xl z-[300] p-12 flex flex-col border-l border-slate-100 dark:border-slate-800"
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

        {/* --- CREATE CASE MODAL --- */}
        <AnimatePresence>
          {modals.create && (
            <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 print:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setModals({ ...modals, create: false })}
                className="absolute inset-0 bg-slate-900/30 dark:bg-black/90 backdrop-blur-xl"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white dark:bg-[#0F1219] w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 md:p-16 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex justify-between items-center mb-12">
                  <h2 className="text-4xl font-black tracking-tighter">
                    New Ledger Entry
                  </h2>
                  <button
                    onClick={() => setModals({ ...modals, create: false })}
                    className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleCreateCase} className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Case Designation
                      </label>
                      <input
                        required
                        placeholder="Antitrust vs Goliath"
                        className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-sm font-bold focus:ring-4 ring-blue-500/10 outline-none transition-all"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-blue-500 uppercase ml-2 tracking-widest flex items-center gap-2">
                        <Sparkles size={12} /> Reference ID
                      </label>
                      <input
                        readOnly
                        className="w-full p-6 bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-3xl text-sm font-mono font-black text-blue-600 outline-none cursor-not-allowed"
                        value={formData.caseNumber}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Client Name
                      </label>
                      <input
                        placeholder="Identity"
                        className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-sm font-bold outline-none"
                        value={formData.clientName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            clientName: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Communication Node"
                        className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-sm font-bold outline-none"
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

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">
                      Dossier Abstract
                    </label>
                    <textarea
                      placeholder="Legal grounds and core evidence..."
                      rows={4}
                      className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl text-sm font-bold outline-none resize-none"
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
                    className="w-full py-6 bg-slate-900 dark:bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center"
                  >
                    {formLoading ? (
                      <Loader2 className="animate-spin" size={24} />
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
                className="relative bg-white dark:bg-[#0F1219] w-full max-md rounded-[3rem] shadow-2xl p-12 border border-red-100 dark:border-red-900/20 text-center"
              >
                <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <AlertTriangle size={40} />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white">
                  Expunge Record?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-10 leading-relaxed uppercase tracking-widest">
                  This action is irreversible. The dossier will be permanently
                  shredded from the central vault.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setModals({ ...modals, delete: false })}
                    className="py-5 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteCase}
                    className="py-5 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/30"
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
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #1e293b;
            border-radius: 20px;
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
function StatCard({ label, value, trend, color }: any) {
  const styles: any = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-900/50",
    emerald:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-900/50",
    purple:
      "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-900/50",
  };
  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:-translate-y-1">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          {label}
        </p>
        <span
          className={`text-[9px] font-black px-2.5 py-1 rounded-md border ${styles[color]}`}
        >
          {trend}
        </span>
      </div>
      <p className="text-5xl font-black tracking-tighter text-slate-800 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function WholesomePieChart({ active, secured, appeals }: any) {
  const total = active + secured + appeals || 1;
  const a = (active / total) * 100;
  const s = (secured / total) * 100;
  return (
    <svg
      viewBox="0 0 36 36"
      className="w-20 h-20 transform -rotate-90 drop-shadow-2xl"
    >
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="currentColor"
        className="text-slate-100 dark:text-slate-800"
        strokeWidth="4"
      />
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="#a855f7"
        strokeWidth="4"
        strokeDasharray="100 100"
      />
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="#10b981"
        strokeWidth="4"
        strokeDasharray={`${s + a} 100`}
        strokeLinecap="round"
      />
      <circle
        cx="18"
        cy="18"
        r="16"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="4"
        strokeDasharray={`${a} 100`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    ACTIVE:
      "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50",
    SECURED:
      "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50",
    APPEAL:
      "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-100 dark:border-purple-900/50",
  };
  return (
    <span
      className={`px-5 py-2 rounded-2xl text-[10px] font-black border uppercase tracking-tighter shadow-sm ${styles[status] || "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200"}`}
    >
      {status}
    </span>
  );
}
