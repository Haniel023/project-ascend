import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";

// Next.js 16 renamed middleware -> proxy; it now runs on the Node.js runtime only.
// Per Next's own auth guidance this must stay an *optimistic* UX redirect -- the
// real access check lives in verifySession() (src/server/auth/dal.ts), called from
// every Server Action/Component that touches user data.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/profile",
  "/plans",
  "/log",
  "/quests",
  "/onboarding",
  "/settings",
  "/progress",
  "/bosses",
  "/dungeon",
  "/ranks",
  "/equipment",
];
const AUTH_PAGES = ["/login", "/signup"];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const isProtected = PROTECTED_PREFIXES.some((p) => matchesPrefix(pathname, p));
  const isAuthPage = AUTH_PAGES.some((p) => matchesPrefix(pathname, p));

  if (isProtected && !isLoggedIn) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/plans/:path*",
    "/log/:path*",
    "/quests/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
    "/progress/:path*",
    "/bosses/:path*",
    "/dungeon/:path*",
    "/ranks/:path*",
    "/equipment/:path*",
    "/login",
    "/signup",
  ],
};
