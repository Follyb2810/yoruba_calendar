import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/utils/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/signin") || pathname.startsWith("/signup")) {
    return NextResponse.next();
  }

  try {
    const session = await auth();

    if (pathname.startsWith("/admin")) {
      const roles = session?.user?.roles ?? [];
      if (!session || !roles.includes("ADMIN")) {
        const url = request.nextUrl.clone();
        url.pathname = "/signin";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }

    if (pathname.startsWith("/dashboard")) {
      if (!session) {
        const url = request.nextUrl.clone();
        url.pathname = "/signin";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Proxy auth error:", error);
    const url = request.nextUrl.clone();
    url.pathname = "/signin";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
