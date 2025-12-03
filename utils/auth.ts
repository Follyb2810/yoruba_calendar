import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma-client";

export const auth = betterAuth({
  appName: "better_auth_nextjs",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 20,
  },
});
// export const auth = betterAuth({
//   database: new Database("./sqlite.db"),
//   emailAndPassword: {
//     enabled: true,
//   },
//   socialProviders: {
//     github: {
//       clientId: process.env.GITHUB_CLIENT_ID as string,
//       clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
//     },
//   },
// });

// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GithubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import TwitterProvider from "next-auth/providers/twitter";
// import { prisma } from "@/utils/prisma-client";
// import bcrypt from "bcrypt";

// interface AuthUser {
//   id: string;
//   email: string;
//   name?: string | null;
//   roles: string[];
// }

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials): Promise<AuthUser | null> {
//         if (!credentials?.email || !credentials?.password) return null;

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//           include: { roles: { include: { role: true } } },
//         });

//         if (!user || !user.password) return null;

//         const isValid = await bcrypt.compare(
//           credentials.password,
//           user.password
//         );
//         if (!isValid) return null;

//         const roles = user.roles?.map((ur) => ur.role.name) ?? [];

//         return { id: user.id, email: user.email, name: user.name, roles };
//       },
//     }),

//     GithubProvider({
//       clientId: process.env.GITHUB_ID || "",
//       clientSecret: process.env.GITHUB_SECRET || "",
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID || "",
//       clientSecret: process.env.GOOGLE_SECRET || "",
//     }),
//     TwitterProvider({
//       clientId: process.env.TWITTER_ID || "",
//       clientSecret: process.env.TWITTER_SECRET || "",
//       version: "2.0",
//     }),
//   ],

//   session: {
//     strategy: "jwt",
//   },

//   callbacks: {
//     jwt: async ({ token, user, account }) => {
//       if (user) {
//         let roles: string[] = [];

//         if ("roles" in user && Array.isArray(user.roles)) {
//           roles = user.roles;
//           token.sub = user.id;
//         } else if (user.email) {
//           let dbUser = await prisma.user.findUnique({
//             where: { email: user.email },
//             include: { roles: { include: { role: true } } },
//           });

//           if (!dbUser) {
//             dbUser = await prisma.user.create({
//               data: {
//                 email: user.email,
//                 name: user.name ?? null,
//                 password: null,
//                 roles: {
//                   create: [{ role: { connect: { name: "USER" } } }],
//                 },
//               },
//               include: { roles: { include: { role: true } } },
//             });
//           }

//           roles = dbUser.roles.map((ur) => ur.role.name);
//           token.sub = dbUser.id;
//         }

//         token.roles = roles;
//       }

//       return token;
//     },

//     session: async ({ session, token }) => {
//       if (session.user) {
//         session.user = {
//           ...session.user,
//           id: token.sub!,
//           roles: Array.isArray(token.roles) ? token.roles : [],
//         };
//       }
//       return session;
//     },
//   },

//   pages: {
//     signIn: "/auth/signin",
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// } satisfies import("next-auth").NextAuthOptions;

// const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// export { handlers, auth, signIn, signOut };
