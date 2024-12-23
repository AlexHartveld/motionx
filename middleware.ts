import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up", "/api/public"],
  ignoredRoutes: ["/api/public"]
});

// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};