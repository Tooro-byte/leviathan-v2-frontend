import api from "@/lib/api";

/**
 * Authentication Service
 * Synchronized with withAuth.ts keys for seamless session management.
 */

const AUTH_TOKEN_KEY = "lextracker_access_token";
const AUTH_ROLES_KEY = "lextracker_user_roles";
const USER_PROFILE_KEY = "lextracker_user_profile";

export interface LawyerProfile {
  id: number;
  fullName: string;
  email: string;
  barNumber: string;
  role: "LAWYER" | "ADMIN";
}

export interface AuthResponse {
  token: string;
  lawyer: LawyerProfile;
}

/**
 * Authenticates a lawyer and initializes the local session.
 */
export const loginLawyer = async (credentials: {
  email: string;
  password: string;
}): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials,
    );

    if (response.data.token) {
      // 1. Store the JWT Token
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);

      // 2. Store Roles as an array (Required by your withAuth.ts logic)
      const roles = [response.data.lawyer.role];
      localStorage.setItem(AUTH_ROLES_KEY, JSON.stringify(roles));

      // 3. Store the full profile for UI display (Name, Bar Number, etc.)
      localStorage.setItem(
        USER_PROFILE_KEY,
        JSON.stringify(response.data.lawyer),
      );
    }

    return response.data;
  } catch (error: any) {
    console.error(
      "Vault Authentication Failure:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

/**
 * Wipes the session and redirects to the login gate.
 */
export const logoutLawyer = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_ROLES_KEY);
  localStorage.removeItem(USER_PROFILE_KEY);

  // Force a clean redirect to clear any sensitive state
  window.location.href = "/login";
};

/**
 * Utility to get the current lawyer's profile information.
 */
export const getCurrentLawyer = (): LawyerProfile | null => {
  const profile = localStorage.getItem(USER_PROFILE_KEY);
  return profile ? JSON.parse(profile) : null;
};
