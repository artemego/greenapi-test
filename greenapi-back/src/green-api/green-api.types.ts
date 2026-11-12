export interface GreenApiCredentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export type InstanceState =
  | 'authorized'
  | 'notAuthorized'
  | 'blocked'
  | 'suspended'
  | 'starting'
  | 'pendingPassword'
  | (string & {});

export interface StateInstanceResponse {
  stateInstance: InstanceState;
}

type YesNo = 'yes' | 'no';

/** Subset of instance settings this app reads or writes; the API returns more. */
export interface GreenApiSettings {
  webhookUrl: string;
  incomingWebhook: YesNo;
  outgoingMessageWebhook: YesNo;
  outgoingAPIMessageWebhook: YesNo;
  outgoingWebhook: YesNo;
  stateWebhook: YesNo;
  [key: string]: unknown;
}

export type SetSettingsRequest = Partial<GreenApiSettings>;

export interface SetSettingsResponse {
  saveSettings: boolean;
}

export interface CheckAccountResponse {
  exist: boolean;
  chatId?: string;
  username?: string;
  phoneNumber?: number | string;
  fromCache?: boolean;
}

export interface SendMessageResponse {
  idMessage: string;
}

export interface DeleteNotificationResponse {
  result: boolean;
  reason?: string;
}

// ---- Notifications ----

interface InstanceData {
  idInstance: number;
  wid: string;
  typeInstance: string;
}

export interface SenderData {
  chatId: string;
  chatType?: string;
  chatName?: string;
  sender?: string;
  senderName?: string;
  senderPhoneNumber?: number | string;
}

/** `typeMessage` decides which `*Data` field is present; only text types are used. */
export interface MessageData {
  typeMessage: string;
  textMessageData?: { textMessage: string };
  extendedTextMessageData?: { text: string };
}

interface MessageNotificationBase {
  instanceData: InstanceData;
  timestamp: number;
  idMessage: string;
  senderData: SenderData;
  messageData: MessageData;
}

export interface IncomingMessageReceived extends MessageNotificationBase {
  typeWebhook: 'incomingMessageReceived';
}

export interface OutgoingMessageReceived extends MessageNotificationBase {
  typeWebhook: 'outgoingMessageReceived';
}

export interface StateInstanceChanged {
  typeWebhook: 'stateInstanceChanged';
  instanceData: InstanceData;
  timestamp: number;
  stateInstance: InstanceState;
}

/**
 * Status of a message this instance sent. Telegram reports `delivered`, `read`,
 * and the errors `failed`, `noAccount`, `suspended`; error bodies may lack `idMessage`.
 */
export interface OutgoingMessageStatus {
  typeWebhook: 'outgoingMessageStatus';
  instanceData: InstanceData;
  timestamp: number;
  chatId: string;
  idMessage?: string;
  status: string;
  description?: string;
}

/** Any `typeWebhook` this app does not handle; the original type is kept for logging. */
export interface UnknownNotification {
  typeWebhook: 'unknown';
  originalType: string;
}

export type NotificationBody =
  | IncomingMessageReceived
  | OutgoingMessageReceived
  | OutgoingMessageStatus
  | StateInstanceChanged
  | UnknownNotification;

export interface ReceivedNotification {
  receiptId: number;
  body: NotificationBody;
}
