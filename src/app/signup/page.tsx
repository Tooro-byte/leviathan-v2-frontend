"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Database,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "CLIENT", // Changed from array to string
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const carouselItems = [
    {
      title: "Immutable Audit Trails",
      desc: "Every document interaction is timestamped and cryptographically locked within the ledger.",
    },
    {
      title: "Secure Case Vault",
      desc: "End-to-end AES-256 encryption for all sensitive legal correspondence and evidence.",
    },
    {
      title: "Transparency First",
      desc: "Real-time updates on your case status directly from the High Court digital registry.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [carouselItems.length]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // CLEAR OLD CREDENTIALS: This prevents the 'Session Expired' error
    localStorage.removeItem("lextracker_access_token");

    try {
      // FIXED: Send role as a string, not an array
      // Backend expects a single string value for the role field
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role, // Now sending "CLIENT" as a string
      };

      console.log("Signup payload:", payload);

      const response = await api.post("/api/auth/signup", payload);

      console.log("Signup successful:", response.data);

      // Redirect with a success message
      router.push("/login?success=Account Initialized");
    } catch (err: any) {
      console.error("Signup error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Registration Protocol Failed.";
      setError(message.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#001F3F] font-sans text-white/90 selection:bg-blue-500/30">
      {/* LEFT PANE: IDENTITY & PROGRESS */}
      <div className="hidden lg:flex lg:w-[25%] flex-col justify-between p-12 border-r border-white/5 bg-[#001933] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20 group cursor-default">
            <Scale className="h-6 w-6 text-blue-400" />
            <span className="text-sm font-black tracking-[0.3em] uppercase text-white">
              LexTracker
            </span>
          </div>

          <div className="space-y-12">
            <div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase mb-2 leading-none">
                Client <br /> Registration
              </h1>
              <div className="h-1 w-8 bg-blue-500" />
            </div>

            <div className="space-y-8">
              {[
                { step: "01", title: "Identity", sub: "Legal Name" },
                { step: "02", title: "Security", sub: "Vault Access" },
                { step: "03", title: "Finalize", sub: "Initialization" },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 items-center group">
                  <div
                    className={`text-[10px] font-black w-8 h-8 flex items-center justify-center border ${i === 0 ? "border-blue-500 text-blue-400 bg-blue-500/5" : "border-white/10 text-white/20"}`}
                  >
                    {s.step}
                  </div>
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? "text-white" : "text-white/20"}`}
                    >
                      {s.title}
                    </span>
                    <span className="text-[8px] text-white/10 uppercase font-mono tracking-tighter">
                      {s.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[9px] text-white/10 uppercase tracking-[0.4em]">
          Registry Secure Terminal v4.0
        </p>
      </div>

      {/* CENTER PANE: INFO CAROUSEL */}
      <div className="hidden lg:flex lg:w-[45%] items-center justify-center relative overflow-hidden bg-black/20">
        <div className="w-full max-w-md p-12 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <ShieldCheck className="text-blue-500/20 mb-8" size={48} />
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-6 leading-none text-white">
                {carouselItems[currentSlide].title}
              </h3>
              <p className="text-blue-100/40 text-sm font-medium leading-relaxed border-l-2 border-blue-500/30 pl-6 uppercase tracking-wider">
                {carouselItems[currentSlide].desc}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-3 mt-16">
            {carouselItems.map((_, i) => (
              <div
                key={i}
                className={`h-1 transition-all duration-700 ${i === currentSlide ? "w-16 bg-blue-500" : "w-3 bg-white/10"}`}
              />
            ))}
          </div>
        </div>
        <Database
          className="absolute bottom-[-10%] right-[-5%] text-white/[0.02]"
          size={400}
        />
      </div>

      {/* RIGHT PANE: SIGNUP FORM */}
      <div className="w-full lg:w-[30%] bg-[#002828] flex items-center justify-center p-8 border-l border-white/5 relative">
        <div className="w-full max-w-[320px] relative z-10">
          <div className="mb-12">
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em] text-blue-400 mb-2">
              Member Session
            </h2>
            <p className="text-white/20 text-[9px] uppercase tracking-widest leading-loose">
              Establish your digital legal identity within the Leviathan
              ecosystem.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSignup}>
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
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-400 transition-colors"
                size={14}
              />
              <input
                type="text"
                required
                placeholder="FULL LEGAL NAME"
                className="w-full pl-12 pr-4 py-5 bg-black/30 border border-white/5 rounded-none focus:border-blue-500/50 outline-none transition-all text-[11px] font-bold uppercase tracking-[0.1em] placeholder:text-white/5 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                value={formData.username}
              />
            </div>

            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-400 transition-colors"
                size={14}
              />
              <input
                type="email"
                required
                placeholder="EMAIL ADDRESS"
                className="w-full pl-12 pr-4 py-5 bg-black/30 border border-white/5 rounded-none focus:border-blue-500/50 outline-none transition-all text-[11px] font-bold lowercase tracking-[0.1em] placeholder:text-white/5 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                value={formData.email}
              />
            </div>

            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-400 transition-colors"
                size={14}
              />
              <input
                type="password"
                required
                placeholder="SECURE PASSCODE"
                className="w-full pl-12 pr-4 py-5 bg-black/30 border border-white/5 rounded-none focus:border-blue-500/50 outline-none transition-all text-[11px] font-bold tracking-[0.2em] placeholder:text-white/5 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                value={formData.password}
              />
            </div>

            {/* Optional: Role selector - hidden since it's always CLIENT */}
            <input type="hidden" name="role" value="CLIENT" />

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-5 font-black text-[10px] uppercase tracking-[0.5em] hover:bg-blue-500 transition-all flex items-center justify-center gap-3 mt-8 border border-blue-400/20 shadow-xl"
            >
              {loading ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  INITIALIZE ACCESS <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-16 pt-8 border-t border-white/5 text-center">
            <Link
              href="/login"
              className="text-[10px] font-black text-white/20 hover:text-blue-400 uppercase tracking-[0.3em]"
            >
              Existing Member?{" "}
              <span className="text-white ml-2 underline underline-offset-4">
                Login
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
