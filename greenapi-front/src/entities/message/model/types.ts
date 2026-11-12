export type MessageDirection = 'incoming' | 'outgoing';

export type Message = {
  id: string;
  direction: MessageDirection;
  text: string;
  sentAt: string;
};

export type LocalStatus = 'sending' | 'failed';

export type ChatMessage = Message & { status?: LocalStatus };
