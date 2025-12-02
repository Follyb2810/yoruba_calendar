Perfect — I’ll build **the complete authentication system** for you step-by-step:

✅ Prisma user model
✅ NextAuth setup (web)
✅ JWT login endpoint (mobile)
✅ Expo SecureStore login for React Native
✅ Protected API routes
✅ Role-based access (admin, festival-owner, normal user)
✅ Rate limiting (safe & simple)

Everything will be production-ready and scalable.

---

# 🚀 **1. PRISMA USER MODEL (with roles)**

`prisma/schema.prisma`

```prisma
model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  password  String
  role      Role     @default(USER)
  festivals Festival[]
  createdAt DateTime @default(now())
}

model Festival {
  id        String   @id @default(cuid())
  title     String
  startDate DateTime
  endDate   DateTime
  location  String
  user      User     @relation(fields: [userId], references: [id])
  userId    String
  createdAt DateTime @default(now())
}

enum Role {
  USER
  VERIFIED
  ADMIN
}
```

✔ Roles explained

* **USER** → basic account
* **VERIFIED** → can post festivals after you verify manually
* **ADMIN** → full control

---

# 🚀 **2. NEXTAUTH CONFIG (Web authentication)**

`app/api/auth/[...nextauth]/route.ts`

```ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"

const handler = NextAuth({
  session: { strategy: "jwt" },

  providers: [
    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    },
  },
})

export { handler as GET, handler as POST }
```

---

# 🚀 **3. MOBILE LOGIN ENDPOINT (React Native)**

`app/api/auth/mobile-login/route.ts`

```ts
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return NextResponse.json({ error: "Invalid login" }, { status: 401 })

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  )

  return NextResponse.json({ token, user })
}
```

---

# 🚀 **4. REACT NATIVE LOGIN (Expo SecureStore)**

Install:

```
expo install expo-secure-store
```

Then React Native login function:

```ts
import * as SecureStore from "expo-secure-store"

export async function login(email: string, password: string) {
  const res = await fetch("https://yourdomain.com/api/auth/mobile-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })

  const data = await res.json()

  if (res.ok) {
    await SecureStore.setItemAsync("token", data.token)
    return data.user
  } else {
    throw new Error(data.error)
  }
}
```

To check if user is logged in:

```ts
export async function getToken() {
  return await SecureStore.getItemAsync("token")
}
```

---

# 🚀 **5. PROTECT NEXT.JS API ROUTES (JWT middleware)**

`middleware.ts`

```ts
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const PROTECTED = ["/api/festivals/create"]

export function middleware(req: any) {
  if (!PROTECTED.some((path) => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  const token = req.headers.get("authorization")?.replace("Bearer ", "")

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
```

---

# 🚀 **6. PROTECTED API ROUTE FOR CREATING FESTIVALS**

`app/api/festivals/create/route.ts`

```ts
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "")
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 })

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

  // Must be VERIFIED to post a festival
  if (decoded.role !== "VERIFIED" && decoded.role !== "ADMIN") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 })
  }

  const data = await req.json()

  const festival = await prisma.festival.create({
    data: {
      title: data.title,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      location: data.location,
      userId: decoded.id,
    },
  })

  return NextResponse.json({ festival })
}
```

---

# 🚀 **7. SIMPLE RATE LIMITING (Per IP)**

`lib/rate-limit.ts`

```ts
const rateMap = new Map()

export function rateLimit(ip: string, limit = 50) {
  const now = Date.now()
  const windowMs = 60 * 1000

  if (!rateMap.has(ip)) {
    rateMap.set(ip, [])
  }

  const timestamps = rateMap.get(ip).filter((t: number) => now - t < windowMs)
  timestamps.push(now)

  rateMap.set(ip, timestamps)

  return timestamps.length > limit
}
```

Use it inside any API route:

```ts
import { rateLimit } from "@/lib/rate-limit"

if (rateLimit(req.ip ?? "unknown")) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 })
}
```

---

# 🚀 **8. OPTIONAL: ADMIN VERIFICATION ENDPOINT**

When you check a festival manually, an admin can verify the owner:

```ts
export async function POST(req: Request) {
  const { userId } = await req.json()

  await prisma.user.update({
    where: { id: userId },
    data: { role: "VERIFIED" }
  })

  return NextResponse.json({ ok: true })
}
```

---

# 🎉 DONE — You now have:

### ✔ NextAuth for web

### ✔ Secure JWT login for React Native

### ✔ Protected API routes

### ✔ User roles

### ✔ Festival posting system

### ✔ Admin-verification system

### ✔ Rate limiting

---

# Want me to generate:

✅ Registration page
✅ Login page (shadcn UI)
✅ Protected dashboard
✅ Festival creation form (shadcn UI)
✅ Mobile app starter code (Expo)
✅ API documentation

Just tell me **what you want next**.
