// NextAuth temporarily disabled
// import NextAuth from "next-auth"
// import { authOptions } from "@/lib/auth"

// const handler = NextAuth(authOptions)

// export { handler as GET, handler as POST }

// Dummy API response
export async function GET() {
  return Response.json({ message: 'Auth disabled' })
}

export async function POST() {
  return Response.json({ message: 'Auth disabled' })
}
