import NextAuth, { NextAuthResult } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/utils/prisma-client";
import bcrypt from "bcrypt";

interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  name?: string | null;
}

const googleClientId =
  process.env.GOOGLE_CLIENT_ID ??
  process.env.GOOGLE_ID ??
  process.env.AUTH_GOOGLE_ID ??
  "";

const googleClientSecret =
  process.env.GOOGLE_CLIENT_SECRET ??
  process.env.GOOGLE_SECRET ??
  process.env.AUTH_GOOGLE_SECRET ??
  "";

async function loadUserRoles(userId: string): Promise<string[]> {
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });
  return dbUser?.roles.map((r) => r.role.name) ?? ["USER"];
}

export const { auth, handlers, signIn, signOut }: NextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,

  session: {
    strategy: "jwt",
  },

  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          include: { roles: { include: { role: true } } },
        });

        if (!user) return null;

        if (!user.password) {
          // OAuth-only account — credentials login not available
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles.map((r) => r.role.name),
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "google") {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          include: { roles: true },
        });

        if (existing) {
          // Link Google sign-in to existing email/password account
          user.id = existing.id;

          if (existing.roles.length === 0) {
            const userRole = await prisma.role.findUnique({
              where: { name: "USER" },
            });
            if (userRole) {
              await prisma.userRole.create({
                data: {
                  userId: existing.id,
                  roleId: userRole.id,
                },
              });
            }
          }
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
        token.roles = (user as AuthUser).roles ?? (await loadUserRoles(user.id));
        return token;
      }

      if (token.sub) {
        token.roles = await loadUserRoles(token.sub);
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.roles = Array.isArray(token.roles) ? token.roles : [];
      }
      return session;
    },
  },

  pages: {
    signIn: "/signin",
  },
});
