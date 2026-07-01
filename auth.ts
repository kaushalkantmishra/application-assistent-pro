import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "@/db"
import { users, accounts, sessions, verificationTokens } from "@/db/schema"

// @ts-ignore
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = (user as any).role || "user"
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: any) {
      if (session?.user) {
        (session.user as any).role = token.role || "user"
        ;(session.user as any).id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
