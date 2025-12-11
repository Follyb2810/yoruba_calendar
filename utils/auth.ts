import NextAuth, { NextAuthResult } from "next-auth";
// import Providers from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import TwitterProvider from "next-auth/providers/twitter";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { PrismaClient } from "@prisma/client";
import { prisma } from "@/utils/prisma-client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcrypt";
import { use } from "react";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  roles: string[];
}
// interface AuthUser {
//   id: string;
//   email: string;
//   name?: string | null;
//   roles: string[];
// }
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
  adapter: PrismaAdapter(prisma),
});
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GithubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import TwitterProvider from "next-auth/providers/twitter";
// import { prisma } from "@/utils/prisma-client";
// import bcrypt from "bcrypt";

// export const authOptions = {
//   providers: [
// CredentialsProvider({
//   name: "Credentials",
//   credentials: {
//     email: { label: "Email", type: "email" },
//     password: { label: "Password", type: "password" },
//   },
//   async authorize(credentials): Promise<AuthUser | null> {
//     if (!credentials?.email || !credentials?.password) return null;

//     const user = await prisma.user.findUnique({
//       where: { email: credentials.email },
//       include: { roles: { include: { role: true } } },
//     });

//     if (!user || !user.password) return null;

//     const isValid = await bcrypt.compare(
//       credentials.password,
//       user.password
//     );
//     if (!isValid) return null;

//     const roles = user.roles?.map((ur) => ur.role.name) ?? [];

//     return { id: user.id, email: user.email, name: user.name, roles };
//   },
// }),

// GithubProvider({
//   clientId: process.env.GITHUB_ID || "",
//   clientSecret: process.env.GITHUB_SECRET || "",
// }),
// GoogleProvider({
//   clientId: process.env.GOOGLE_ID || "",
//   clientSecret: process.env.GOOGLE_SECRET || "",
// }),
// TwitterProvider({
//   clientId: process.env.TWITTER_ID || "",
//   clientSecret: process.env.TWITTER_SECRET || "",
//   version: "2.0",
// }),
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

// // lib/auth.ts
// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "./prisma-client";
// import { access } from "better-auth/plugins/access";
// import { admin } from "better-auth/plugins/admin";

// // Define permissions for your app's resources (customize actions as needed)
// const statements = {
//   user: ["create", "read", "update", "delete"],
//   festival: ["create", "read", "update", "delete", "invite"],
//   orisa: ["create", "read", "update", "delete"],
// } as const;

// export const auth = betterAuth({
//   appName: "Ọ̀run Festival",
//   database: prismaAdapter(prisma, {
//     provider: "sqlite",
//   }),
//   emailAndPassword: {
//     enabled: true,
//     autoSignIn: true,
//   },
//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_ID!,
//       clientSecret: process.env.GOOGLE_SECRET!,
//     },
//     github: {
//       clientId: process.env.GITHUB_ID!,
//       clientSecret: process.env.GITHUB_SECRET!,
//     },
//   },
//   // Add roles to user (array for many-to-many)
//   user: {
//     additionalFields: {
//       roles: {
//         type: "string[]",
//         default: ["user"], // New users start with "user"
//       },
//     },
//   },
//   plugins: [
//     // Core access plugin (handles many-to-many via your UserRole table)
//     access({
//       statements,
//       // Maps your DB roles to permissions (extend as needed)
//       roles: {
//         superadmin: { user: ["*"], festival: ["*"], orisa: ["*"] },
//         admin: { user: ["read", "update", "delete"], festival: ["*"], orisa: ["read", "update"] },
//         moderator: { user: ["read"], festival: ["read", "update", "invite"], orisa: ["read"] },
//         user: { user: ["read", "update"], festival: ["create", "read"], orisa: ["read"] },
//         priest: { festival: ["create", "invite"], orisa: ["create", "update"] },
//       },
//       // Ties into your existing tables (Prisma detects User → UserRole → Role)
//       roleTable: {
//         name: "Role",
//         key: "id",
//         displayField: "name",
//       },
//       userRoleTable: {
//         name: "UserRole",
//         key: "id",
//         userKey: "userId",
//         roleKey: "roleId",
//       },
//     }),
//     // Admin plugin for UI (uses the above access control)
//     admin({
//       // Auto-seed roles on init
//       async onPluginInit() {
//         const needed = ["superadmin", "admin", "moderator", "user", "priest"];
//         const existing = await prisma.role.findMany({ select: { name: true } });

//         for (const name of needed) {
//           if (!existing.some((r) => r.name === name)) {
//             await prisma.role.create({ data: { name } });
//           }
//         }
//       },
//     }),
//   ],
// });

//! work but just one to one

// import { betterAuth, type BetterAuthOptions } from "better-auth";
// import { nextCookies } from "better-auth/next-js";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { createAuthMiddleware, APIError } from "better-auth/api";
// import { admin, customSession, magicLink } from "better-auth/plugins";

// import { prisma } from "@/lib/prisma";
// import { hashPassword, verifyPassword } from "@/lib/argon2";
// import { normalizeName, VALID_DOMAINS } from "@/lib/utils";
// import { ac, roles } from "@/lib/permissions";
// import { sendEmailAction } from "@/actions/send-email.action";

// const options = {
//   database: prismaAdapter(prisma, {
//     provider: "postgresql",
//   }),
//   emailVerification: {
//     sendOnSignUp: true,
//     expiresIn: 60 * 60,
//     autoSignInAfterVerification: true,
//     sendVerificationEmail: async ({ user, url }) => {
//       const link = new URL(url);
//       link.searchParams.set("callbackURL", "/auth/verify");

//       await sendEmailAction({
//         to: user.email,
//         subject: "Verify your email address",
//         meta: {
//           description:
//             "Please verify your email address to complete the registration process.",
//           link: String(link),
//         },
//       });
//     },
//   },
//   emailAndPassword: {
//     enabled: true,
//     minPasswordLength: 6,
//     autoSignIn: false,
//     password: {
//       hash: hashPassword,
//       verify: verifyPassword,
//     },
//     requireEmailVerification: true,
//     sendResetPassword: async ({ user, url }) => {
//       await sendEmailAction({
//         to: user.email,
//         subject: "Reset your password",
//         meta: {
//           description: "Please click the link below to reset your password.",
//           link: String(url),
//         },
//       });
//     },
//   },
//   hooks: {
//     before: createAuthMiddleware(async (ctx) => {
//       if (ctx.path === "/sign-up/email") {
//         const email = String(ctx.body.email);
//         const domain = email.split("@")[1].toLowerCase();

//         if (!VALID_DOMAINS().includes(domain)) {
//           throw new APIError("BAD_REQUEST", {
//             message: "Invalid domain. Please use a valid email.",
//           });
//         }

//         const name = normalizeName(ctx.body.name);

//         return {
//           context: { ...ctx, body: { ...ctx.body, name } },
//         };
//       }

//       if (ctx.path === "/sign-in/magic-link") {
//         const name = normalizeName(ctx.body.name);

//         return {
//           context: { ...ctx, body: { ...ctx.body, name } },
//         };
//       }

//       if (ctx.path === "/update-user") {
//         const name = normalizeName(ctx.body.name);

//         return {
//           context: { ...ctx, body: { ...ctx.body, name } },
//         };
//       }
//     }),
//   },
//   databaseHooks: {
//     user: {
//       create: {
//         before: async (user) => {
//           const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(";") ?? [];

//           if (ADMIN_EMAILS.includes(user.email)) {
//             return { data: { ...user, role: "ADMIN" } };
//           }

//           return { data: user };
//         },
//       },
//     },
//   },
//   user: {
//     additionalFields: {
//       role: {
//         type: ["USER", "ADMIN"],
//         input: false,
//       },
//     },
//   },
//   session: {
//     expiresIn: 30 * 24 * 60 * 60,
//     cookieCache: {
//       enabled: true,
//       maxAge: 5 * 60,
//     },
//   },
//   account: {
//     accountLinking: {
//       enabled: false,
//     },
//   },
//   advanced: {
//     database: {
//       generateId: false,
//     },
//   },
//   socialProviders: {
//     google: {
//       clientId: String(process.env.GOOGLE_CLIENT_ID),
//       clientSecret: String(process.env.GOOGLE_CLIENT_SECRET),
//     },
//     github: {
//       clientId: String(process.env.GITHUB_CLIENT_ID),
//       clientSecret: String(process.env.GITHUB_CLIENT_SECRET),
//     },
//   },
//   plugins: [
//     nextCookies(),
//     admin({
//       defaultRole: "USER",
//       adminRoles: ["ADMIN"],
//       ac,
//       roles,
//     }),
//     magicLink({
//       sendMagicLink: async ({ email, url }) => {
//         await sendEmailAction({
//           to: email,
//           subject: "Magic Link Login",
//           meta: {
//             description: "Please click the link below to log in.",
//             link: String(url),
//           },
//         });
//       },
//     }),
//   ],
// } satisfies BetterAuthOptions;

// export const auth = betterAuth({
//   ...options,
//   plugins: [
//     ...(options.plugins ?? []),
//     customSession(async ({ user, session }) => {
//       return {
//         session: {
//           expiresAt: session.expiresAt,
//           token: session.token,
//           userAgent: session.userAgent,
//         },
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           image: user.image,
//           createdAt: user.createdAt,
//           role: user.role,
//           giraffeFact: "giraffes can sometimes nap with one eye open",
//         },
//       };
//     }, options),
//   ],
// });

// export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOWN";

// // auth.ts or lib/auth.ts
// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "./prisma-client";
// import { role } from "better-auth/plugins";

// export const auth = betterAuth({
//   appName: "Ọ̀run Festival",
//   database: prismaAdapter(prisma, {
//     provider: "sqlite", // or "postgresql", etc.
//   }),
//   emailAndPassword: {
//     enabled: true,
//     autoSignIn: true,
//   },
//   socialProviders: {
//     google: {
//       clientId: process.env.GOOGLE_ID!,
//       clientSecret: process.env.GOOGLE_SECRET!,
//     },
//     github: {
//       clientId: process.env.GITHUB_ID!,
//       clientSecret: process.env.GITHUB_SECRET!,
//     },
//   },

//   plugins: [
//     role({
//       // This tells Better Auth to use your existing tables instead of creating new ones
//       useExistingTables: true,

//       // Optional: default roles on signup
//       defaultRoles: ["user"],

//       // You can even seed roles automatically
//       async onPluginInit() {
//         const existing = await prisma.role.findMany();
//         const needed = ["superadmin", "admin", "moderator", "user", "priest"];

//         for (const name of needed) {
//           if (!existing.find((r) => r.name === name)) {
//             await prisma.role.upsert({
//               where: { name },
//               update: {},
//               create: { name },
//             });
//           }
//         }
//       },
//     }),
//   ],
// });

// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "./prisma-client";

// export const auth = betterAuth({
//   appName: "better_auth_nextjs",
//   database: prismaAdapter(prisma, {
//     provider: "sqlite",
//   }),
//   emailAndPassword: {
//     enabled: true,
//     autoSignIn: true,
//     minPasswordLength: 8,
//     maxPasswordLength: 20,
//   },
//   socialProviders: {
//     github: {
//       clientId: process.env.GITHUB_ID!,
//       clientSecret: process.env.GITHUB_SECRET!,
//     },
//     google: {
//       clientId: process.env.GOOGLE_ID!,
//       clientSecret: process.env.GOOGLE_SECRET!,
//     },
//   },
//   session: {},
//   hooks: {},
//   user: {
//     additionalFields: {},

//   },
// });

// import { APIError, betterAuth } from "better-auth";
// import Database from "better-sqlite3";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { prisma } from "./prisma-client";

// export const auth = betterAuth({
//   appName: "better_auth_nextjs",
//   database: prismaAdapter(prisma, {
//     provider: "sqlite",
//   }),
//   emailAndPassword: {
//     enabled: true,
//     autoSignIn: true,
//     minPasswordLength: 8,
//     maxPasswordLength: 20,
//   },
//   socialProviders: {
//     github: {
//       clientId: process.env.GITHUB_ID!,
//       clientSecret: process.env.GITHUB_SECRET!,
//     },
//     google: {
//       clientId: process.env.GOOGLE_ID!,
//       clientSecret: process.env.GOOGLE_SECRET!,
//     },
//   },
//   session: {},
//   hooks: {},
//   user: {
//     deleteUser: {
//       enabled: true,
//       beforeDelete: async (user, request) => {
//         if (user.email.includes("admin")) {
//           throw new APIError("BAD_REQUEST", {
//             message: "Admin accounts can't be deleted",
//           });
//         }
//       },
//       afterDelete: async (user, request) => {
//         // Perform any cleanup or additional actions here
//       },
//       additionalFields: {
//         role: {
//           type: "string",
//           required: false,
//           defaultValue: "user",
//           input: false, // don't allow user to set role
//         },
//         lang: {
//           type: "string",
//           required: false,
//           defaultValue: "en",
//         },
//       },
//     },
//   },
// });

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
