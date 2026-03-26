"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import {
  MapPin,
  ClipboardList,
  Camera,
  Navigation,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import withAuth from "@/components/auth/withAuth";

function ClerkDashboard() {
  const [serving, setServing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOGIC: Verified GPS Service of Process
  const handleServiceOfProcess = () => {
    setServing(true);
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("GPS not supported on this device.");
      setServing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Sending coordinates to the backend for SHA-256 Fingerprinting
          await api.post("/api/v1/service-of-process/verify", {
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString(),
          });

          setServing(false);
          // In a real app, use a Toast notification here instead of alert()
          console.log("📍 Location Hashed to Vault.");
        } catch (err: any) {
          setError(err.message || "Failed to secure GPS data.");
          setServing(false);
        }
      },
      (err) => {
        setError("Location access denied. Please enable GPS.");
        setServing(false);
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
      <header className="mb-10 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded">
              Registry PWA
            </span>
            <span className="text-slate-400 text-[10px] font-bold">
              V 1.0.4
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            Registry Command
          </h1>
        </div>
      </header>

      {/* ERROR BANNER */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-bold"
        >
          <AlertCircle size={18} /> {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* TASK FULFILLMENT */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-2">
              <ClipboardList size={18} className="text-indigo-600" /> Task
              Fulfillment
            </h3>
            <div className="grid gap-4">
              {[
                { task: "Pay filing fees (Stanbic)", id: "001" },
                { task: "Registry Verification: HCT-002", id: "002" },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-200"
                >
                  <span className="font-black text-slate-800">{item.task}</span>
                  <button className="flex items-center gap-2 px-6 py-2 bg-indigo-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-900 transition-colors">
                    <CheckCircle2 size={14} /> Close Task
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* EXHIBIT VAULT INGEST */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
              Exhibit Vault Ingest
            </h3>
            <motion.label
              whileTap={{ scale: 0.98 }}
              className="p-12 border-4 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center bg-indigo-50/30 group cursor-pointer transition-all hover:border-indigo-300"
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
              />
              <div className="p-6 bg-white rounded-3xl shadow-lg mb-4 group-hover:bg-indigo-900 group-hover:text-white transition-all">
                <Camera size={40} />
              </div>
              <p className="font-black text-slate-800">
                Scan & Upload Evidence
              </p>
              <p className="text-xs text-slate-500 mt-1 font-bold italic">
                Integrity Shield automatically applied on upload
              </p>
            </motion.label>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          {/* SERVICE OF PROCESS */}
          <div className="bg-indigo-900 rounded-[3rem] p-8 text-white shadow-2xl sticky top-24">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 mb-6 text-center">
              Field Logistics
            </h3>
            <div className="flex justify-center mb-6">
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center border border-white/20 transition-all ${serving ? "animate-spin border-t-emerald-400" : "animate-pulse bg-white/10"}`}
              >
                <MapPin
                  size={40}
                  className={serving ? "text-indigo-400" : "text-emerald-400"}
                />
              </div>
            </div>
            <p className="text-2xl font-black text-center mb-6 leading-tight">
              Service of <br /> Process (GPS)
            </p>
            <button
              onClick={handleServiceOfProcess}
              disabled={serving}
              className="w-full py-5 bg-emerald-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-emerald-400 disabled:bg-slate-700 transition-all shadow-xl"
            >
              {serving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Navigation size={18} />
              )}
              {serving ? "Verifying GPS..." : "Mark as Served"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(ClerkDashboard, ["ROLE_CLERK"]);
