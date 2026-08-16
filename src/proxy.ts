import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PORTAL_POR_ROL: Record<string, string> = {
  ADMIN: "/reclutador",
  RECLUTADOR: "/reclutador",
  EMPRESA: "/empresa",
  CANDIDATO: "/candidato",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const protegida = ["/reclutador", "/empresa", "/candidato"].find((p) =>
    pathname.startsWith(p)
  );

  if (protegida) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const home = PORTAL_POR_ROL[session.user.rol];
    if (home && !pathname.startsWith(home)) {
      return NextResponse.redirect(new URL(home, req.nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/reclutador/:path*", "/empresa/:path*", "/candidato/:path*"],
};
