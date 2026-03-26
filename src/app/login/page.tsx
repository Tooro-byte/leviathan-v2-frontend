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
  Activity,
  Server,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const carouselItems = [
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=800&auto=format&fit=crop",
      title: "High Court Standards",
      desc: "Digital verification compliant with the Judicature Act and International Legal Protocols.",
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=800&auto=format&fit=crop",
      title: "Immutable Records",
      desc: "Blockchain-inspired ledger ensuring case file integrity and cryptographic sealing.",
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop",
      title: "Swift Justice",
      desc: "Accelerating legal processes through automated dossier management and digital filing.",
    },
    {
      type: "text",
      title: "Biometric Protocol",
      desc: "Your session is secured via 256-bit AES hardware-level encryption and fingerprint hashing.",
    },
    {
      type: "text",
      title: "Global Node Access",
      desc: "Access your legal dossiers securely from any verified terminal within the LexTracker network.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const handleUniversalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/signin", formData);

      // Extraction: Handling both 'token' and 'accessToken' naming conventions
      const { token, accessToken, username, roles, email } = response.data;
      const finalToken = accessToken || token;

      if (finalToken) {
        // GOLDEN SYNC: Key must match the AUTH_TOKEN_KEY in lib/api.ts
        localStorage.setItem("lextracker_access_token", finalToken);
        localStorage.setItem("userName", username);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("roles", JSON.stringify(roles));

        // Logic-based Redirection
        if (roles.includes("ROLE_LAWYER")) {
          router.push("/dashboard");
        } else if (roles.includes("ROLE_CLERK")) {
          router.push("/dashboard/clerk");
        } else if (roles.includes("ROLE_CLIENT")) {
          router.push("/dashboard/client");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      // Pulls the standardized error from your api.ts interceptor
      setError(
        err.message?.toUpperCase() ||
          "AUTHORIZATION FAILED. CHECK VAULT CREDENTIALS.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#001F3F] font-sans text-white/90 selection:bg-teal-500/30">
      {/* LEFT PANE: SYSTEM STATUS */}
      <div className="hidden lg:flex lg:w-[25%] flex-col justify-between p-12 border-r border-white/5 bg-[#001933] relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20 group cursor-default">
            <Scale className="h-6 w-6 text-blue-400 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-black tracking-[0.3em] uppercase text-white">
              LexTracker
            </span>
          </div>
          <div className="space-y-12">
            <div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase mb-2 leading-none">
                please login
              </h1>
              <div className="h-1 w-8 bg-blue-500" />
            </div>
            <div className="space-y-6">
              {[
                {
                  icon: ShieldCheck,
                  label: "SSL Secure",
                  sub: "ENCRYPT_AES_256",
                },
                {
                  icon: Database,
                  label: "Immutable Ledger",
                  sub: "DB_SYNC_ACTIVE",
                },
                { icon: Globe, label: "Global Node", sub: "NODE_KAMPALA_01" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 text-white/40 group"
                >
                  <div className="p-2 bg-white/5 border border-white/5">
                    <item.icon size={14} className="text-blue-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                      {item.label}
                    </span>
                    <span className="text-[8px] text-blue-400/40 font-mono">
                      {item.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="p-4 bg-black/20 border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-[8px] font-mono tracking-tighter">
              <span className="text-white/40 uppercase">System Load</span>
              <span className="text-teal-400">0.042ms</span>
            </div>
            <div className="w-full h-1 bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "40%" }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
                className="h-full bg-blue-500/50"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[9px] text-white/20 uppercase tracking-[0.4em]">
              Auth-Protocol: v4.0.2
            </p>
            <p className="text-[9px] text-blue-400/40 uppercase tracking-[0.4em]">
              Leviathan Ledger OS
            </p>
          </div>
        </div>
      </div>

      {/* CENTER PANE: CAROUSEL */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center relative overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "anticipate" }}
            className="absolute inset-0 w-full h-full"
          >
            {carouselItems[currentSlide].type === "image" ? (
              <>
                <img
                  src={carouselItems[currentSlide].url}
                  className="w-full h-full object-cover opacity-30 grayscale brightness-50"
                  alt="Context"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#001F3F] via-transparent to-[#001F3F]/50" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-20 bg-[#001830]">
                <Fingerprint className="absolute h-96 w-96 text-blue-500/5 rotate-12" />
                <motion.div
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Cpu className="h-16 w-16 text-blue-500/20 mx-auto mb-4" />
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="relative z-10 p-16 text-left w-full mt-auto">
          <motion.div
            key={`text-${currentSlide}`}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-md"
          >
            <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 leading-none text-white">
              {carouselItems[currentSlide].title}
            </h3>
            <p className="text-blue-100/40 text-xs font-bold uppercase tracking-[0.2em] leading-relaxed border-l-2 border-blue-500/30 pl-4">
              {carouselItems[currentSlide].desc}
            </p>
          </motion.div>
          <div className="flex gap-3 mt-12">
            {carouselItems.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 transition-all duration-700 ${i === currentSlide ? "w-16 bg-blue-500" : "w-3 bg-white/10"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: FORM */}
      <div className="w-full lg:w-[30%] bg-[#002828] flex items-center justify-center p-8 border-l border-white/5 relative">
        <div className="w-full max-w-[320px] relative z-10">
          <div className="mb-12">
            <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-8 rotate-45">
              <Fingerprint className="-rotate-45 text-teal-400" size={28} />
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-teal-400 mb-2">
              Secure Terminal
            </h2>
            <p className="text-white/20 text-[9px] uppercase tracking-widest leading-loose">
              Identify yourself to the Leviathan Ledger Protocol to initiate
              workspace decryption.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleUniversalLogin}>
            {error && (
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="p-4 bg-red-500/10 border-l-2 border-red-500 text-red-400 text-[9px] font-black uppercase tracking-widest"
              >
                {error}
              </motion.div>
            )}
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-teal-400 transition-colors"
                size={14}
              />
              <input
                type="email"
                required
                placeholder="VAULT ID (EMAIL)"
                className="w-full pl-12 pr-4 py-5 bg-black/30 border border-white/5 focus:border-teal-500/50 outline-none transition-all text-[11px] font-bold lowercase tracking-[0.1em] text-white"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-teal-400 transition-colors"
                size={14}
              />
              <input
                type="password"
                required
                placeholder="SECURE PASSCODE"
                className="w-full pl-12 pr-4 py-5 bg-black/30 border border-white/5 focus:border-teal-500/50 outline-none transition-all text-[11px] font-bold tracking-[0.2em] text-white"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <button
              disabled={loading}
              className="w-full bg-teal-600 text-white py-5 font-black text-[10px] uppercase tracking-[0.5em] hover:bg-teal-500 transition-all flex items-center justify-center gap-3 mt-8 border border-teal-400/20 shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  login <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col items-center gap-6">
            <Link
              href="/signup"
              className="text-[10px] font-black text-white/20 hover:text-teal-400 uppercase tracking-[0.3em]"
            >
              Register New Legal Entity
            </Link>
            <div className="flex justify-center gap-4 opacity-10">
              <Activity size={12} />
              <Server size={12} />
              <Cpu size={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
