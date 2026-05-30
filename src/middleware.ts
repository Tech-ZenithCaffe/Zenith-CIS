import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/callback",
  "/auth/confirm",
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
];

const PUBLIC_API_ROUTES = [
  "/api/cron/",
  "/api/auth/",
];

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createMiddlewareClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicApi = PUBLIC_API_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  if (!session && !isPublicRoute && !isPublicApi) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/confirm).*)",
  ],
};
