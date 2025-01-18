import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
})

export const config = {
  matcher: [
    "/api/auth/:path*",
    "/auth/:path*",
  ]
}
