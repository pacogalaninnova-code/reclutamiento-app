import type { NextAuthConfig } from "next-auth";

export default {
  session: { strategy: "jwt" },
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.rol = user.rol;
        token.empresaId = user.empresaId;
        token.candidatoId = user.candidatoId;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.rol = token.rol as string;
        session.user.empresaId = token.empresaId as string | null;
        session.user.candidatoId = token.candidatoId as string | null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
