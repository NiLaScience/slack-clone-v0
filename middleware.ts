import { clerkMiddleware } from "@clerk/nextjs/server"

// In development, this allows multiple sessions in different tabs
export default clerkMiddleware()

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
} 