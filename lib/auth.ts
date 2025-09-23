import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user) {
        token.role = "user"
        token.picture = user.image
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }: any) {
      session.user = {
        name: token.name,
        email: token.email,
        image: token.picture,
        role: token.role
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}
