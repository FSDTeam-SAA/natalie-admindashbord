
// authOptions.ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { AuthOptions } from "next-auth";

const parseAccessTokenExpiry = (accessToken?: string): number | undefined => {
  if (!accessToken) return undefined;

  const parts = accessToken.split(".");
  if (parts.length !== 3) return undefined;

  try {
    const payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(parts[1].length / 4) * 4, "=");
    const decoded = JSON.parse(
      Buffer.from(payload, "base64").toString("utf-8")
    ) as { exp?: number };

    if (typeof decoded.exp !== "number") return undefined;
    return decoded.exp * 1000;
  } catch {
    return undefined;
  }
};

const isAccessTokenExpired = (expiresAt?: number): boolean =>
  typeof expiresAt === "number" && Date.now() >= expiresAt;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phoneNumber?: string | null;
  profileImage?: string | null;
  status?: string;
  stripeAccountId?: string | null;
  billingSubscriptionId?: string | null;
  billingStatus?: string | null;
  cancelAtPeriodEnd?: boolean;
  lowCreditNotified?: boolean;
  adultEligible?: boolean;
  isSubscribed?: boolean;
  isFreeTrialUsed?: boolean;
  creditBalance?: number;
  createdAt?: string;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  accessRoutes?: string[];
}

export interface LoginResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken?: string;
    user: AuthUser;
  };
}

const splitName = (name?: string): { firstName?: string; lastName?: string } => {
  if (!name) return {};

  const normalizedName = name.trim().replace(/\s+/g, " ");
  if (!normalizedName) return {};

  const [firstName, ...rest] = normalizedName.split(" ");
  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(" ") : undefined,
  };
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

          if (!baseUrl) {
            throw new Error("Authentication service URL is not configured");
          }

          const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
          const loginUrl = normalizedBaseUrl.endsWith("/api/v1/auth/login")
            ? normalizedBaseUrl
            : normalizedBaseUrl.endsWith("/api/v1")
              ? `${normalizedBaseUrl}/auth/login`
              : `${normalizedBaseUrl}/api/v1/auth/login`;

          const email =
            typeof credentials?.email === "string"
              ? credentials.email.trim().toLowerCase()
              : "";
          const password =
            typeof credentials?.password === "string"
              ? credentials.password
              : "";

          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password,
            }),
          });

          const data: LoginResponse | null = await res.json().catch(() => null);
          const hasExplicitFailure = data?.success === false;
          const accessToken = data?.data?.accessToken;
          const refreshToken = data?.data?.refreshToken;
          const user = data?.data?.user;

          if (!res.ok || hasExplicitFailure || !accessToken || !user) {
            throw new Error(data?.message ?? "Invalid email or password");
          }

          const normalizedRole =
            typeof user.role === "string" ? user.role.toLowerCase() : "";

          if (normalizedRole !== "admin") {
            throw new Error(
              "Only admins can log in to the admin dashboard"
            );
          }

          const derivedNameParts = splitName(user.name);
          const firstName = user.firstName ?? derivedNameParts.firstName;
          const lastName = user.lastName ?? derivedNameParts.lastName;
          const fullName =
            user.name?.trim() ||
            [firstName, lastName].filter(Boolean).join(" ") ||
            user.email;

          return {
            id: user.id,
            userId: user.id,
            email: user.email,
            role: normalizedRole,
            firstName,
            lastName,
            name: fullName,
            updatedAt: user.updatedAt,
            accessRoutes: user.accessRoutes ?? [],
            accessToken,
            refreshToken,
            message: data?.message,
            success: data?.success,
            statusCode: data?.statusCode,
          };
        } catch (error) {
          if (error instanceof Error) {
            console.error("[auth][authorize] login failed:", error.message);
            throw error;
          }
          console.error("[auth][authorize] login failed with unknown error");
          throw new Error("Login failed. Please try again.");
        }
      },
    }),
  ],

  callbacks: {
    async signIn() {
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.userId = user.userId ?? (user as { id?: string }).id;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.name = user.name;
        token.updatedAt = user.updatedAt;
        token.accessRoutes = user.accessRoutes ?? [];
        token.message = user.message;
        token.success = user.success;
        token.statusCode = user.statusCode;
        token.accessTokenExpires = parseAccessTokenExpiry(user.accessToken);
        token.error = undefined;
      }

      if (isAccessTokenExpired(token.accessTokenExpires)) {
        token.error = "AccessTokenExpired";
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        userId: token.userId as string,
        email: token.email as string,
        role: token.role as string,
        firstName: token.firstName as string | undefined,
        lastName: token.lastName as string | undefined,
        name: token.name as string | undefined,
        accessRoutes: token.accessRoutes ?? [],
        updatedAt: token.updatedAt as string | undefined,
      };
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.accessTokenExpires =
        typeof token.accessTokenExpires === "number"
          ? token.accessTokenExpires
          : undefined;
      session.message = token.message;
      session.success = token.success;
      session.statusCode = token.statusCode;
      session.error = token.error;
      return session;
    },
  },

  pages: {
    signIn: "/sign-in",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
