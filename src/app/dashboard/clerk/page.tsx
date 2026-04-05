"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import withAuth from "@/components/auth/withAuth";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ClipboardList,
  Camera,
  Navigation,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Scale,
  Bell,
  LogOut,
  Moon,
  Sun,
  Menu,
  Home,
  FolderOpen,
  FileCheck,
  Clock,
  Users,
  Building,
  Briefcase,
  Shield,
  Lock,
  ChevronRight,
  X,
  Upload,
  FileText,
  Eye,
  Download,
  Calendar,
  TrendingUp,
  Award,
  MessageSquare,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  CalendarDays,
  Send,
  Paperclip,
  Image,
  Plus,
  Trash2,
  Edit,
  MoreHorizontal,
  Search,
  Filter,
  RefreshCw,
  Stamp,
  File,
  Verified,
  QrCode,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  caseNumber: string;
  caseId: number;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  priority: "HIGH" | "MEDIUM" | "LOW";
  assignedBy: string;
  createdAt: string;
}

interface Case {
  id: number;
  caseNumber: string;
  title: string;
  clientName: string;
  status: string;
  nextHearingDate?: string;
}

interface Exhibit {
  id: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  sourceOrigin: string;
  caseId: number;
  caseNumber: string;
  uploadedBy: string;
  fileHash?: string;
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
  displayDocumentType?: string;
  verificationCode?: string;
}

function ClerkDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "tasks" | "exhibits" | "registry" | "service"
  >("tasks");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [loadingExhibits, setLoadingExhibits] = useState(true);
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSource, setUploadSource] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  const [cases, setCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [selectedCaseForRegistry, setSelectedCaseForRegistry] =
    useState<Case | null>(null);
  const [registryNote, setRegistryNote] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [serving, setServing] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedCaseForService, setSelectedCaseForService] =
    useState<Case | null>(null);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Document Generation State
  const [generating, setGenerating] = useState<string | null>(null);
  const [documentsModal, setDocumentsModal] = useState(false);
  const [selectedCaseForDocs, setSelectedCaseForDocs] = useState<Case | null>(
    null,
  );
  const [caseDocuments, setCaseDocuments] = useState<GeneratedDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    totalCases: 0,
    pendingRegistry: 0,
    recentActivity: [] as string[],
  });

  useEffect(() => {
    setMounted(true);
    fetchAllData();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("clerkTheme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("clerkTheme", newMode ? "dark" : "light");
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

  const fetchAllData = async () => {
    setLoadingTasks(true);
    setLoadingCases(true);
    setLoadingExhibits(true);

    try {
      await Promise.all([fetchTasks(), fetchCases(), fetchExhibits()]);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoadingTasks(false);
      setLoadingCases(false);
      setLoadingExhibits(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await api.get("/api/tasks/assigned");
      setTasks(response.data);
      setStats((prev) => ({
        ...prev,
        pendingTasks: response.data.filter(
          (t: Task) => t.status !== "COMPLETED",
        ).length,
      }));
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await api.get("/api/cases");
      setCases(response.data);
      setStats((prev) => ({ ...prev, totalCases: response.data.length }));
    } catch (err) {
      console.error("Failed to fetch cases:", err);
      setCases([]);
    }
  };

  const fetchExhibits = async () => {
    setLoadingExhibits(true);
    try {
      const response = await api.get("/api/documents/evidence");
      // Ensure we have an array
      const evidenceData = Array.isArray(response.data) ? response.data : [];
      setExhibits(evidenceData);
      console.log("Fetched exhibits:", evidenceData.length);
    } catch (err) {
      console.error("Failed to fetch exhibits:", err);
      setExhibits([]);
    } finally {
      setLoadingExhibits(false);
    }
  };

  const fetchCaseDocuments = async (caseId: number) => {
    setLoadingDocuments(true);
    try {
      const response = await api.get(`/api/generate/case/${caseId}`);
      setCaseDocuments(response.data);
    } catch (err) {
      console.error("Failed to fetch documents:", err);
      setCaseDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const generateDocument = async (caseId: number, documentType: string) => {
    setGenerating(documentType);
    try {
      const response = await api.post(
        `/api/generate/${documentType}/${caseId}`,
        {},
        {
          responseType: "blob",
        },
      );

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

      const newNotification = {
        id: Date.now(),
        message: `DRAFT ${documentType.toUpperCase()} generated for case ${caseId}`,
        time: "Just now",
        read: false,
      };
      setNotifications([newNotification, ...notifications]);
      setUnreadCount((prev) => prev + 1);
      alert(`DRAFT ${documentType.toUpperCase()} generated successfully!`);
    } catch (err) {
      console.error("Generation failed:", err);
      alert("Failed to generate document. Please try again.");
    } finally {
      setGenerating(null);
    }
  };

  // ==================== DOWNLOAD & VIEW FUNCTIONS ====================

  // DOWNLOAD FUNCTION - Fixed for Clerk Dashboard
  const downloadDocument = async (documentId: number, fileName: string) => {
    setDownloading(documentId);
    try {
      console.log(`Downloading document ID: ${documentId}`);

      // Use the correct endpoint - /api/generate/download/{documentId}
      const response = await api.get(`/api/generate/download/${documentId}`, {
        responseType: "blob",
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName || `document-${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log("Download started successfully");
    } catch (err: any) {
      console.error("Download failed:", err);
      const errorMsg =
        err.response?.data?.error ||
        "Failed to download document. Please try again.";
      alert(errorMsg);
    } finally {
      setDownloading(null);
    }
  };

  // VIEW FUNCTION (opens in new tab) - Fixed for Clerk Dashboard
  const viewDocument = async (documentId: number) => {
    try {
      console.log(`Viewing document ID: ${documentId}`);

      // Use the correct endpoint - /api/generate/view/{documentId}
      const response = await api.get(`/api/generate/view/${documentId}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Clean up after 1 minute
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (err: any) {
      console.error("View failed:", err);
      alert("Failed to open document for viewing. Please try again.");
    }
  };
  const openDocumentsModal = async (caseItem: Case) => {
    setSelectedCaseForDocs(caseItem);
    await fetchCaseDocuments(caseItem.id);
    setDocumentsModal(true);
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await api.patch(`/api/tasks/${taskId}/complete`);
      await fetchTasks();
      const newNotification = {
        id: Date.now(),
        message: "Task completed successfully",
        time: "Just now",
        read: false,
      };
      setNotifications([newNotification, ...notifications]);
      setUnreadCount((prev) => prev + 1);
      alert("Task completed successfully!");
    } catch (err) {
      console.error("Failed to complete task:", err);
      alert("Failed to complete task. Please try again.");
    }
  };

  const handleUploadExhibit = async () => {
    if (!selectedFile || !uploadSource || !selectedCaseId) {
      alert("Please select a file, provide source, and select a case");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("sourceOrigin", uploadSource);

      const response = await api.post(
        `/api/documents/upload/${selectedCaseId}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      await fetchExhibits();
      setUploadModal(false);
      setSelectedFile(null);
      setUploadSource("");
      setSelectedCaseId(null);

      const newNotification = {
        id: Date.now(),
        message: "Exhibit uploaded successfully",
        time: "Just now",
        read: false,
      };
      setNotifications([newNotification, ...notifications]);
      setUnreadCount((prev) => prev + 1);
      alert("Exhibit uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleRegistryVerification = async () => {
    if (!selectedCaseForRegistry) {
      alert("Please select a case");
      return;
    }

    setVerifying(true);
    try {
      await api.post(
        `/api/cases/${selectedCaseForRegistry.id}/registry-verify`,
        {
          note: registryNote,
          timestamp: new Date().toISOString(),
        },
      );

      setSelectedCaseForRegistry(null);
      setRegistryNote("");

      const newNotification = {
        id: Date.now(),
        message: `Registry verified for case ${selectedCaseForRegistry.caseNumber}`,
        time: "Just now",
        read: false,
      };
      setNotifications([newNotification, ...notifications]);
      setUnreadCount((prev) => prev + 1);
      alert("Registry verification recorded successfully!");
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Verification failed. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleServiceOfProcess = () => {
    if (!selectedCaseForService) {
      alert("Please select a case first");
      return;
    }

    setServing(true);
    setServiceError(null);

    if (!("geolocation" in navigator)) {
      setServiceError("GPS not supported on this device.");
      setServing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsLocation({ lat: latitude, lng: longitude });

        try {
          await api.post("/api/service-of-process/verify", {
            caseId: selectedCaseForService.id,
            caseNumber: selectedCaseForService.caseNumber,
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString(),
          });

          setServing(false);
          setSelectedCaseForService(null);

          const newNotification = {
            id: Date.now(),
            message: `Service of process recorded for ${selectedCaseForService.caseNumber}`,
            time: "Just now",
            read: false,
          };
          setNotifications([newNotification, ...notifications]);
          setUnreadCount((prev) => prev + 1);
          alert("Service of Process recorded successfully!");
        } catch (err: any) {
          console.error("Service recording failed:", err);
          setServiceError("Failed to record service of process");
          setServing(false);
        }
      },
      (err) => {
        setServiceError("Location access denied. Please enable GPS.");
        setServing(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            LOW
          </span>
        );
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="h-12 w-12 text-amber-700 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${darkMode ? "dark" : ""}`}
    >
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
                  Clerk Portal
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                {
                  icon: ClipboardList,
                  label: "Task Fulfillment",
                  active: activeTab === "tasks",
                  tab: "tasks",
                },
                {
                  icon: FolderOpen,
                  label: "Exhibit Vault",
                  active: activeTab === "exhibits",
                  tab: "exhibits",
                },
                {
                  icon: FileCheck,
                  label: "Registry Verification",
                  active: activeTab === "registry",
                  tab: "registry",
                },
                {
                  icon: Navigation,
                  label: "Service of Process",
                  active: activeTab === "service",
                  tab: "service",
                },
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
                  {item.active && (
                    <ChevronRight size={14} className="ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <Shield
                  className="text-amber-700 dark:text-amber-500 mb-2"
                  size={22}
                />
                <p className="text-[9px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
                  Registry Seal
                </p>
                <p className="text-[7px] text-amber-600 dark:text-amber-500 leading-relaxed">
                  All actions logged and immutable.
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={toggleDarkMode}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
                >
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
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
                    Registry Operations
                  </span>
                </div>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white">
                  Clerk{" "}
                  <span className="text-amber-700 dark:text-amber-500">
                    Command
                  </span>
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Stats Badge */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={14} className="text-amber-600" />
                    <span className="text-xs font-bold">
                      {stats.pendingTasks} Pending
                    </span>
                  </div>
                  <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
                  <div className="flex items-center gap-2">
                    <FileCheck size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold">
                      {stats.totalCases} Cases
                    </span>
                  </div>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-md hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <Bell
                      size={18}
                      className="text-slate-600 dark:text-slate-400"
                    />
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
                            Recent Activity
                          </h4>
                          {unreadCount > 0 && (
                            <button
                              onClick={() => {
                                setNotifications([]);
                                setUnreadCount(0);
                              }}
                              className="text-[9px] text-amber-600 hover:text-amber-700"
                            >
                              Clear all
                            </button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                className="p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
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
                              No recent activity
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-400 text-sm font-bold"
            >
              <AlertCircle size={18} /> {error}
            </motion.div>
          )}

          {/* Cases Table with Document Generation */}
          <div className="mb-8 bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-lg">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2">
              <File size={14} /> Case Documents
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-2 text-[10px] font-black text-slate-400 uppercase">
                      Case Number
                    </th>
                    <th className="text-left py-3 px-2 text-[10px] font-black text-slate-400 uppercase">
                      Title
                    </th>
                    <th className="text-left py-3 px-2 text-[10px] font-black text-slate-400 uppercase">
                      Client
                    </th>
                    <th className="text-center py-3 px-2 text-[10px] font-black text-slate-400 uppercase">
                      Generate Document
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingCases ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8">
                        <Loader2 className="animate-spin mx-auto" size={24} />
                      </td>
                    </tr>
                  ) : cases.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-slate-400"
                      >
                        No cases found
                      </td>
                    </tr>
                  ) : (
                    cases.map((caseItem) => (
                      <tr
                        key={caseItem.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all"
                      >
                        <td className="py-3 px-2 text-sm font-mono text-blue-600">
                          {caseItem.caseNumber}
                        </td>
                        <td className="py-3 px-2 text-sm font-medium">
                          {caseItem.title}
                        </td>
                        <td className="py-3 px-2 text-sm text-slate-600">
                          {caseItem.clientName}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => openDocumentsModal(caseItem)}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-all"
                            title="Generate Documents"
                          >
                            <FileText size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "tasks" && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
                    <ClipboardList size={14} /> Active Tasks
                  </h3>
                  {loadingTasks ? (
                    <div className="flex justify-center py-12">
                      <Loader2
                        className="animate-spin text-amber-600"
                        size={32}
                      />
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      No pending tasks
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-700"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getPriorityBadge(task.priority)}
                              <span className="text-[10px] font-mono text-slate-500">
                                {task.caseNumber}
                              </span>
                            </div>
                            <p className="font-bold text-slate-800 dark:text-white">
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {task.description}
                            </p>
                            <p className="text-[9px] text-slate-400 mt-2">
                              Assigned by: {task.assignedBy}
                            </p>
                          </div>
                          {task.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleTaskComplete(task.id)}
                              className="ml-4 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-700 transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 size={14} /> Complete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "exhibits" && (
              <motion.div
                key="exhibits"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl p-7 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Camera size={26} className="text-amber-300" />
                    <h3 className="text-xl font-black">Exhibit Ingest</h3>
                  </div>
                  <p className="text-amber-100/80 text-sm mb-4">
                    Upload physical evidence scans to case files.
                  </p>
                  <button
                    onClick={() => setUploadModal(true)}
                    className="px-6 py-3 bg-white text-amber-800 rounded-xl font-black text-xs uppercase hover:shadow-xl transition-all"
                  >
                    + Upload New Exhibit
                  </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-5">
                    Recent Exhibits
                  </h3>
                  {loadingExhibits ? (
                    <div className="flex justify-center py-12">
                      <Loader2
                        className="animate-spin text-amber-600"
                        size={32}
                      />
                    </div>
                  ) : exhibits.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FileText size={40} className="mx-auto mb-3 opacity-30" />
                      <p>No exhibits uploaded</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {exhibits.map((exhibit) => (
                        <div
                          key={exhibit.id}
                          className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl"
                        >
                          <div>
                            <p className="font-semibold">{exhibit.fileName}</p>
                            <p className="text-[10px] text-slate-500">
                              {exhibit.caseNumber} •{" "}
                              {new Date(
                                exhibit.uploadedAt,
                              ).toLocaleDateString()}
                            </p>
                            {exhibit.sourceOrigin && (
                              <p className="text-[9px] text-slate-400 mt-1">
                                Source: {exhibit.sourceOrigin}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {/* Download Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (exhibit.id) {
                                  downloadDocument(
                                    exhibit.id,
                                    exhibit.fileName,
                                  );
                                }
                              }}
                              disabled={downloading === exhibit.id}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                              title="Download Exhibit"
                            >
                              {downloading === exhibit.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Download size={16} />
                              )}
                            </button>

                            {/* View Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (exhibit.id) {
                                  viewDocument(exhibit.id);
                                }
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="View Exhibit"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "registry" && (
              <motion.div
                key="registry"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-lg">
                  <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-2">
                    <FileCheck size={14} /> Registry Verification
                  </h3>
                  <div className="space-y-4">
                    <select
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-amber-500 outline-none transition-all"
                      value={selectedCaseForRegistry?.id || ""}
                      onChange={(e) => {
                        const selected = cases.find(
                          (c) => c.id === parseInt(e.target.value),
                        );
                        setSelectedCaseForRegistry(selected || null);
                      }}
                    >
                      <option value="">Select Case</option>
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.caseNumber} - {c.title}
                        </option>
                      ))}
                    </select>

                    <textarea
                      placeholder="Verification notes (e.g., File submitted to Court 4, received by Clerk Akena)"
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 resize-none focus:border-amber-500 outline-none transition-all"
                      rows={3}
                      value={registryNote}
                      onChange={(e) => setRegistryNote(e.target.value)}
                    />

                    <button
                      onClick={handleRegistryVerification}
                      disabled={!selectedCaseForRegistry || verifying}
                      className="w-full py-4 bg-amber-700 text-white rounded-xl font-black text-xs uppercase hover:bg-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {verifying ? (
                        <Loader2 className="animate-spin mx-auto" size={20} />
                      ) : (
                        "Confirm Registry Action"
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "service" && (
              <motion.div
                key="service"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-amber-800 to-amber-900 rounded-2xl p-7 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <Navigation size={26} className="text-amber-300" />
                    <h3 className="text-xl font-black">Service of Process</h3>
                  </div>
                  <p className="text-amber-100/80 text-sm mb-4">
                    Record GPS-verified summons delivery.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-slate-200 dark:border-slate-800 shadow-lg">
                  {serviceError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl text-red-700 dark:text-red-400 text-xs flex items-center gap-2">
                      <AlertCircle size={14} /> {serviceError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <select
                      className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-amber-500 outline-none transition-all"
                      value={selectedCaseForService?.id || ""}
                      onChange={(e) => {
                        const selected = cases.find(
                          (c) => c.id === parseInt(e.target.value),
                        );
                        setSelectedCaseForService(selected || null);
                        setServiceError(null);
                      }}
                    >
                      <option value="">Select Case for Service</option>
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.caseNumber} - {c.title}
                        </option>
                      ))}
                    </select>

                    {gpsLocation && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs">
                        📍 GPS captured: {gpsLocation.lat.toFixed(6)},{" "}
                        {gpsLocation.lng.toFixed(6)}
                      </div>
                    )}

                    <button
                      onClick={handleServiceOfProcess}
                      disabled={!selectedCaseForService || serving}
                      className="w-full py-5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {serving ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Navigation size={18} />
                      )}
                      {serving
                        ? "Capturing GPS..."
                        : "Record Service of Process"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Documents Generation Modal */}
      <AnimatePresence>
        {documentsModal && selectedCaseForDocs && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 print:hidden">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setDocumentsModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black">Generate Documents</h2>
                  <p className="text-xs text-slate-500">
                    {selectedCaseForDocs.caseNumber} -{" "}
                    {selectedCaseForDocs.title}
                  </p>
                </div>
                <button
                  onClick={() => setDocumentsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Document Generation Buttons */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    Generate DRAFT Documents
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        type: "notice",
                        label: "Notice of Intention",
                        icon: FileText,
                      },
                      {
                        type: "summons",
                        label: "Summons to File Defence",
                        icon: FileCheck,
                      },
                      {
                        type: "originating",
                        label: "Originating Summons",
                        icon: Scale,
                      },
                      {
                        type: "directions",
                        label: "Summons for Directions",
                        icon: ChevronRight,
                      },
                      {
                        type: "extension",
                        label: "Extension of Time",
                        icon: Calendar,
                      },
                    ].map((doc) => (
                      <button
                        key={doc.type}
                        onClick={() =>
                          generateDocument(selectedCaseForDocs.id, doc.type)
                        }
                        disabled={generating === doc.type}
                        className="flex items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-all disabled:opacity-50 group"
                      >
                        <div className="flex items-center gap-2">
                          <doc.icon size={16} className="text-amber-600" />
                          <span className="text-xs font-medium">
                            {doc.label}
                          </span>
                        </div>
                        {generating === doc.type ? (
                          <Loader2
                            size={14}
                            className="animate-spin text-amber-600"
                          />
                        ) : (
                          <span className="text-[9px] font-bold text-amber-600 group-hover:text-amber-700">
                            Generate
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Existing Documents */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    Generated Documents
                  </h3>
                  {loadingDocuments ? (
                    <div className="flex justify-center py-8">
                      <Loader2
                        className="animate-spin text-amber-600"
                        size={24}
                      />
                    </div>
                  ) : caseDocuments.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No documents generated yet
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
                                <FileText
                                  size={16}
                                  className={
                                    isDraft
                                      ? "text-amber-600"
                                      : "text-emerald-600"
                                  }
                                />
                                <span className="font-semibold text-sm">
                                  {doc.displayDocumentType ||
                                    doc.documentType?.replace(/_/g, " ")}
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
                                Generated:{" "}
                                {new Date(doc.uploadedAt).toLocaleString()}
                                {doc.uploadedBy && (
                                  <span className="ml-2">
                                    by: {doc.uploadedBy}
                                  </span>
                                )}
                              </p>
                              {doc.certified && doc.certifiedBy && (
                                <p className="text-[9px] text-emerald-600 mt-1 flex items-center gap-1">
                                  <Stamp size={10} /> Sealed by:{" "}
                                  {doc.certifiedBy}
                                </p>
                              )}
                              {doc.certified && doc.verificationCode && (
                                <p className="text-[8px] text-blue-600 mt-1 font-mono">
                                  Code: {doc.verificationCode}
                                </p>
                              )}
                              {isDraft && (
                                <p className="text-[8px] text-amber-600 mt-1 flex items-center gap-1">
                                  <Stamp size={8} /> Awaiting verification and
                                  seal
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  downloadDocument(doc.id, doc.fileName)
                                }
                                disabled={downloading === doc.id}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                                title="Download"
                              >
                                {downloading === doc.id ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin text-amber-600"
                                  />
                                ) : (
                                  <Download size={16} />
                                )}
                              </button>
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

      {/* Upload Modal */}
      <AnimatePresence>
        {uploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setUploadModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-6 text-white">
                <h3 className="text-xl font-black">Upload Exhibit</h3>
                <p className="text-white/70 text-sm">
                  Scan and upload physical evidence
                </p>
              </div>

              <div className="p-6 space-y-4">
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-amber-500 outline-none transition-all"
                  value={selectedCaseId || ""}
                  onChange={(e) => setSelectedCaseId(parseInt(e.target.value))}
                >
                  <option value="">Select Case</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber}
                    </option>
                  ))}
                </select>

                <div
                  onClick={() => document.getElementById("fileInput")?.click()}
                  className="border-2 border-dashed border-slate-300 dark:border-slate-600 p-8 text-center cursor-pointer hover:border-amber-500 rounded-xl transition-all"
                >
                  {selectedFile ? (
                    <>
                      <FileText
                        className="mx-auto mb-2 text-amber-600"
                        size={32}
                      />
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Camera
                        className="mx-auto mb-2 text-slate-400"
                        size={32}
                      />
                      <p className="text-sm font-medium">
                        Click to scan/upload
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        PDF, Images (Max 25MB)
                      </p>
                    </>
                  )}
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                  />
                </div>

                <textarea
                  placeholder="Source/Origin (e.g., Received from court clerk)"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 resize-none focus:border-amber-500 outline-none transition-all"
                  rows={2}
                  value={uploadSource}
                  onChange={(e) => setUploadSource(e.target.value)}
                />

                <button
                  onClick={handleUploadExhibit}
                  disabled={
                    !selectedFile ||
                    !uploadSource ||
                    !selectedCaseId ||
                    uploading
                  }
                  className="w-full py-3 bg-amber-700 text-white rounded-xl font-black text-xs uppercase hover:bg-amber-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin mx-auto" size={20} />
                  ) : (
                    "Upload to Vault"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(ClerkDashboard, ["ROLE_CLERK"]);
