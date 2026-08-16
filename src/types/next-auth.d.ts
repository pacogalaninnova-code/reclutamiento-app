import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    rol?: string;
    empresaId?: string | null;
    candidatoId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      rol: string;
      empresaId: string | null;
      candidatoId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    rol?: string;
    empresaId?: string | null;
    candidatoId?: string | null;
  }
}
