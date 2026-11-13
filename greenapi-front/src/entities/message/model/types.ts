export type MessageDirection = 'incoming' | 'outgoing';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type Message = {
  id: string;
  direction: MessageDirection;
  text: string;
  sentAt: string;
  status: MessageStatus | null;
};

export type ChatMessage = Message & { local?: boolean };
