import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(req: Request) {
  const { name } = await req.json()
  
  const updatedUser = await prisma.user.update({
    where: { id: "user_1" }, // TODO: Replace with actual auth
    data: {
      name,
      updatedAt: new Date(),
    },
  })
  
  return NextResponse.json(updatedUser)
} 