"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

/**
 * SHARED KEYS: Must match api.ts exactly to ensure 
 * the "Security Gate" and "API Bridge" stay in sync.
 */
const AUTH_TOKEN_KEY = "lextracker_access_token";
const AUTH_ROLES_KEY = "roles"; // Changed to match your api.ts purge logic

export default function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  allowedRoles: string[]
) {
  return function ProtectedRoute(props: T) {
    const router = useRouter();
    const pathname = usePathname();
    const [status, setStatus] = useState<"loading" | "authorized" | "denied">(
      "loading"
    );

    useEffect(() => {
      const checkAuth = () => {
        // Ensure we are in the browser
        if (typeof window === "undefined") return;

        try {
          const token = localStorage.getItem(AUTH_TOKEN_KEY);
          const rawRoles = localStorage.getItem(AUTH_ROLES_KEY);

          // 1. Check if token exists
          if (!token) {
            throw new Error("No vault key found.");
          }

          // 2. Check if roles exist and are valid JSON
          if (!rawRoles) {
            throw new Error("Persona clearance levels missing.");
          }

          const userRoles: string[] = JSON.parse(rawRoles);

          // 3. Verify if the user's role is allowed for this specific page
          const hasAccess = allowedRoles.some((role) =>
            userRoles.includes(role)
          );

          if (!hasAccess) {
            console.error(`🚫 Access Denied for ${pathname}: Insufficient Clearance.`);
            router.push("/login?error=unauthorized");
            setStatus("denied");
          } else {
            setStatus("authorized");
          }
        } catch (error) {
          console.error("🔒 Security Gate: Verification failed.", error);
          
          // Cleanup consistent with api.ts
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_ROLES_KEY);
          localStorage.removeItem("userName");
          
          router.push("/login?error=session_expired");
          setStatus("denied");
        }
      };

      checkAuth();
    }, [router, pathname]);

    // 1. LOADING STATE: High-tech vault synchronization UI
    if (status === "loading") {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505]">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="mb-6 inline-block"
            >
              <Loader2 className="h-12 w-12 text-blue-600" />
            </motion.div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 animate-pulse">
              Synchronizing Ledger Credentials
            </p>
          </div>
        </div>
      );
    }

    // 2. DENIED STATE: Prevents flashing protected content
    if (status === "denied") {
      return null;
    }

    // 3. AUTHORIZED STATE: Render the requested page
    return <Component {...props} />;
  };
}