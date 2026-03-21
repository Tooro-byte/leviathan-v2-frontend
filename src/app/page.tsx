"use client";

import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Shield,
  Zap,
  FileText,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
    alt: "Legal gavel on a desk",
    caption: "Modern Judiciary Infrastructure in Uganda",
  },
  {
    url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070",
    alt: "Law library books",
    caption: "Secure Digital Chain of Custody",
  },
  {
    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070",
    alt: "Legal professional signing documents",
    caption: "Lawyer Dashboard – Real-time Transparency",
  },
  {
    url: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073",
    alt: "Modern office building architecture",
    caption: "Immutable Evidence Vault",
  },
  {
    url: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?q=80&w=2070",
    alt: "Corporate scales of justice",
    caption: "Empowering Ugandan Lawyers",
  },
];

const BackgroundOrbs = memo(() => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <motion.div
      animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-200/30 blur-[120px] rounded-full"
    />
    <motion.div
      animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 blur-[100px] rounded-full"
    />
  </div>
));
BackgroundOrbs.displayName = "BackgroundOrbs";

export default function LandingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative bg-[#F8FAFC] min-h-screen font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <BackgroundOrbs />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-indigo-900" />
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              LexTracker
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/login"
              className="text-slate-600 font-bold hover:text-indigo-900 transition-colors hidden md:block"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 bg-indigo-900 text-white font-black rounded-lg hover:bg-indigo-800 shadow-md transition-all active:scale-95 text-sm uppercase tracking-widest"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 text-center">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-indigo-900 text-[10px] font-black uppercase tracking-widest"
          >
            <Shield size={12} /> Registered with Data Protection Office
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter"
          >
            Justice, <span className="text-indigo-900">Digitized.</span>
            <br />
            Corruption, <span className="text-red-600">Eradicated.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-lg lg:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium"
          >
            Uganda’s lawyer-first platform ending the “missing file” crisis with
            immutable audit trails, one-click forms, and total transparency.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              href="/signup"
              className="px-8 py-4 bg-indigo-900 text-white text-sm font-black rounded-xl hover:bg-slate-900 shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
            <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 text-sm font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest">
              Watch Demo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Image Carousel */}
      <section className="pb-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative h-[350px] lg:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white bg-slate-200">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="absolute inset-0 w-full h-full"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Image
                  src={carouselImages[currentIndex].url}
                  alt={carouselImages[currentIndex].alt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-10 left-10 z-10">
              <p className="text-2xl lg:text-3xl font-black text-white tracking-tighter">
                {carouselImages[currentIndex].caption}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">
              Built for Uganda&apos;s{" "}
              <span className="text-indigo-900">Legal Reality</span>
            </h2>
            <div className="h-1.5 w-20 bg-indigo-900 mt-4 rounded-full" />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Chain of Custody",
                desc: "Every file upload creates a unique digital fingerprint. It's impossible to 'lose' a file.",
                bg: "bg-emerald-50",
                accent: "text-emerald-700",
                shadow: "hover:shadow-emerald-100",
              },
              {
                icon: FileText,
                title: "Court Form Automation",
                desc: "Generate Summons and Notices that strictly follow Ugandan High Court standards.",
                bg: "bg-amber-50",
                accent: "text-amber-700",
                shadow: "hover:shadow-amber-100",
              },
              {
                icon: Zap,
                title: "Integrated Payments",
                desc: "Accept legal fees via MTN MoMo or Airtel Money directly into your firm's wallet.",
                bg: "bg-sky-50",
                accent: "text-sky-700",
                shadow: "hover:shadow-sky-100",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className={`p-8 rounded-[2rem] border border-slate-100 transition-all cursor-default shadow-sm ${feature.bg} ${feature.shadow} hover:shadow-2xl`}
              >
                <div className="mb-6 inline-block p-4 bg-white rounded-2xl shadow-sm">
                  <feature.icon className={`h-6 w-6 ${feature.accent}`} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 bg-indigo-900 text-white text-center rounded-[3rem] mx-6 mb-24 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid md:grid-cols-3 gap-12">
          <div>
            <p className="text-6xl font-black tracking-tighter mb-2">25+</p>
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">
              Hours Saved Monthly
            </p>
          </div>
          <div>
            <p className="text-6xl font-black tracking-tighter mb-2">70%</p>
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">
              Reduction in Delays
            </p>
          </div>
          <div>
            <p className="text-6xl font-black tracking-tighter mb-2">100%</p>
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">
              Audit Transparency
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-20 px-6 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <Scale className="h-7 w-7 text-indigo-400" />
              <span className="text-2xl font-black text-white tracking-tighter">
                LexTracker
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-8">
              Securing the future of Ugandan law. Protecting counsel, empowering
              clients, and restoring the integrity of the judicial process.
            </p>
            <div className="flex gap-4">
              <Facebook
                size={18}
                className="hover:text-white cursor-pointer transition-colors"
              />
              <Twitter
                size={18}
                className="hover:text-white cursor-pointer transition-colors"
              />
              <Linkedin
                size={18}
                className="hover:text-white cursor-pointer transition-colors"
              />
            </div>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              Product
            </h4>
            <ul className="space-y-4 text-xs font-bold">
              <li className="hover:text-white transition-colors cursor-pointer">
                Case Management
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Evidence Vault
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                MoMo Integration
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              Resources
            </h4>
            <ul className="space-y-4 text-xs font-bold">
              <li className="hover:text-white transition-colors cursor-pointer">
                Judiciary Portal
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Help Center
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                Privacy Policy
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              Support
            </h4>
            <div className="space-y-4 text-xs font-bold">
              <p className="flex items-center gap-3">
                <Mail size={14} className="text-indigo-400" />{" "}
                hello@lextracker.ug
              </p>
              <p className="flex items-center gap-3">
                <Phone size={14} className="text-indigo-400" /> +256 700 000 000
              </p>
              <p className="mt-6 text-[9px] text-slate-600 uppercase tracking-widest">
                Kampala, Uganda
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-slate-900 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
            © {new Date().getFullYear()} LexTracker Uganda. Built for the Bar.
          </p>
        </div>
      </footer>
    </div>
  );
}
