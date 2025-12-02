import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";

import { prisma } from "@/utils/prisma-client";
import bcrypt from "bcrypt";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { roles: { include: { role: true } } },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        const roles: string[] = user.roles?.map((ur) => ur.role.name) ?? [];

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles,
        };
      },
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
      version: "2.0",
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const authUser = user as AuthUser;
        token.sub = authUser.id;
        token.roles = authUser.roles;
      }
      return token;
    },

    session: async ({ session, token }) => {
      session.user = {
        ...session.user,
        id: token.sub!,
        roles: Array.isArray(token.roles) ? token.roles : [],
      };
      return session;
    },
  },

  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,
};

// export default NextAuth(authOptions);

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
