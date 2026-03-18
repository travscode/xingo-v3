import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { protectedRoutePatterns } from "@/lib/auth";

const isProtectedRoute = createRouteMatcher([...protectedRoutePatterns]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|gif|svg|ico|ttf|woff2?)).*)", "/(api|trpc)(.*)"],
};
