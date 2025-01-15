import { NextApiResponse } from 'next'

export default function handler(req: Request, res: NextApiResponse) {
  res.status(200).json({ message: 'Using Pusher instead of Socket.IO' })
} 