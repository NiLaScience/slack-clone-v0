import { v4 as uuidv4 } from 'uuid';
import { User, Channel, ChannelMembership, Message, Reaction, Attachment } from '../types/dataStructures';

function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const avatarEmojis = ['😀', '😎', '🤓', '🧐', '🤠'];

const exampleMessages = [
  "Hey, how's it going?",
  "Did you see the latest project update?",
  "I'm working on the new feature now.",
  "Can we schedule a meeting for tomorrow?",
  "Great job on the presentation!",
  "I need some help with this bug.",
  "What do you think about the new design?",
  "Don't forget about the team lunch next week.",
  "I've just pushed the changes to the repo.",
  "Has anyone tested the latest build yet?"
];

const sampleFiles = [
  {
    filename: 'presentation.pdf',
    fileUrl: 'https://example.com/files/presentation.pdf',
    contentType: 'application/pdf',
  },
  {
    filename: 'meeting-notes.pdf',
    fileUrl: 'https://example.com/files/meeting-notes.pdf',
    contentType: 'application/pdf',
  },
  {
    filename: 'team-photo.jpg',
    fileUrl: 'https://picsum.photos/800/600',  // Random image from Lorem Picsum
    contentType: 'image/jpeg',
  },
  {
    filename: 'screenshot.png',
    fileUrl: 'https://picsum.photos/1024/768',
    contentType: 'image/png',
  },
  {
    filename: 'requirements.docx',
    fileUrl: 'https://example.com/files/requirements.docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    filename: 'data.xlsx',
    fileUrl: 'https://example.com/files/data.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  }
];

export function generateSampleData() {
  const users: User[] = [
    { id: uuidv4(), name: 'Alice Johnson', avatar: avatarEmojis[0], createdAt: new Date('2023-01-01'), updatedAt: new Date('2023-01-01') },
    { id: uuidv4(), name: 'Bob Smith', avatar: avatarEmojis[1], createdAt: new Date('2023-01-02'), updatedAt: new Date('2023-01-02') },
    { id: uuidv4(), name: 'Charlie Brown', avatar: avatarEmojis[2], createdAt: new Date('2023-01-03'), updatedAt: new Date('2023-01-03') },
    { id: uuidv4(), name: 'Diana Prince', avatar: avatarEmojis[3], createdAt: new Date('2023-01-04'), updatedAt: new Date('2023-01-04') },
    { id: uuidv4(), name: 'Ethan Hunt', avatar: avatarEmojis[4], createdAt: new Date('2023-01-05'), updatedAt: new Date('2023-01-05') },
  ];

  users.forEach((u) => {
    u.isOnline = true
    u.status = "Online"
  })

  const channels: Channel[] = [
    { id: uuidv4(), name: 'General', isPrivate: false, createdAt: new Date('2023-01-01'), updatedAt: new Date('2023-01-01') },
    { id: uuidv4(), name: 'Random', isPrivate: false, createdAt: new Date('2023-01-02'), updatedAt: new Date('2023-01-02') },
    { id: uuidv4(), name: 'Team-Alpha', isPrivate: true, createdAt: new Date('2023-01-03'), updatedAt: new Date('2023-01-03') },
    { id: uuidv4(), name: 'Project-X', isPrivate: true, createdAt: new Date('2023-01-04'), updatedAt: new Date('2023-01-04') },
  ];

  const channelMemberships: ChannelMembership[] = [];
  const messages: Message[] = [];
  const reactions: Reaction[] = [];
  const files: Attachment[] = [];

  // Generate channel memberships
  channels.forEach(channel => {
    users.forEach(user => {
      if (Math.random() > 0.3) { // 70% chance of a user being in a channel
        channelMemberships.push({
          id: uuidv4(),
          channelId: channel.id,
          userId: user.id,
          createdAt: generateRandomDate(new Date('2023-01-01'), new Date()),
        });
      }
    });
  });

  // Generate messages
  channelMemberships.forEach(membership => {
    const messageCount = Math.floor(Math.random() * 10) + 1; // 1 to 10 messages per user per channel
    for (let i = 0; i < messageCount; i++) {
      const messageId = uuidv4();
      const createdAt = generateRandomDate(new Date('2023-01-01'), new Date());
      messages.push({
        id: messageId,
        channelId: membership.channelId,
        senderId: membership.userId,
        content: exampleMessages[i % exampleMessages.length],
        parentMessageId: null,
        createdAt: createdAt,
        updatedAt: createdAt,
        attachments: []
      });

      // Add reactions to some messages
      if (Math.random() > 0.7) { // 30% chance of a reaction
        reactions.push({
          id: uuidv4(),
          messageId: messageId,
          userId: users[Math.floor(Math.random() * users.length)].id,
          emoji: ['👍', '❤️', '😂', '🎉', '🤔'][Math.floor(Math.random() * 5)],
          createdAt: generateRandomDate(createdAt, new Date()),
        });
      }

      // Add files to some messages
      if (Math.random() > 0.9) { // 10% chance of a file
        const randomFile = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
        const attachment: Attachment = {
          id: uuidv4(),
          messageId: messageId,
          ...randomFile,
          createdAt: generateRandomDate(createdAt, new Date()),
        };
        messages[messages.length - 1].attachments.push(attachment);
      }

      // Add some threaded replies
      if (Math.random() > 0.8) { // 20% chance of a threaded reply
        const replyCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 replies
        for (let j = 0; j < replyCount; j++) {
          const replyId = uuidv4();
          const replyCreatedAt = generateRandomDate(createdAt, new Date());
          messages.push({
            id: replyId,
            channelId: membership.channelId,
            senderId: users[Math.floor(Math.random() * users.length)].id,
            content: exampleMessages[(i + j + 1) % exampleMessages.length],
            parentMessageId: messageId,
            createdAt: replyCreatedAt,
            updatedAt: replyCreatedAt,
            attachments: []
          });
        }
      }
    }
  });

  // Generate direct messages (represented as private channels between two users)
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const dmChannelId = uuidv4();
      const dmCreatedAt = generateRandomDate(new Date('2023-01-01'), new Date());
      
      channels.push({
        id: dmChannelId,
        name: `DM: ${users[i].name} and ${users[j].name}`,
        isPrivate: true,
        createdAt: dmCreatedAt,
        updatedAt: dmCreatedAt,
      });

      channelMemberships.push(
        {
          id: uuidv4(),
          channelId: dmChannelId,
          userId: users[i].id,
          createdAt: dmCreatedAt,
        },
        {
          id: uuidv4(),
          channelId: dmChannelId,
          userId: users[j].id,
          createdAt: dmCreatedAt,
        }
      );

      // Generate some DM messages
      const dmMessageCount = Math.floor(Math.random() * 5) + 1; // 1 to 5 messages per DM
      for (let k = 0; k < dmMessageCount; k++) {
        const sender = Math.random() > 0.5 ? users[i] : users[j];
        const messageId = uuidv4();
        const createdAt = generateRandomDate(dmCreatedAt, new Date());
        const message = {
          id: messageId,
          channelId: dmChannelId,
          senderId: sender.id,
          content: exampleMessages[k % exampleMessages.length],
          parentMessageId: null,
          createdAt: createdAt,
          updatedAt: createdAt,
          attachments: [],
        };
        
        // 20% chance of attachments in DMs
        if (Math.random() > 0.8) {
          const addMultipleAttachments = (message: Message) => {
            const attachmentCount = Math.floor(Math.random() * 3) + 1; // 1-3 attachments
            for (let i = 0; i < attachmentCount; i++) {
              const randomFile = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
              message.attachments.push({
                id: uuidv4(),
                messageId: message.id,
                ...randomFile,
                createdAt: generateRandomDate(message.createdAt, new Date()),
              });
            }
          };
          addMultipleAttachments(message);
        }
        
        messages.push(message);
      }
    }
  }

  return { users, channels, channelMemberships, messages, reactions, files };
}

