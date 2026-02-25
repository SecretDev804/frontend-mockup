import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/creatures",
  "/collection",
  "/mailbox",
  "/marketplace",
  "/inventory",
  "/breeding",
  "/great-beyond",
  "/vorest",
  "/profile",
  "/settings",
  "/help",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const idToken = request.cookies.get("goobiez_id_token")?.value;
  if (!idToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/creatures/:path*",
    "/collection/:path*",
    "/mailbox/:path*",
    "/marketplace/:path*",
    "/inventory/:path*",
    "/breeding/:path*",
    "/great-beyond/:path*",
    "/vorest/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/help/:path*",
  ],
};
