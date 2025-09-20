// NextAuth temporarily disabled due to bugs
// import type { NextAuthOptions } from "next-auth"
// import GoogleProvider from "next-auth/providers/google"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID || "mock-client-id",
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock-client-secret",
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         // Add role to token - default to 'user', can be changed later
//         token.role = user.role || "user"
//       }
//       return token
//     },
//     async session({ session, token }) {
//       // Add role to session
//       session.user.role = token.role as string
//       return session
//     },
//   },
//   pages: {
//     signIn: "/login",
//   },
//   session: {
//     strategy: "jwt",
//   },
// }

// Dummy auth for development
export interface DummyUser {
  id: string
  name: string
  email: string
  role: string
}

export const dummyLogin = (role: 'user' | 'interviewer' = 'user'): DummyUser => {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role
  }
}
