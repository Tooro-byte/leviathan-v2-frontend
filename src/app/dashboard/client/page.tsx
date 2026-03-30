"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import withAuth from "@/components/auth/withAuth";
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2,
  AlertCircle,
  Scale,
  Clock,
  Calendar,
  MessageSquare,
  FileText,
  Eye,
  Download,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Award,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  Home,
  FolderOpen,
  DollarSign,
  Shield,
  Lock,
  Users,
  FileCheck,
  CalendarDays,
  Shield as ShieldIcon,
  FileText as FileTextIcon,
  FolderOpen as FolderOpenIcon,
  QrCode,
  Verified,
  Stamp,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientLocation?: string;
  nextHearingDate?: string;
  caseStage?: number;
}

interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  sourceOrigin: string;
  uploadedBy: string;
  fileHash?: string;
  documentCategory?: string;
  documentType?: string;
  certified?: boolean;
  certifiedAt?: string;
  certifiedBy?: string;
  verificationUrl?: string;
  verificationCode?: string;
  displayDocumentType?: string;
}

interface Notification {
  id: number;
  message: string;
  time: string;
  read: boolean;
}

function ClientDashboard() {
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "evidence" | "payments" | "messages"
  >("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [qrModal, setQrModal] = useState<{ show: boolean; url: string; code: string }>({
    show: false,
    url: "",
    code: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchCaseData();
  }, []);

  useEffect(() => {
    if (caseData?.id) {
      fetchDocuments();
    }
  }, [caseData?.id]);

  useEffect(() => {
    if (!caseData?.auditLogs) return;
    const auditNotifications = caseData.auditLogs
      .map((log, index) => ({
        id: Date.now() + index,
        message: log,
        time: "Just now",
        read: false,
      }))
      .reverse();
    setNotifications(auditNotifications);
    setUnreadCount(auditNotifications.filter((n) => !n.read).length);
  }, [caseData?.auditLogs]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("clientTheme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("clientTheme", newMode ? "dark" : "light");
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lextracker_access_token");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const fetchCaseData = async () => {
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

  const fetchDocuments = async () => {
    if (!caseData?.id) return;
    try {
      const response = await api.get(`/api/generate/case/${caseData.id}`);
      setDocuments(response.data || []);
      console.log("Fetched documents:", response.data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setDocuments([]);
    }
  };

  const handleDownloadFile = async (fileId: number, fileName: string) => {
    setDownloading(fileId);
    try {
      const response = await api.get(`/api/generate/download/${fileId}`, {
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
      console.error("Download error:", err);
      alert("Failed to download file. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const handleViewFile = async (fileId: number, fileName: string = "document") => {
    try {
      const response = await api.get(`/api/generate/download/${fileId}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);

      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${fileName}</title>
            <style>
              body, html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
              }
              iframe {
                width: 100%;
                height: 100%;
                border: none;
              }
            </style>
          </head>
          <body>
            <iframe src="${fileURL}"></iframe>
          </body>
        </html>
      `);
      } else {
        window.open(fileURL, "_blank");
      }

      setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
    } catch (err) {
      console.error("View error:", err);
      alert("Failed to view file. Please try again.");
    }
  };

  const openQrModal = (url: string, code: string) => {
    setQrModal({ show: true, url, code });
  };

  const getStageIndex = (status: string = "", caseStage: number = 0) => {
    if (caseStage !== undefined && caseStage !== null && caseStage >= 0) {
      return caseStage;
    }
    const stages: Record<string, number> = {
      PENDING: 0,
      ACTIVE: 0,
      FILED: 0,
      "AT ISSUE": 1,
      "IN DISCOVERY": 1,
      DISCOVERY: 1,
      "IN TRIAL": 2,
      TRIAL: 2,
      HEARING: 2,
      "VERDICT REACHED": 3,
      "JUDGEMENT ENTERED": 3,
      SECURED: 3,
      CLOSED: 3,
      DISMISSED: 3,
    };
    return stages[status?.toUpperCase()] ?? 0;
  };

  const memoizedLogs = useMemo(() => {
    if (!caseData?.auditLogs) return [];
    return [...caseData.auditLogs].reverse();
  }, [caseData?.auditLogs]);

  const currentStage = getStageIndex(caseData?.status, caseData?.caseStage);
  const nextCourtDate = caseData?.nextHearingDate
    ? new Date(caseData.nextHearingDate)
    : null;
  const daysUntilNextDate = nextCourtDate
    ? Math.ceil(
        (nextCourtDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
    : null;
  const formattedNextHearingDate = nextCourtDate
    ? nextCourtDate.toLocaleDateString("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const getDocumentBadge = (doc: Document) => {
    if (doc.documentCategory === "LEGAL_DOCUMENT" && doc.certified) {
      return { text: "CERTIFIED", color: "bg-emerald-100 text-emerald-700", icon: <Verified size={10} className="mr-1" /> };
    }
    if (doc.documentCategory === "LEGAL_DOCUMENT") {
      return { text: "DRAFT", color: "bg-amber-100 text-amber-700", icon: null };
    }
    return { text: "EVIDENCE", color: "bg-slate-100 text-slate-600", icon: null };
  };

  const legalDocuments = useMemo(() => {
    return documents.filter(doc => doc.documentCategory === "LEGAL_DOCUMENT");
  }, [documents]);

  const evidenceDocuments = useMemo(() => {
    return documents.filter(doc => doc.documentCategory === "EVIDENCE");
  }, [documents]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-900 rounded-full blur-3xl opacity-20 animate-pulse" />
          <Loader2 className="h-16 w-16 text-amber-700 animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 animate-pulse">
          Accessing the Vault...
        </p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white dark:bg-slate-900 p-12 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
        >
          <div className="w-20 h-20 bg-amber-100 dark:bg-amber-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Registry Error
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            {error || "No case record found for this client"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 dark:bg-amber-700 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 dark:hover:bg-amber-600 transition-all"
          >
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-6 left-6 z-50 lg:hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl p-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700"
        >
          <Menu size={22} />
        </button>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800 z-40 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-12 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-2.5 rounded-xl shadow-lg">
                <Scale size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                  Leviathan
                </h1>
                <p className="text-[8px] font-bold text-amber-600 dark:text-amber-500 tracking-widest uppercase">
                  Client Portal
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { icon: Home, label: "Registry", active: activeTab === "overview", tab: "overview" },
                { icon: FolderOpen, label: "Case Files", active: activeTab === "evidence", tab: "evidence" },
                { icon: DollarSign, label: "Treasury", active: activeTab === "payments", tab: "payments" },
                { icon: MessageSquare, label: "Correspondence", active: activeTab === "messages", tab: "messages" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(item.tab as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
                    item.active
                      ? "bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-lg shadow-amber-700/20"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="font-semibold text-sm">{item.label}</span>
                  {item.active && <ChevronRight size={14} className="ml-auto" />}
                </button>
              ))}
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <Shield className="text-amber-700 dark:text-amber-500 mb-2" size={22} />
                <p className="text-[9px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
                  Seal of Integrity
                </p>
                <p className="text-[7px] text-amber-600 dark:text-amber-500 leading-relaxed">
                  All records encrypted and timestamped on the immutable ledger.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={toggleDarkMode}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}{" "}
                  {darkMode ? "Light" : "Dark"}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                >
                  <LogOut size={14} /> Exit
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-80 p-6 lg:p-10">
          {/* Header */}
          <header className="mb-10">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-px bg-amber-600" />
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 tracking-[0.3em] uppercase">
                    The Judiciary
                  </span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                  Lex{" "}
                  <span className="text-amber-700 dark:text-amber-500">
                    Tracker
                  </span>
                </h1>
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-px w-8 bg-slate-300 dark:bg-slate-700" />
                  <p className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Case No. {caseData.caseNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Bell size={18} className="text-slate-600 dark:text-slate-400" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px] font-black text-white">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
                      >
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <h4 className="text-xs font-black uppercase tracking-wider">
                            Audit Trail
                          </h4>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-[9px] text-amber-600 hover:text-amber-700"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => markNotificationAsRead(notif.id)}
                                className={`p-3 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all ${!notif.read ? "bg-amber-50/50 dark:bg-amber-950/20" : ""}`}
                              >
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                  {notif.message}
                                </p>
                                <span className="text-[9px] text-slate-400 mt-1 block">
                                  {notif.time}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="p-6 text-center text-slate-400 text-xs">
                              No new notifications
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {caseData.clientName?.charAt(0) || "C"}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                      {caseData.clientName || "Client"}
                    </p>
                    <p className="text-[8px] text-amber-600 dark:text-amber-500 uppercase tracking-wider font-semibold">
                      Registered Party
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Active Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <JudicialStatCard
                    icon={Calendar}
                    label="Next Hearing"
                    value={daysUntilNextDate !== null ? daysUntilNextDate : "TBD"}
                    suffix={daysUntilNextDate !== null ? " days" : ""}
                    color="amber"
                    trend="Scheduled"
                  />
                  <JudicialStatCard
                    icon={FileCheck}
                    label="Case Status"
                    value={caseData.status}
                    color="emerald"
                    trend={`Stage ${currentStage + 1}/4`}
                  />
                  <JudicialStatCard
                    icon={DollarSign}
                    label="Balance"
                    value={new Intl.NumberFormat("en-UG", {
                      style: "currency",
                      currency: "UGX",
                      maximumFractionDigits: 0,
                    }).format(caseData.balance)}
                    color="slate"
                    trend={caseData.balance === 0 ? "Settled" : "Outstanding"}
                  />
                  <JudicialStatCard
                    icon={Scale}
                    label="Lead Counsel"
                    value={caseData.primaryCounsel || "Assigned"}
                    color="purple"
                    trend="Active"
                  />
                </div>

                {/* Progression Timeline */}
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <TrendingUp size={14} className="text-amber-600" /> Court Progression
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[8px] font-mono text-slate-400">Integrity Verified</span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700" />
                    <div className="relative flex justify-between">
                      {["Petition", "Discovery", "Trial", "Judgment"].map((stage, i) => (
                        <div key={stage} className="flex flex-col items-center">
                          <div
                            className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                              i <= currentStage
                                ? "bg-amber-700 border-amber-700 text-white shadow-lg shadow-amber-700/20"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400"
                            }`}
                          >
                            {i < currentStage ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <span className="text-sm font-bold">{i + 1}</span>
                            )}
                          </div>
                          <span
                            className={`mt-3 text-[9px] font-bold uppercase tracking-wider ${
                              i === currentStage ? "text-amber-700 dark:text-amber-500" : "text-slate-400"
                            }`}
                          >
                            {stage}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {nextCourtDate ? (
                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl border-l-4 border-amber-600">
                      <div className="flex items-start gap-3">
                        <CalendarDays size={16} className="text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                            Next Appearance
                          </p>
                          <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                            {formattedNextHearingDate}
                          </p>
                          <p className="text-[9px] text-amber-600 dark:text-amber-500 mt-1 font-medium">
                            {daysUntilNextDate === 0 && "Today"}
                            {daysUntilNextDate === 1 && "Tomorrow"}
                            {daysUntilNextDate && daysUntilNextDate > 1 && `${daysUntilNextDate} days remaining`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-3">
                        <CalendarDays size={16} className="text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                            Next Hearing
                          </p>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                            Awaiting scheduling
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Case Details & Audit Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                      <FileTextIcon size={14} /> Case Dossier
                    </h3>
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                      {caseData.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">
                      {caseData.description}
                    </p>
                    <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Filed</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {new Date(caseData.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Current Stage</span>
                        <span className="font-medium text-amber-700 dark:text-amber-500">
                          {currentStage === 0 && "Petition Filed"}
                          {currentStage === 1 && "Discovery Phase"}
                          {currentStage === 2 && "Trial Proceedings"}
                          {currentStage === 3 && "Awaiting Judgment"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Registered Party</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {caseData.clientName || "Not specified"}
                        </span>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
                      <ShieldIcon size={14} /> Audit Trail
                    </h3>
                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                      {memoizedLogs.length > 0 ? (
                        memoizedLogs.map((log, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700 group hover:border-amber-200 transition-all"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                            <p className="flex-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                              {log}
                            </p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 text-sm italic">
                          No registry entries recorded
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {/* Case Files - Shows BOTH Legal Documents and Evidence */}
            {activeTab === "evidence" && (
              <motion.div
                key="evidence"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Header */}
                <section className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-3xl p-8 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <FolderOpen size={26} className="text-amber-300" />
                    <h3 className="text-xl font-black">Case Files Registry</h3>
                  </div>
                  <p className="text-amber-100/80 text-sm mb-3 max-w-md">
                    Official court documents and evidence submitted to the registry.
                  </p>
                  <div className="flex items-center gap-3 text-amber-300/60 text-[10px]">
                    <Lock size={10} />
                    <span>Encrypted Chain of Custody • Court-Admissible</span>
                  </div>
                </section>

                {/* Legal Documents Section (Certified) */}
                {legalDocuments.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <Stamp size={16} className="text-emerald-600" />
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                        Certified Legal Documents
                      </h3>
                      <span className="text-[8px] font-mono text-slate-400 ml-auto">
                        {legalDocuments.length} document(s)
                      </span>
                    </div>
                    <div className="space-y-3">
                      {legalDocuments.map((doc, index) => {
                        const badge = getDocumentBadge(doc);
                        return (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-emerald-50/30 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 transition-all group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                                <FileText size={18} className="text-emerald-700" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                    {doc.displayDocumentType || doc.documentType?.replace(/_/g, " ")}
                                  </p>
                                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${badge.color} flex items-center`}>
                                    {badge.icon}{badge.text}
                                  </span>
                                  {doc.certified && doc.verificationCode && (
                                    <button
                                      onClick={() => openQrModal(doc.verificationUrl || "", doc.verificationCode || "")}
                                      className="text-[7px] font-black px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1 hover:bg-blue-200 transition-all"
                                    >
                                      <QrCode size={8} /> Verify
                                    </button>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-[9px] text-slate-500 flex-wrap">
                                  <span>📅 {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                  <span>📄 {(doc.fileSize / 1024).toFixed(1)} KB</span>
                                  {doc.certified && doc.certifiedBy && (
                                    <span className="text-emerald-600">✓ Certified by: {doc.certifiedBy}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewFile(doc.id, doc.fileName)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title="View Document"
                              >
                                <Eye size={15} className="text-slate-500 hover:text-amber-600" />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(doc.id, doc.fileName)}
                                disabled={downloading === doc.id}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1"
                                title="Download"
                              >
                                {downloading === doc.id ? (
                                  <Loader2 size={14} className="animate-spin text-amber-600" />
                                ) : (
                                  <Download size={15} className="text-slate-500 hover:text-amber-600" />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Evidence Documents Section */}
                {evidenceDocuments.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="flex items-center gap-2 mb-5 pb-2 border-b border-slate-200 dark:border-slate-700">
                      <FileText size={14} className="text-amber-600" />
                      <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                        Evidence & Exhibits
                      </h3>
                      <span className="text-[8px] font-mono text-slate-400 ml-auto">
                        {evidenceDocuments.length} item(s)
                      </span>
                    </div>
                    <div className="space-y-3">
                      {evidenceDocuments.map((file, index) => {
                        const uploader = file.uploadedBy?.toLowerCase().includes("lawyer") || file.uploadedBy === "Principal Lawyer"
                          ? { text: "Counsel", color: "text-purple-600", icon: "⚖️" }
                          : { text: "Registry", color: "text-amber-600", icon: "📋" };
                        return (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-amber-300 transition-all group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                <FileText size={18} className="text-amber-700" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                    {file.fileName}
                                  </p>
                                  <span className={`text-[7px] font-black px-1.5 py-0.5 rounded-full ${uploader.color} bg-opacity-10`}>
                                    {uploader.icon} {uploader.text}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[9px] text-slate-500">
                                  <span>📅 {new Date(file.uploadedAt).toLocaleDateString()}</span>
                                  <span>📄 {(file.fileSize / 1024).toFixed(1)} KB</span>
                                  {file.sourceOrigin && <span>📍 Source: {file.sourceOrigin}</span>}
                                </div>
                                {file.fileHash && (
                                  <p className="text-[7px] font-mono text-slate-400 mt-1 truncate">
                                    SHA-256: {file.fileHash.substring(0, 20)}...
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewFile(file.id, file.fileName)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title="View Exhibit"
                              >
                                <Eye size={15} className="text-slate-500 hover:text-amber-600" />
                              </button>
                              <button
                                onClick={() => handleDownloadFile(file.id, file.fileName)}
                                disabled={downloading === file.id}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center gap-1"
                                title="Download"
                              >
                                {downloading === file.id ? (
                                  <Loader2 size={14} className="animate-spin text-amber-600" />
                                ) : (
                                  <Download size={15} className="text-slate-500 hover:text-amber-600" />
                                )}
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {legalDocuments.length === 0 && evidenceDocuments.length === 0 && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 shadow-xl">
                    <FileText size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    <p className="text-sm font-medium text-slate-500">No case files available</p>
                    <p className="text-[10px] text-slate-400 mt-1">Documents will appear here when filed by counsel.</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <section className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white">
                  <p className="text-slate-300 text-sm mb-1">Court Fees & Costs</p>
                  <p className="text-4xl font-bold mb-1">
                    {new Intl.NumberFormat("en-UG", {
                      style: "currency",
                      currency: "UGX",
                      maximumFractionDigits: 0,
                    }).format(caseData.balance)}
                  </p>
                  <p className="text-slate-400 text-xs">Outstanding Balance</p>
                </section>
                <section className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-5">
                    Payment Instructions
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      <p className="text-sm font-semibold mb-2">Bank Details</p>
                      <div className="space-y-1.5 text-xs">
                        <p><span className="text-slate-500">Bank:</span> Stanbic Bank Uganda</p>
                        <p><span className="text-slate-500">Account:</span> LexTracker Uganda</p>
                        <p><span className="text-slate-500">Number:</span> 9030012345678</p>
                        <p><span className="text-slate-500">Reference:</span> {caseData.caseNumber}</p>
                      </div>
                    </div>
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border-l-2 border-amber-500">
                      <p className="text-[9px] font-black text-amber-700 uppercase">Important</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Quote your Case Number for all payments. Allow 2-3 business days for confirmation.
                      </p>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "messages" && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-xl text-center"
              >
                <MessageSquare size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Secure Correspondence
                </h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Direct messaging with counsel will be available in the next update.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrModal.show && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setQrModal({ show: false, url: "", code: "" })}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden text-center p-8"
            >
              <div className="mb-4">
                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Verified size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-black mb-2">Document Verified</h3>
                <p className="text-sm text-slate-500">This document is authentic and certified by LexTracker.</p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 mb-4">
                <p className="text-[10px] font-mono break-all text-slate-600 dark:text-slate-400">
                  Verification Code: <span className="font-bold text-amber-600">{qrModal.code}</span>
                </p>
              </div>
              <button
                onClick={() => setQrModal({ show: false, url: "", code: "" })}
                className="w-full py-3 bg-amber-700 text-white rounded-xl font-black text-xs uppercase hover:bg-amber-800 transition-all"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4a373; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #b45309; }
      `}</style>
    </div>
  );
}

// Judicial Stat Card Component
function JudicialStatCard({
  icon: Icon,
  label,
  value,
  suffix = "",
  color,
  trend,
}: {
  icon: any;
  label: string;
  value: string | number;
  suffix?: string;
  color: "amber" | "emerald" | "slate" | "purple";
  trend: string;
}) {
  const colors = {
    amber: "from-amber-700 to-amber-800 border-amber-700",
    emerald: "from-emerald-700 to-emerald-800 border-emerald-700",
    slate: "from-slate-700 to-slate-800 border-slate-700",
    purple: "from-purple-700 to-purple-800 border-purple-700",
  };

  const textColors = {
    amber: "text-amber-700 dark:text-amber-400",
    emerald: "text-emerald-700 dark:text-emerald-400",
    slate: "text-slate-700 dark:text-slate-400",
    purple: "text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="group relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/40 to-transparent dark:from-amber-950/30 opacity-60 group-hover:opacity-80 transition-opacity" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-2xl flex items-center justify-center text-white shadow-lg ring-1 ring-white/20`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          {trend}
        </span>
      </div>
      <p className={`text-[10px] font-bold uppercase tracking-[0.08em] mb-1.5 ${textColors[color]}`}>
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
        {value}
        {suffix && <span className="text-base font-medium text-slate-400 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}

export default withAuth(ClientDashboard, ["ROLE_CLIENT"]);