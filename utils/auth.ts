import NextAuth, { NextAuthResult } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
import { prisma } from "@/utils/prisma-client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
}

export const { auth, handlers, signIn, signOut }: NextAuthResult = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "passwprd" },
      },
      async authorize(credentials, request): Promise<AuthUser | null> {
        const { email, password } = credentials;
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({
          where: { email: String(email) },
          include: { roles: { include: { role: true } } },
        });
        if (!user || !user.password) return null;
        const isValid = await bcrypt.compare(String(password), user.password);
        if (!isValid) return null;
        const roles = user.roles.map((ur) => ur.role.name) ?? [];
        return { id: user.id, email: user.email, name: user.name, roles };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_ID || "",
      clientSecret: process.env.TWITTER_SECRET || "",
      // version: "2.0",
    }),
  ],
  // adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user) {
        const { id, roles, email, name } = user;
        let user_roles: string[] = [];
        if ("roles" in user && Array.isArray(roles)) {
          user_roles = roles;
          token.sub = id;
        } else {
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { roles: { include: { role: true } } },
          });
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: email!,
                name,
                password: null,
                roles: {
                  create: [
                    {
                      role: { connect: { name: "USER" } },
                    },
                  ],
                },
              },
              include: { roles: { include: { role: true } } },
            });
            user_roles = dbUser.roles.map((ur) => ur.role.name);
            token.sub = dbUser.id;
          }
          token.roles = user_roles;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.sub!,
          roles: Array.isArray(token.roles) ? token.roles : [],
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
