import type { Chat } from '@/entities/chat';
import type { ChatMessage, MessageDirection } from '@/entities/message';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

export const mockChats: Chat[] = [
  {
    id: 'c1',
    chatId: '100000001',
    name: 'Anna Petrova',
    phoneNumber: '79161234567',
    lastMessageAt: ago(2 * MINUTE),
    lastMessage: 'Perfect, see you tomorrow at the office!',
  },
  {
    id: 'c2',
    chatId: '100000002',
    name: 'Dmitry Sokolov',
    phoneNumber: '79037654321',
    lastMessageAt: ago(40 * MINUTE),
    lastMessage: 'Ok 👍',
  },
  {
    id: 'c3',
    chatId: '100000003',
    name: null,
    phoneNumber: '79991112233',
    lastMessageAt: ago(3 * HOUR),
    lastMessage: 'Hi! Is this still available?',
  },
  {
    id: 'c4',
    chatId: '100000004',
    name: 'Maria Ivanova',
    phoneNumber: '79265550101',
    lastMessageAt: ago(DAY + 2 * HOUR),
    lastMessage:
      'I have sent the documents to your email, please check them when you have a minute and let me know',
  },
  {
    id: 'c5',
    chatId: '100000005',
    name: 'John Smith',
    phoneNumber: '14155550123',
    lastMessageAt: ago(3 * DAY),
    lastMessage: 'Thanks a lot!',
  },
  {
    id: 'c6',
    chatId: '100000006',
    name: 'Olga',
    phoneNumber: '79850001122',
    lastMessageAt: ago(12 * DAY),
    lastMessage: 'Happy birthday! 🎉',
  },
  {
    id: 'c7',
    chatId: '100000007',
    name: 'Sergey Kuznetsov',
    phoneNumber: '79161112244',
    lastMessageAt: null,
    lastMessage: null,
  },
];

export const mockUnread: Record<string, number> = { c2: 2, c3: 1 };

const script: [number, MessageDirection, string][] = [
  [2 * DAY + 5 * HOUR, 'incoming', 'Hi! Are you coming to the meetup on Thursday?'],
  [2 * DAY + 5 * HOUR - 2 * MINUTE, 'outgoing', 'Hey! Yes, I already registered'],
  [2 * DAY + 5 * HOUR - 3 * MINUTE, 'outgoing', 'Do you know who is speaking?'],
  [2 * DAY + 4 * HOUR, 'incoming', 'Not yet, they will publish the schedule tomorrow'],
  [DAY + 3 * HOUR, 'incoming', 'The schedule is out'],
  [DAY + 3 * HOUR - MINUTE, 'incoming', 'Two talks about React and one about databases'],
  [DAY + 3 * HOUR - 2 * MINUTE, 'incoming', 'Looks good, right?'],
  [DAY + 2 * HOUR, 'outgoing', 'Nice, the database one sounds interesting'],
  [
    5 * HOUR,
    'incoming',
    'Good morning! Quick question about the project: did you manage to look at the design mockups I sent on Monday? The client wants feedback by Friday, and I would like to collect all the comments in one document before the call.',
  ],
  [5 * HOUR - 4 * MINUTE, 'outgoing', 'Morning! Yes, I went through them yesterday evening'],
  [
    5 * HOUR - 5 * MINUTE,
    'outgoing',
    'Main points:\n1. The header is too tall on mobile\n2. Colours of the buttons are inconsistent\n3. The checkout flow needs one step less',
  ],
  [5 * HOUR - 6 * MINUTE, 'outgoing', 'I will add the details to the doc'],
  [4 * HOUR, 'incoming', 'Great, thank you!'],
  [4 * HOUR - MINUTE, 'incoming', 'Can we have a call at 3?'],
  [3 * HOUR, 'outgoing', 'Sure'],
  [30 * MINUTE, 'incoming', 'Call went well, the client liked the changes 🎉'],
  [29 * MINUTE, 'incoming', 'They want the first version next week'],
  [20 * MINUTE, 'outgoing', 'That is great news'],
  [19 * MINUTE, 'outgoing', 'I can start tomorrow morning'],
  [
    18 * MINUTE,
    'outgoing',
    'Here is the link to the repo: https://example.com/a-very-long-repository-link-that-should-wrap-nicely-inside-the-bubble',
  ],
  [5 * MINUTE, 'incoming', 'Ok'],
  [4 * MINUTE, 'outgoing', 'Let us meet at the office at 10?'],
  [2 * MINUTE, 'incoming', 'Perfect, see you tomorrow at the office!'],
];

export const mockMessages: ChatMessage[] = script.map(([offset, direction, text], index) => ({
  id: `m${index}`,
  direction,
  text,
  sentAt: ago(offset),
  status: direction === 'incoming' ? null : offset > 10 * MINUTE ? 'read' : 'sent',
}));

export const mockShortConversation: ChatMessage[] = [
  { id: 's1', direction: 'incoming', text: 'Hello! 👋', sentAt: ago(10 * MINUTE), status: null },
  {
    id: 's2',
    direction: 'incoming',
    text: 'Grouped incoming messages share a side and only the last one has a tail',
    sentAt: ago(9 * MINUTE),
    status: null,
  },
  {
    id: 's3',
    direction: 'outgoing',
    text: 'Read: two checks once the recipient opens it',
    sentAt: ago(8 * MINUTE),
    status: 'read',
  },
  {
    id: 's3b',
    direction: 'outgoing',
    text: 'Sent or delivered: one check',
    sentAt: ago(8 * MINUTE),
    status: 'sent',
  },
  {
    id: 's4',
    direction: 'outgoing',
    text: 'Sending: the clock icon shows until the server confirms',
    sentAt: ago(7 * MINUTE),
    status: 'sending',
    local: true,
  },
  {
    id: 's5',
    direction: 'outgoing',
    text: 'Failed: click the red icon to retry',
    sentAt: ago(6 * MINUTE),
    status: 'failed',
    local: true,
  },
];
