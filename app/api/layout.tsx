import { initBotUser } from '@/lib/bot';

// Initialize bot user when server starts
initBotUser().catch(console.error);

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
} 