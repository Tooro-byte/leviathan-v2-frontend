"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Fingerprint,
  Loader2,
  Globe,
  Database,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const carouselItems = [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop",
      title: "High Court Standards",
      desc: "Digital verification compliant with the Judicature Act.",
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800&auto=format&fit=crop",
      title: "Immutable Records",
      desc: "Blockchain-inspired ledger for case file integrity.",
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop",
      title: "Swift Justice",
      desc: "Accelerating legal processes through digital transformation.",
    },
    {
      type: "text",
      title: "Biometric Protocol",
      desc: "Your session is secured via 256-bit AES encryption and fingerprint hashing.",
    },
    {
      type: "text",
      title: "Global Access",
      desc: "Access your legal dossiers securely from any verified terminal worldwide.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleUniversalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/signin", formData);
      const { token, accessToken, username, roles } = response.data;
      const finalToken = token || accessToken;

      if (finalToken) {
        localStorage.setItem("lextracker_access_token", finalToken);
        localStorage.setItem("userName", username);
        localStorage.setItem("roles", JSON.stringify(roles));

        // UNIVERSAL ROUTER: The system decides where you go
        if (roles.includes("ROLE_LAWYER")) router.push("/dashboard/lawyer");
        else if (roles.includes("ROLE_CLERK")) router.push("/dashboard/clerk");
        else if (roles.includes("ROLE_CLIENT"))
          router.push("/dashboard/client");
        else router.push("/dashboard");
      }
    } catch (err: any) {
      setError(
        "Authorization Failed. Please verify your Vault ID and Passcode.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#001F3F] font-sans text-white/90">
      {/* LEFT PANE: SYSTEM STATUS & BRANDING */}
      <div className="hidden lg:flex lg:w-[25%] flex-col justify-between p-12 border-r border-white/5 bg-[#001933]">
        <div>
          <div className="flex items-center gap-3 mb-20">
            <Scale className="h-6 w-6 text-blue-400" />
            <span className="text-sm font-black tracking-[0.3em] uppercase text-white">
              LexTracker
            </span>
          </div>

          <div className="space-y-12">
            <div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase mb-2">
                Central
                <br />
                Gateway
              </h1>
              <div className="h-1 w-8 bg-blue-500" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 text-white/40">
                <ShieldCheck size={16} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  SSL Secure
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/40">
                <Database size={16} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Encrypted DB
                </span>
              </div>
              <div className="flex items-center gap-4 text-white/40">
                <Globe size={16} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Global Node
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.4em]">
            Auth-Protocol: v4.0.2
          </p>
          <p className="text-[9px] text-blue-400/40 uppercase tracking-[0.4em]">
            Region: Kampala, UG
          </p>
        </div>
      </div>

      {/* CENTER PANE: THE MULTIMEDIA CAROUSEL */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center relative overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            {carouselItems[currentSlide].type === "image" ? (
              <>
                <img
                  src={carouselItems[currentSlide].url}
                  className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
                  alt="Legal Context"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001F3F] via-transparent to-transparent" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-20 bg-[#001830]">
                <Fingerprint className="absolute h-64 w-64 text-blue-500/5 rotate-12" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 p-16 text-left w-full mt-auto">
          <motion.div
            key={`text-${currentSlide}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="max-w-md"
          >
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">
              {carouselItems[currentSlide].title}
            </h3>
            <p className="text-blue-100/50 text-xs font-bold uppercase tracking-widest leading-relaxed">
              {carouselItems[currentSlide].desc}
            </p>
          </motion.div>

          <div className="flex gap-2 mt-10">
            {carouselItems.map((_, i) => (
              <div
                key={i}
                className={`h-1 transition-all duration-500 ${i === currentSlide ? "w-12 bg-blue-500" : "w-2 bg-white/10"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: UNIVERSAL LOGIN FORM */}
      <div className="w-full lg:w-[30%] bg-[#002828] flex items-center justify-center p-8 border-l border-white/5">
        <div className="w-full max-w-[320px]">
          <div className="mb-12">
            <Fingerprint className="h-10 w-10 text-teal-400 mb-6" />
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-teal-400 mb-2">
              Member Login
            </h2>
            <p className="text-white/20 text-[9px] uppercase tracking-widest leading-loose">
              Enter your Vault credentials to access your designated workspace.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleUniversalLogin}>
            {error && (
              <div className="p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-teal-400 transition-colors"
                  size={16}
                />
                <input
                  type="text"
                  required
                  placeholder="VAULT ID / EMAIL"
                  className="w-full pl-12 pr-4 py-5 bg-black/20 border border-white/5 rounded-none focus:border-teal-500/50 outline-none transition-all text-[11px] font-black uppercase tracking-widest placeholder:text-white/5 text-white"
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-teal-400 transition-colors"
                  size={16}
                />
                <input
                  type="password"
                  required
                  placeholder="SECURE PASSCODE"
                  className="w-full pl-12 pr-4 py-5 bg-black/20 border border-white/5 rounded-none focus:border-teal-500/50 outline-none transition-all text-[11px] font-black uppercase tracking-widest placeholder:text-white/5 text-white"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-teal-600 text-white py-5 rounded-none font-black text-[10px] uppercase tracking-[0.5em] hover:bg-teal-500 active:bg-teal-700 transition-all flex items-center justify-center gap-3 mt-8 border border-teal-400/20 shadow-2xl"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                "AUTHENTICATE"
              )}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-6">
            <Link
              href="/signup"
              className="text-[10px] font-black text-white/20 hover:text-teal-400 uppercase tracking-[0.3em] transition-all text-center"
            >
              New Firm Registration
            </Link>
            <div className="flex justify-center gap-4 opacity-20">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
