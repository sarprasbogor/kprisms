import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    role?: string;
    anggotaId?: string;
    anggotaNama?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      anggotaId?: string;
      anggotaNama?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    anggotaId?: string;
    anggotaNama?: string;
  }
}
