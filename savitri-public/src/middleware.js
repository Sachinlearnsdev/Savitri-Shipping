import { NextResponse } from "next/server";

/**
 * Get auth token from cookies
 * @param {Request} request - Next.js request object
 * @returns {string|null} - Auth token or null
 */
function getAuthToken(request) {
  // Method 1: Try to get from Next.js cookies API
  const cookieToken = request.cookies.get("auth_token")?.value;

  if (cookieToken) {
    console.log("✅ Middleware: Found auth_token in cookies");
    return cookieToken;
  }

  // Method 2: Try to parse from Cookie header manually
  const cookieHeader = request.headers.get("cookie");

  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());

    for (const cookie of cookies) {
      if (cookie.startsWith("auth_token=")) {
        const token = cookie.substring("auth_token=".length);
        console.log("✅ Middleware: Found auth_token in Cookie header");
        return token;
      }
    }
  }

  // Method 3: Try to get from Authorization header (as backup)
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    console.log("✅ Middleware: Found token in Authorization header");
    return token;
  }

  console.log("❌ Middleware: No auth token found");
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

  console.log("🔒 Middleware: Checking route:", pathname);

  // Get authentication token
  const token = getAuthToken(request);
  const isAuthenticated = !!token;

  console.log("🔐 Middleware: Is authenticated?", isAuthenticated);

  // Check route types
  const isAuth = isAuthRoute(pathname);
  const isProtected = isProtectedRoute(pathname);

  // CASE 1: User is logged in and tries to access auth pages (login, register, etc.)
  // → Redirect to dashboard
  if (isAuthenticated && isAuth) {
    console.log(
      "✅ Middleware: Authenticated user accessing auth page → Redirect to dashboard"
    );
    return NextResponse.redirect(new URL("/account/dashboard", request.url));
  }

  // CASE 2: User is NOT logged in and tries to access protected pages
  // → Redirect to login with return URL
  if (!isAuthenticated && isProtected) {
    console.log(
      "❌ Middleware: Unauthenticated user accessing protected page → Redirect to login"
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CASE 3: All other cases → Allow access
  console.log("✅ Middleware: Allowing access to:", pathname);
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
