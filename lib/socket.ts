import Pusher from 'pusher'
import { Message, Channel, Reaction, UserDocument } from '@/types/dataStructures'

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true
});

type UpdateType = 
  | { type: 'message-created'; data: Message; channelId: string }
  | { type: 'message-updated'; data: Message; channelId: string }
  | { type: 'message-deleted'; data: { id: string }; channelId: string }
  | { type: 'reaction-toggled'; data: { 
      messageId: string; 
      action: 'added' | 'removed';
      reaction?: Reaction;
      reactionId?: string;
    }; channelId: string }
  | { type: 'user-status-changed'; data: { userId: string; isOnline: boolean } }
  | { type: 'channel-created'; data: Channel }
  | { type: 'channel-deleted'; data: { id: string; name: string } }
  | { type: 'user-updated'; data: { 
      userId: string; 
      avatar?: string;
      name?: string;
      status?: string;
    } }
  | { type: 'document-created'; data: UserDocument; userId: string }
  | { type: 'document-deleted'; data: { id: string }; userId: string };

export async function emitDataUpdate(update: UpdateType) {
  try {
    const eventName = update.type;
    
    if ('channelId' in update) {
      // Channel-specific update
      await pusher.trigger(`channel-${update.channelId}`, eventName, update.data)
    } else if ('userId' in update) {
      // User-specific update
      await pusher.trigger(`user-${update.userId}`, eventName, update.data)
    } else {
      // Global update
      await pusher.trigger('global', eventName, update.data)
    }
  } catch (error) {
    console.error('Error emitting data update:', error)
  }
} 