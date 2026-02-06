import { NextResponse } from "next/server";

/**
 * Get auth token from cookies
 * @param {Request} request - Next.js request object
 * @returns {string|null} - Auth token or null
 */
function getAuthToken(request) {
  // Method 1: Try to get from Next.js cookies API
  const cookieToken = request.cookies.get("auth_token")?.value;
  if (cookieToken) return cookieToken;

  // Method 2: Try to parse from Cookie header manually
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith("auth_token=")) {
        return cookie.substring("auth_token=".length);
      }
    }
  }

  // Method 3: Try to get from Authorization header (as backup)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}

/**
 * Check if route is an auth route (login, register, etc.)
 * @param {string} pathname - Request pathname
 * @returns {boolean}
 */
function isAuthRoute(pathname) {
  const authRoutes = [
    "/login",
    "/register",
    "/verify-email",
    "/verify-phone",
    "/forgot-password",
    "/reset-password",
  ];

  return authRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is protected (requires authentication)
 * @param {string} pathname - Request pathname
 * @returns {boolean}
 */
function isProtectedRoute(pathname) {
  return pathname.startsWith("/account");
}

/**
 * Middleware function
 * Handles authentication and route protection
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  const token = getAuthToken(request);
  const isAuthenticated = !!token;

  const isAuth = isAuthRoute(pathname);
  const isProtected = isProtectedRoute(pathname);

  // CASE 1: User is logged in and tries to access auth pages → Redirect to home
  if (isAuthenticated && isAuth) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // CASE 2: User is NOT logged in and tries to access protected pages → Redirect to login
  if (!isAuthenticated && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASE 3: All other cases → Allow access
  return NextResponse.next();
}

/**
 * Middleware config
 * Defines which routes should run through middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
