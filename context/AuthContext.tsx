"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export default function AuthContext({
  //   session,
  children,
}: {
  //   session: Session | null;
  children: React.ReactNode;
}) {
  //   const session = await getSession();
  // const { data: session, status } = useSession()
  return (
    <SessionProvider
    //   session={session}
    >
      {children}
    </SessionProvider>
  );
}
