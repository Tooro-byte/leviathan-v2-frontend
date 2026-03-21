"use client";

import { useState, useEffect } from "react";
import {
  Scale,
  UserCircle,
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
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
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  const carouselItems = [
    {
      title: "Immutable Audit Trails",
      desc: "Every document interaction is timestamped and locked.",
    },
    {
      title: "Secure Case Vault",
      desc: "End-to-end encryption for sensitive legal correspondence.",
    },
    {
      title: "Transparency First",
      desc: "Real-time updates on your case status directly from the registry.",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/api/auth/signup", { ...formData, role: "CLIENT" });
      router.push("/login?message=Client account initialized successfully");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#004267] font-sans text-white/90">
      {/* LEFT PANE: BRANDING & PROGRESS */}
      <div className="hidden lg:flex lg:w-[30%] flex-col justify-between p-12 border-r border-white/5">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <Scale className="h-7 w-7 text-blue-400" />
            <span className="text-lg font-black tracking-tighter uppercase">
              LexTracker
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4 leading-tight tracking-tight">
            Client <br />
            Registration
          </h1>
          <p className="text-blue-100/40 text-xs mb-12 max-w-[200px]">
            Access the Digital Legal Registry of Uganda.
          </p>

          <div className="space-y-8 relative">
            {[
              {
                step: "01",
                title: "Identity",
                desc: "Legal Name & Credentials",
              },
              {
                step: "02",
                title: "Security",
                desc: "Passcode Initialization",
              },
              { step: "03", title: "Vault", desc: "Dossier Access" },
            ].map((s, i) => (
              <div key={i} className="flex gap-5 items-center">
                <div
                  className={`text-[10px] font-black p-2 border ${i === 0 ? "border-blue-400 text-blue-400" : "border-white/10 text-white/20"}`}
                >
                  {s.step}
                </div>
                <div>
                  <h4
                    className={`text-[11px] font-black uppercase tracking-widest ${i === 0 ? "text-white" : "text-white/20"}`}
                  >
                    {s.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[9px] text-white/20 uppercase tracking-[0.3em]">
          Registry Secure Terminal
        </p>
      </div>

      {/* CENTER PANE: SLEEK CAROUSEL */}
      <div className="hidden lg:flex lg:w-[40%] items-center justify-center p-12 bg-black/5">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-left"
            >
              <div className="h-1 w-12 bg-blue-500 mb-8" />
              <h3 className="text-3xl font-bold mb-4 tracking-tighter">
                {carouselItems[currentSlide].title}
              </h3>
              <p className="text-blue-100/40 text-sm leading-relaxed font-medium">
                {carouselItems[currentSlide].desc}
              </p>
            </motion.div>
          </AnimatePresence>
          <div className="flex gap-2 mt-12">
            {carouselItems.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 transition-all duration-500 ${i === currentSlide ? "w-12 bg-blue-400" : "w-4 bg-white/10"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: SMART & SMALL FORM */}
      {/* Removed border radius (rounded-none) and matched color (#004267) */}
      <div className="w-full lg:w-[30%] bg-[#004267] flex items-center justify-center p-8 border-l border-white/5">
        <div className="w-full max-w-[320px]">
          {" "}
          {/* Shrunk to 320px for a "smarter" look */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-blue-400 mb-2">
              Authentication
            </h2>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">
              Initialize Member Session
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSignup}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-tight">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  size={16}
                />
                <input
                  type="text"
                  required
                  placeholder="USER ID"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-none focus:border-blue-500/50 outline-none transition-all text-[11px] font-bold uppercase tracking-widest placeholder:text-white/10"
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  size={16}
                />
                <input
                  type="email"
                  required
                  placeholder="EMAIL ADDRESS"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-none focus:border-blue-500/50 outline-none transition-all text-[11px] font-bold uppercase tracking-widest placeholder:text-white/10"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  size={16}
                />
                <input
                  type="password"
                  required
                  placeholder="SECURE PASSCODE"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-none focus:border-blue-500/50 outline-none transition-all text-[11px] font-bold uppercase tracking-widest placeholder:text-white/10"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-none font-black text-[10px] uppercase tracking-[0.4em] hover:bg-blue-500 transition-all flex items-center justify-center gap-2 mt-6 border border-blue-400/20"
            >
              {loading ? "PROCESSING..." : "REGISTER CLIENT"}
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>
          <div className="mt-10 pt-6 border-t border-white/5 text-center">
            <Link
              href="/login"
              className="text-[10px] font-black text-white/30 hover:text-blue-400 uppercase tracking-[0.2em] transition-colors"
            >
              Existing Member?{" "}
              <span className="text-white border-b border-white/20 pb-0.5 ml-1">
                Login
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
