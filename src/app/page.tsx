"use client";

import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Scale,
  Shield,
  Zap,
  FileText,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
    alt: "Legal gavel",
    caption: "Modern Judiciary Infrastructure",
  },
  {
    url: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070",
    alt: "Secure evidence",
    caption: "Immutable Chain of Custody",
  },
  {
    url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070",
    alt: "Legal professional",
    caption: "Real-time Transparency",
  },
];

const BackgroundOrbs = memo(() => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <motion.div
      animate={{ x: [0, 120, 0], y: [0, -80, 0] }}
      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      className="absolute top-20 right-20 w-[800px] h-[800px] bg-teal-500/10 blur-[160px] rounded-full"
    />
    <motion.div
      animate={{ x: [0, -100, 0], y: [0, 90, 0] }}
      transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      className="absolute bottom-32 left-32 w-[600px] h-[600px] bg-yellow-400/10 blur-[140px] rounded-full"
    />
  </div>
));
BackgroundOrbs.displayName = "BackgroundOrbs";

export default function LexTrackerLanding() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#0F172A] text-white font-sans overflow-hidden">
      <BackgroundOrbs />

      {/* Elegant Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 p-3 rounded-2xl">
              <Scale className="h-8 w-8 text-[#0F172A]" />
            </div>
            <div>
              <span className="text-3xl font-black tracking-[-2px]">LEXTRACKER</span>
              <p className="text-[10px] text-teal-400 tracking-[3px] -mt-1">LEVIATHAN SUITE</p>
            </div>
          </div>

          <div className="flex items-center gap-10 text-sm font-medium">
            <Link href="#who-we-are" className="hover:text-teal-400 transition-colors">Who We Are</Link>
            <Link href="#what-we-do" className="hover:text-teal-400 transition-colors">What We Do</Link>
            <Link href="#values" className="hover:text-teal-400 transition-colors">Our Values</Link>
            <Link href="/login" className="hover:text-yellow-400 transition-colors">Login</Link>
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-[#0F172A] font-semibold rounded-2xl transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 lg:pt-44 lg:pb-32">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 border border-teal-400/30 rounded-full mb-8"
          >
            <Shield className="h-4 w-4 text-teal-400" />
            <span className="uppercase text-xs tracking-[3px] font-semibold text-teal-400">
              Justice • Digitized • Uganda
            </span>
          </motion.div>

          <h1 className="text-6xl lg:text-7xl font-black tracking-[-3px] leading-none mb-8">
            Justice Digitized.<br />
            Integrity Restored.
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-slate-300 leading-relaxed">
            Uganda’s premier legal technology platform. Ending the missing file crisis with 
            immutable audit trails, seamless court forms, and uncompromising transparency.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
            <Link
              href="/signup"
              className="px-10 py-5 bg-yellow-400 hover:bg-yellow-300 text-[#0F172A] font-bold rounded-2xl flex items-center justify-center gap-3 text-lg transition-all shadow-xl"
            >
              Begin Your Journey
              <ArrowRight className="h-5 w-5" />
            </Link>
            <button className="px-10 py-5 border border-white/40 hover:border-white/70 rounded-2xl font-medium text-lg transition-all">
              Watch the Experience
            </button>
          </div>
        </div>
      </section>

      {/* Large Visual Carousel */}
      <section className="pb-24 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative h-[520px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <Image
                  src={carouselImages[currentIndex].url}
                  alt={carouselImages[currentIndex].alt}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-16 left-16 right-16">
              <p className="text-4xl font-semibold tracking-tight text-white leading-tight">
                {carouselImages[currentIndex].caption}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are - Scroll Reveal */}
      <section id="who-we-are" className="py-24 bg-[#0A1428]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-8 text-center"
        >
          <h2 className="text-5xl font-black tracking-tighter mb-8">
            Who We Are
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            LexTracker is a boutique legal technology platform built for the realities of Ugandan justice. 
            We combine cutting-edge security with practical innovation to deliver exceptional transparency and efficiency.
          </p>
        </motion.div>
      </section>

      {/* What We Do - Scroll Reveal */}
      <section id="what-we-do" className="py-24 bg-[#0F172A]">
        <div className="max-w-6xl mx-auto px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black tracking-tighter text-center mb-16"
          >
            What We Do
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Immutable Evidence Vault",
                desc: "Every document is cryptographically secured with AES-256 encryption and timestamped on an immutable ledger.",
              },
              {
                icon: FileText,
                title: "Seamless Court Automation",
                desc: "Generate perfectly compliant Ugandan court forms and submissions with one click, meeting the highest judicial standards.",
              },
              {
                icon: Zap,
                title: "Integrated Treasury & Payments",
                desc: "Accept legal fees via Mobile Money and track all financials with full audit transparency.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-10 hover:border-teal-400/50 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-400/10 flex items-center justify-center mb-8">
                  <item.icon className="h-7 w-7 text-teal-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values - Scroll Reveal */}
      <section id="values" className="py-24 bg-[#0A1428]">
        <div className="max-w-4xl mx-auto px-8">
          <motion.h2 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black tracking-tighter text-center mb-16"
          >
            Our Core Values
          </motion.h2>

          <div className="space-y-16">
            {[
              { title: "Excellence", desc: "Our commitment to excellence drives us to deliver innovative solutions that consistently exceed the expectations of lawyers, clients, and the Judiciary." },
              { title: "Integrity", desc: "We uphold the highest standards of ethics and transparency. Every action is traceable, every record immutable." },
              { title: "A Strong Team", desc: "We bring together exceptional legal technologists and domain experts dedicated to restoring trust in Uganda’s justice system." },
            ].map((value, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col md:flex-row gap-8 items-start border-l-4 border-teal-400 pl-8"
              >
                <div className="text-6xl font-black text-teal-400/20 md:w-20 flex-shrink-0">0{i + 1}</div>
                <div>
                  <h3 className="text-3xl font-semibold mb-4 text-white">{value.title}</h3>
                  <p className="text-lg text-slate-300 leading-relaxed">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#05101F] py-20 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-8 grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-yellow-400 p-3 rounded-2xl">
                <Scale className="h-8 w-8 text-[#0F172A]" />
              </div>
              <span className="text-3xl font-black tracking-tighter">LEXTRACKER</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Securing justice through technology. Excellence. Integrity. Transparency.
            </p>
          </div>

          <div>
            <h4 className="text-yellow-400 font-semibold mb-6 text-sm tracking-widest">PLATFORM</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Client Portal</li>
              <li>Lawyer Dashboard</li>
              <li>Evidence Vault</li>
            </ul>
          </div>

          <div>
            <h4 className="text-yellow-400 font-semibold mb-6 text-sm tracking-widest">COMPANY</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>About LexTracker</li>
              <li>Compliance</li>
              <li>Contact Us</li>
            </ul>
          </div>

          <div>
            <h4 className="text-yellow-400 font-semibold mb-6 text-sm tracking-widest">REACH US</h4>
            <div className="space-y-3 text-sm text-slate-400">
              <p>hello@lextracker.ug</p>
              <p>+256 700 123 456</p>
              <p className="pt-6 text-xs">Kampala, Uganda</p>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 mt-20 tracking-widest">
          © {new Date().getFullYear()} LexTracker Uganda • Built for the Bar • Justice, Digitized with Integrity
        </div>
      </footer>
    </div>
  );
}