import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "./utils/auth";

//! client: const { data: session, status } = useSession()
//! server:  const session = await getSession()
//! api route  const session = await getServerSession(context.req, context.res, authOptions)
export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;
  const session = await auth();
  if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
    return NextResponse.next();
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error("NEXTAUTH_SECRET is missing");
    return NextResponse.next();
  }

  try {
    const token = await getToken({
      req: request,
      secret,
      secureCookie: process.env.NODE_ENV === "production",
    });
    console.log({ token });
    if (pathname.startsWith("/admin")) {
      if (
        !token ||
        !Array.isArray(token.roles) ||
        !token.roles.includes("ADMIN")
      ) {
        url.pathname = "/signin";
        // url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }

    if (pathname.startsWith("/dashboard")) {
      // if (!token) {
      if (!session) {
        url.pathname = "/signin";
        // url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };
// import { NextRequest, NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function proxy(request: NextRequest) {
//   const url = request.nextUrl.clone();
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });
//   if (url.pathname.startsWith("/admin")) {
//     if (
//       !token ||
//       !Array.isArray(token.roles) ||
//       !token.roles.includes("ADMIN")
//     ) {
//       url.pathname = "/signin";
//       return NextResponse.redirect(url);
//     }
//   }
//   if (url.pathname.startsWith("/dashboard")) {
//     if (!token) {
//       url.pathname = "/signin";
//       return NextResponse.redirect(url);
//     }
//   }

//   return NextResponse.next();
// }

// export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };
// const session = await auth.api.getSession({ headers: request.headers });
// const { pathname } = request.nextUrl;

// const isProtected = ["/user_info", "/dashboard"].some((route) =>
//   pathname.startsWith(route)
// );

// if (isProtected && !session) {
//   const signInUrl = new URL("/auth/signin", request.url);
//   signInUrl.searchParams.set("callbackUrl", pathname);
//   return NextResponse.redirect(signInUrl);
// }
// return NextResponse.next();

// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "@/utils/auth";

// export const ProtectedRoutes = ["/user_info", "/dashboard", "/profile"];

// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|auth|login|signin).*)",
//   ],
// };

// export default async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Check if the path is protected
//   const isProtected = ProtectedRoutes.some((route) =>
//     pathname.startsWith(route)
//   );

//   if (isProtected) {
//     try {
//       const session = await auth();

//       if (!session) {
//         // Redirect to signin page if not authenticated
//         const signInUrl = new URL("/auth/signin", request.url);
//         signInUrl.searchParams.set("callbackUrl", pathname);
//         return NextResponse.redirect(signInUrl);
//       }

//       // Optional: Check user roles for specific routes
//       const userRoles = session.user?.roles || [];

//       // Example: Check for admin role on admin routes
//       if (pathname.startsWith("/admin") && !userRoles.includes("ADMIN")) {
//         return NextResponse.redirect(new URL("/unauthorized", request.url));
//       }
//     } catch (error) {
//       console.error("Middleware auth error:", error);
//       return NextResponse.redirect(new URL("/auth/signin", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// import { NextRequest, NextResponse } from "next/server";
// import { auth } from "./utils/auth";
// // import auth from "./utils/auth";
// // import auth from "./utils/auth";
// // import { auth } from "./auth";

// export const ProtectedRoutes = ["/user_info"];

// // Read more: https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// export default async function middleware(request: NextRequest) {
//   const session = await auth();
//   const { pathname } = request.nextUrl;
//   const isProtected = ProtectedRoutes.some((route) =>
//     route.startsWith(pathname)
//   );
//   if (isProtected && !session) {
//     // return NextResponse.redirect('/')
//     // return NextResponse.redirect(new URL("/api/auth/signin", request.url));
//     return NextResponse.next();
//   }
//   return NextResponse.next();
// }

// import { NextRequest, NextResponse } from "next/server";
// import { authMiddleware } from "@/lib/middlewares/authMiddleware";
// import { verifiedMiddleware } from "@/lib/middlewares/verifiedMiddleware";
// import { roleMiddleware } from "@/lib/middlewares/roleMiddleware";

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// export default async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Route groups
//   const protectedRoutes = ["/user_info", "/dashboard"];
//   const verifiedRoutes = ["/checkout"];
//   const adminRoutes = ["/admin", "/manage"];
//   const publicRoutes = ["/", "/login", "/about"];

//   // Skip public routes
//   if (publicRoutes.some((r) => pathname.startsWith(r))) {
//     return NextResponse.next();
//   }

//   // 🔒 1. Authentication check for protected routes
//   if (protectedRoutes.some((r) => pathname.startsWith(r))) {
//     const authResult = await authMiddleware(request);
//     if (!authResult || "redirect" in authResult) return authResult;
//   }

//   // ✅ 2. Verified user check
//   if (verifiedRoutes.some((r) => pathname.startsWith(r))) {
//     const verifiedResult = verifiedMiddleware(request);
//     if (verifiedResult) return verifiedResult;
//   }

//   // 🛠️ 3. Admin-only routes
//   if (adminRoutes.some((r) => pathname.startsWith(r))) {
//     const { session } = (await authMiddleware(request)) ?? {};
//     if (!session) return NextResponse.redirect(new URL("/login", request.url));

//     const adminResult = roleMiddleware(request, session, "ADMIN");
//     if (adminResult) return adminResult;
//   }

//   return NextResponse.next();
// }
