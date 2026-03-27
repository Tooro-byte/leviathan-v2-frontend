"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import withAuth from "@/components/auth/withAuth";
import {
  ShieldCheck,
  FileUp,
  CheckCircle2,
  ArrowRight,
  Zap,
  History,
  Loader2,
  AlertCircle,
  Scale,
  Clock,
  Calendar,
  MessageSquare,
  FileText,
  Upload,
  X,
  Eye,
  Download,
  Check,
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Award,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Menu,
  Home,
  FolderOpen,
  DollarSign,
  Shield,
  Lock,
  Sparkles,
  Gift,
  Star,
  Users,
  Building,
  Briefcase,
  Heart,
  Flag,
  Globe,
  Activity,
  BarChart3,
  PieChart,
  FileCheck,
  Clock8,
  CalendarDays,
  Send,
  Paperclip,
  Image,
  Camera,
  Mic,
  Video,
  Music,
  Archive,
  Trash2,
  Edit,
  MoreHorizontal,
  Share2,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  PhoneCall,
  Video as VideoIcon,
  Users as UsersIcon,
  Link,
  Copy,
  ExternalLink,
  Download as DownloadIcon,
  Printer,
  Search,
  Filter,
  Sliders,
  Grid,
  List,
  Layout,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings as SettingsIcon,
  User as UserIcon,
  LogOut as LogOutIcon,
  HelpCircle as HelpCircleIcon,
  Bell as BellIcon,
  Mail as MailIcon,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  Phone as PhoneIcon,
  Globe as GlobeIcon,
  Award as AwardIcon,
  TrendingUp as TrendingUpIcon,
  Users as UsersIcon2,
  Building as BuildingIcon,
  Briefcase as BriefcaseIcon,
  Heart as HeartIcon,
  Flag as FlagIcon,
  Star as StarIcon,
  Sparkles as SparklesIcon,
  Gift as GiftIcon,
  Lock as LockIcon,
  Shield as ShieldIcon,
  FileText as FileTextIcon,
  FolderOpen as FolderOpenIcon,
  DollarSign as DollarSignIcon,
  CreditCard as CreditCardIcon,
} from "lucide-react";

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

interface UploadedFile {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  sourceOrigin: string;
  uploadedBy: string;
  uploadedByRole: string;
  fileHash?: string;
}

function ClientDashboard() {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeTab, setActiveTab] = useState<
    "overview" | "evidence" | "payments" | "messages"
  >("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Case status updated to AT ISSUE",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      message: "New evidence uploaded by your lawyer",
      time: "1 day ago",
      read: true,
    },
  ]);

  useEffect(() => {
    setMounted(true);
    fetchUserData();
    fetchCaseData();
  }, []);

  useEffect(() => {
    if (caseData?.id) {
      fetchUploadedFiles();
    }
  }, [caseData?.id]);

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

  const fetchUserData = async () => {
    try {
      const response = await api.get("/api/auth/me");
      setUserData(response.data);
    } catch (err) {
      console.error("Failed to fetch user data");
    }
  };

  const fetchCaseData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/api/cases/my-case");
      setCaseData(response.data);
      console.log("Case data:", response.data);
    } catch (err: any) {
      setError(err.message || "Could not connect to the LexTracker Vault.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUploadedFiles = async () => {
    if (!caseData?.id) return;
    try {
      const response = await api.get(`/api/documents/case/${caseData.id}`);
      setUploadedFiles(response.data);
      console.log("Uploaded files:", response.data);
    } catch (err) {
      console.error("Failed to fetch uploaded files");
    }
  };

  const handleDownloadFile = async (fileId: number, fileName: string) => {
    try {
      const response = await api.get(`/api/documents/download/${fileId}`, {
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
    }
  };

  const handleViewFile = async (fileId: number) => {
    try {
      const response = await api.get(`/api/documents/download/${fileId}`, {
        responseType: "blob",
      });

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      window.open(fileURL, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(fileURL), 100);
    } catch (err) {
      console.error("View error:", err);
      alert("Failed to view file. Please try again.");
    }
  };

  const getStageIndex = (status: string = "", caseStage: number = 0) => {
    // Priority: Use database caseStage if available
    if (caseStage !== undefined && caseStage !== null && caseStage >= 0) {
      return caseStage;
    }

    // Fallback only if no database value exists
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
        (nextCourtDate.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
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

  // Helper to determine who uploaded the document
  const getUploaderLabel = (file: UploadedFile) => {
    if (file.uploadedByRole === "LAWYER") {
      return { text: "Your Lawyer", color: "text-purple-600", icon: "👨‍⚖️" };
    } else if (file.uploadedByRole === "CLERK") {
      return { text: "Court Clerk", color: "text-amber-600", icon: "📋" };
    } else {
      return { text: "You", color: "text-emerald-600", icon: "👤" };
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" />
          <Loader2 className="h-16 w-16 text-indigo-600 animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">
          Unlocking Justice Vault...
        </p>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-slate-200 text-center"
        >
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">
            Sync Error
          </h2>
          <p className="text-slate-500 mb-8">
            {error || "No case found for this client"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all"
          >
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${darkMode ? "dark" : ""}`}
    >
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="fixed top-6 left-6 z-50 lg:hidden bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-3 rounded-2xl shadow-lg"
        >
          <Menu size={24} />
        </button>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 h-full w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 z-40 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          <div className="p-8">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-xl">
                <Scale size={24} className="text-white" />
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tight">Leviathan</h1>
                <p className="text-[9px] font-bold text-indigo-600 tracking-widest">
                  Client Portal
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  icon: Home,
                  label: "Dashboard",
                  active: activeTab === "overview",
                  tab: "overview",
                },
                {
                  icon: FolderOpen,
                  label: "Evidence Vault",
                  active: activeTab === "evidence",
                  tab: "evidence",
                },
                {
                  icon: DollarSign,
                  label: "Payments",
                  active: activeTab === "payments",
                  tab: "payments",
                },
                {
                  icon: MessageSquare,
                  label: "Messages",
                  active: activeTab === "messages",
                  tab: "messages",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setActiveTab(item.tab as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                    item.active
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-bold text-sm">{item.label}</span>
                  {item.active && (
                    <ChevronRight size={16} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                <Shield className="text-indigo-600 mb-3" size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">
                  Case Shield Active
                </p>
                <p className="text-[8px] text-slate-500 leading-relaxed">
                  All actions are encrypted and timestamped on the immutable
                  ledger.
                </p>
              </div>
              <button
                onClick={toggleDarkMode}
                className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-black"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                {darkMode ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-80 p-6 lg:p-12">
          {/* Header */}
          <header className="mb-12">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
                  Justice,
                  <br />
                  <span className="italic">Digitized.</span>
                </h1>
                <div className="flex items-center gap-3 mt-4">
                  <div className="h-1 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Case No. {caseData.caseNumber}
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="flex items-center gap-4">
                  <button className="relative p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all">
                    <Bell size={20} />
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
                    )}
                  </button>
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black">
                      {userData?.username?.charAt(0) ||
                        caseData.clientName?.charAt(0) ||
                        "C"}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">
                        {caseData.clientName || userData?.username || "Client"}
                      </p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">
                        ROLE_CLIENT
                      </p>
                    </div>
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
                  <StatCard
                    icon={Clock}
                    label="Next Hearing"
                    value={
                      daysUntilNextDate !== null ? daysUntilNextDate : "TBD"
                    }
                    suffix={daysUntilNextDate !== null ? "days" : ""}
                    color="indigo"
                    trend={
                      daysUntilNextDate !== null ? "Upcoming" : "Not Scheduled"
                    }
                  />
                  <StatCard
                    icon={FileCheck}
                    label="Case Status"
                    value={caseData.status}
                    color="emerald"
                    trend={
                      currentStage === 3
                        ? "Final Stage"
                        : `${currentStage + 1}/4 Stages`
                    }
                  />
                  <StatCard
                    icon={DollarSign}
                    label="Balance"
                    value={new Intl.NumberFormat("en-UG", {
                      style: "currency",
                      currency: "UGX",
                      maximumFractionDigits: 0,
                    }).format(caseData.balance)}
                    color="amber"
                    trend={caseData.balance === 0 ? "Settled" : "Pending"}
                  />
                  <StatCard
                    icon={Users}
                    label="Lead Counsel"
                    value={caseData.primaryCounsel || "Assigned"}
                    color="purple"
                    trend="Available"
                  />
                </div>

                {/* Progression Timeline */}
                <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <TrendingUpIcon size={14} className="text-indigo-500" />{" "}
                      Progression Timeline
                    </h3>
                    <div className="flex items-center gap-2">
                      <AwardIcon size={12} className="text-amber-500" />
                      <span className="text-[9px] font-black text-slate-400">
                        Integrity Score: 99%
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute top-8 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 rounded-full" />
                    <div className="relative flex justify-between">
                      {["Filed", "Discovery", "Hearing", "Judgment"].map(
                        (stage, i) => (
                          <div
                            key={stage}
                            className="flex flex-col items-center"
                          >
                            <div
                              className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                i <= currentStage
                                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                              }`}
                            >
                              {i < currentStage ? (
                                <CheckCircle2 size={28} />
                              ) : (
                                <span className="text-xl font-black">
                                  {i + 1}
                                </span>
                              )}
                            </div>
                            <span
                              className={`mt-4 text-[10px] font-black uppercase tracking-widest ${
                                i === currentStage
                                  ? "text-indigo-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {stage}
                            </span>
                            {i === currentStage && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-black"
                              >
                                !
                              </motion.div>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  {nextCourtDate ? (
                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                      <div className="flex items-start gap-3">
                        <CalendarDays
                          size={18}
                          className="text-indigo-600 mt-0.5"
                        />
                        <div>
                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">
                            Next Court Appearance
                          </p>
                          <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                            {formattedNextHearingDate}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {daysUntilNextDate === 0 && "Today!"}
                            {daysUntilNextDate === 1 && "Tomorrow!"}
                            {daysUntilNextDate &&
                              daysUntilNextDate > 1 &&
                              `${daysUntilNextDate} days remaining`}
                            {daysUntilNextDate &&
                              daysUntilNextDate < 0 &&
                              "Past due - contact your lawyer"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                      <div className="flex items-start gap-3">
                        <CalendarDays
                          size={18}
                          className="text-slate-400 mt-0.5"
                        />
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                            Next Hearing
                          </p>
                          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                            No hearing scheduled yet
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            Your lawyer will update this when a date is set
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Case Details & Audit Logs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Case Details */}
                  <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <FileTextIcon size={14} /> Case Dossier
                    </h3>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
                      {caseData.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                      {caseData.description}
                    </p>
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Filed Date
                        </span>
                        <span className="text-xs font-bold">
                          {new Date(caseData.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Current Stage
                        </span>
                        <span className="text-xs font-bold">
                          {currentStage === 0 && "Filed"}
                          {currentStage === 1 && "Discovery"}
                          {currentStage === 2 && "Hearing"}
                          {currentStage === 3 && "Judgment"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Client Name
                        </span>
                        <span className="text-xs font-bold">
                          {caseData.clientName ||
                            userData?.username ||
                            "Not specified"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase">
                          Client Email
                        </span>
                        <span className="text-xs font-bold">
                          {caseData.clientEmail ||
                            userData?.email ||
                            "Not specified"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Audit Shield */}
                  <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                      <ShieldIcon size={14} /> Audit Shield
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {memoizedLogs.length > 0 ? (
                        memoizedLogs.map((log, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={i}
                            className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all"
                          >
                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5" />
                            <p className="flex-1 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                              {log}
                            </p>
                            <ArrowRight
                              size={14}
                              className="text-slate-300 group-hover:text-indigo-500 transition-colors"
                            />
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 italic">
                          Awaiting registry entries...
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === "evidence" && (
              <motion.div
                key="evidence"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Evidence Vault Header */}
                <section className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <FolderOpen size={24} className="text-white/80" />
                      <h3 className="text-xl font-black">Evidence Vault</h3>
                    </div>
                    <p className="text-white/80 mb-4 max-w-md">
                      All case-related documents and evidence submitted by your
                      legal team.
                    </p>
                    <div className="flex items-center gap-2 text-white/60 text-xs">
                      <Lock size={12} />
                      <span>
                        Encrypted & Timestamped • Immutable Chain of Custody
                      </span>
                    </div>
                  </div>
                </section>

                {/* Files List - Professional Display */}
                <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <FileTextIcon size={14} /> Case Documents (
                      {uploadedFiles.length})
                    </h3>
                    <div className="text-[9px] text-slate-400">
                      Last updated: {new Date().toLocaleDateString()}
                    </div>
                  </div>

                  {uploadedFiles.length > 0 ? (
                    <div className="space-y-3">
                      {uploadedFiles.map((file, index) => {
                        const uploader = getUploaderLabel(file);
                        return (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={file.id}
                            className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <FileText
                                  size={24}
                                  className="text-indigo-600"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                    {file.fileName}
                                  </p>
                                  <span
                                    className={`text-[8px] font-black px-2 py-0.5 rounded-full ${uploader.color} bg-opacity-10`}
                                  >
                                    {uploader.icon} {uploader.text}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                  <span>
                                    📅{" "}
                                    {new Date(
                                      file.uploadedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span>
                                    📄 {(file.fileSize / 1024).toFixed(2)} KB
                                  </span>
                                  {file.sourceOrigin && (
                                    <span>📍 Source: {file.sourceOrigin}</span>
                                  )}
                                </div>
                                {file.fileHash && (
                                  <p className="text-[8px] font-mono text-slate-400 mt-1 truncate">
                                    SHA-256: {file.fileHash.substring(0, 16)}...
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewFile(file.id)}
                                className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all group/btn"
                                title="View Document"
                              >
                                <Eye
                                  size={18}
                                  className="text-slate-500 group-hover/btn:text-indigo-600"
                                />
                              </button>
                              <button
                                onClick={() =>
                                  handleDownloadFile(file.id, file.fileName)
                                }
                                className="p-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all group/btn"
                                title="Download Document"
                              >
                                <Download
                                  size={18}
                                  className="text-slate-500 group-hover/btn:text-emerald-600"
                                />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 text-slate-400">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-medium">
                        No documents uploaded yet
                      </p>
                      <p className="text-[10px] mt-2 max-w-sm mx-auto">
                        Your legal team will upload case documents, evidence,
                        and court filings here as they become available.
                      </p>
                    </div>
                  )}
                </section>
              </motion.div>
            )}

            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                {/* Balance Card */}
                <section className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10">
                    <p className="text-white/80 text-sm mb-2">
                      Current Balance
                    </p>
                    <p className="text-6xl font-black mb-4">
                      {new Intl.NumberFormat("en-UG", {
                        style: "currency",
                        currency: "UGX",
                        maximumFractionDigits: 0,
                      }).format(caseData.balance)}
                    </p>
                    <p className="text-white/70 text-xs">Outstanding Amount</p>
                  </div>
                </section>

                {/* Payment Information */}
                <section className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
                    Payment Instructions
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Bank Transfer Details
                      </p>
                      <div className="space-y-2 text-xs">
                        <p>
                          <span className="text-slate-500">Bank:</span> Stanbic
                          Bank Uganda
                        </p>
                        <p>
                          <span className="text-slate-500">Account Name:</span>{" "}
                          LexTracker Uganda
                        </p>
                        <p>
                          <span className="text-slate-500">
                            Account Number:
                          </span>{" "}
                          9030012345678
                        </p>
                        <p>
                          <span className="text-slate-500">Reference:</span>{" "}
                          {caseData.caseNumber}
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                        Important Note
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Please use your Case Number as reference when making
                        payments. Allow 2-3 business days for confirmation.
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
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl"
              >
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <MessageSquare size={14} /> Secure Messaging
                </h3>
                <div className="text-center py-12 text-slate-400">
                  <MessageSquare
                    size={48}
                    className="mx-auto mb-4 opacity-30"
                  />
                  <p className="text-sm">Coming Soon</p>
                  <p className="text-[10px] mt-2">
                    Direct messaging with your legal team will be available in
                    the next update
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
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
      `}</style>
    </div>
  );
}

// Stat Card Component
function StatCard({
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
  color: "indigo" | "emerald" | "amber" | "purple";
  trend: string;
}) {
  const colors = {
    indigo: "from-indigo-600 to-purple-600",
    emerald: "from-emerald-600 to-teal-600",
    amber: "from-amber-600 to-orange-600",
    purple: "from-purple-600 to-pink-600",
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colors[color]} rounded-2xl flex items-center justify-center text-white shadow-lg`}
        >
          <Icon size={20} />
        </div>
        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-lg">
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-slate-900 dark:text-white">
        {value}{" "}
        {suffix && (
          <span className="text-sm font-normal text-slate-400">{suffix}</span>
        )}
      </p>
    </div>
  );
}

export default withAuth(ClientDashboard, ["ROLE_CLIENT"]);
