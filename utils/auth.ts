import NextAuth, { NextAuthResult } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/utils/prisma-client";
import bcrypt from "bcrypt";

interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  name?: string | null;
}

export const { auth, handlers, signIn, signOut }: NextAuthResult = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    TwitterProvider({
      clientId: process.env.TWITTER_ID!,
      clientSecret: process.env.TWITTER_SECRET!,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        const { email, password } = credentials || {};
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: String(email) },
          include: { roles: { include: { role: true } } },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(String(password), user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          roles: user.roles.map((r) => r.role.name),
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.sub = user.id;
        token.roles = (user as AuthUser).roles;
        return token;
      }

      if (account && profile) {
        let dbUser = await prisma.user.findUnique({
          where: { email: token.email! },
          include: { roles: { include: { role: true } } },
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: token.email!,
              name: profile.name ?? null,
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
        }
        token.sub = dbUser.id;
        token.roles = dbUser.roles.map((r) => r.role.name);

        return token;
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
    signIn: "/auth/signin",
  },
});
