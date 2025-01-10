import { NextApiRequest } from 'next'
import { initIO } from '@/lib/socket'

export const config = {
  api: {
    bodyParser: false,
  },
}

const ioHandler = async (req: NextApiRequest, res: any) => {
  if (!res.socket.server.io) {
    res.socket.server.io = initIO(res.socket.server)
  }
  res.end()
}

export default ioHandler 