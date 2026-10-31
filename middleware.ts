import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) =>
      Boolean(
        token?.accessToken &&
          token?.role === "admin" &&
          token?.error !== "AccessTokenExpired"
      ),
  },
  pages: {
    signIn: "/sign-in",
  },
});

export const config = {
  matcher: [
    "/",
    "/users/:path*",
    "/companions/:path*",
    "/subscriptions/:path*",
    "/credits/:path*",
    "/settings/:path*",
  ],
};
