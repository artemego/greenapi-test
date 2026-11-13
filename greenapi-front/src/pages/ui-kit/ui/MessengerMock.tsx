import { useLayoutEffect, useRef, useState } from 'react';
import { ChatHeader, ChatListItem, chatTitle } from '@/entities/chat';
import { Composer, MessageList, type ChatMessage } from '@/entities/message';
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  ScrollDownButton,
  PhoneField,
  SearchInput,
} from '@/shared/ui';
import { isPossiblePhone, phoneDigits } from '@/shared/lib';
import { mockChats, mockMessages, mockUnread } from '../model/mocks';
import styles from './MessengerMock.module.scss';

const SEND_DELAY_MS = 1200;
const NEAR_BOTTOM_PX = 120;

export function MessengerMock() {
  const [selectedId, setSelectedId] = useState('c1');
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState(mockMessages);
  const [draft, setDraft] = useState('');
  const [scrolledUp, setScrolledUp] = useState(false);
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string>();
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleNewChatOpenChange(open: boolean) {
    setNewChatOpen(open);
    if (!open) {
      setPhone('');
      setPhoneError(undefined);
    }
  }

  function handleStartChat() {
    if (!isPossiblePhone(phoneDigits(phone))) {
      setPhoneError('Invalid phone number');
      return;
    }
    handleNewChatOpenChange(false);
  }

  const selectedChat = mockChats.find((chat) => chat.id === selectedId) ?? mockChats[0];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleChats = mockChats.filter((chat) =>
    chatTitle(chat).toLowerCase().includes(normalizedQuery),
  );

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollTop = element.scrollHeight;
  }, [messages.length]);

  function handleScroll() {
    const element = scrollRef.current;
    if (!element) return;
    const distance = element.scrollHeight - element.scrollTop - element.clientHeight;
    setScrolledUp(distance > NEAR_BOTTOM_PX);
  }

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }

  function deliver(id: string, text: string) {
    setTimeout(() => {
      setMessages((current) =>
        current.map((message) =>
          message.id === id
            ? { ...message, status: text.toLowerCase().includes('fail') ? 'failed' : 'sent' }
            : message,
        ),
      );
    }, SEND_DELAY_MS);
  }

  function handleSend() {
    const text = draft.trim();
    const id = `local-${Date.now()}`;
    setMessages((current) => [
      ...current,
      {
        id,
        direction: 'outgoing',
        text,
        sentAt: new Date().toISOString(),
        status: 'sending',
        local: true,
      },
    ]);
    setDraft('');
    deliver(id, text.replace(/fail/gi, ''));
  }

  function handleRetry(failed: ChatMessage) {
    setMessages((current) =>
      current.map((message) =>
        message.id === failed.id ? { ...message, status: 'sending' } : message,
      ),
    );
    deliver(failed.id, '');
  }

  return (
    <div className={styles.messenger}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <SearchInput
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery('')}
          />
          <Menu trigger={<IconButton icon="more" label="More" />} align="end">
            <MenuItem icon="logout" danger onSelect={() => setLogoutOpen(true)}>
              Log out
            </MenuItem>
          </Menu>
        </div>
        <div className={styles.chatList}>
          {visibleChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              selected={chat.id === selectedId}
              unreadCount={chat.id === selectedId ? 0 : mockUnread[chat.id]}
              onSelect={(next) => setSelectedId(next.id)}
            />
          ))}
          {visibleChats.length === 0 && <p className={styles.noResults}>No chats found</p>}
        </div>
        <IconButton
          icon="plus"
          label="New chat"
          variant="primary"
          size="large"
          className={styles.fab}
          onClick={() => setNewChatOpen(true)}
        />
      </aside>

      <main className={styles.conversation}>
        <ChatHeader chat={selectedChat} onBack={() => undefined} />
        <div className={styles.messages} ref={scrollRef} onScroll={handleScroll}>
          <MessageList messages={messages} onFailedClick={handleRetry} />
        </div>
        <div className={styles.bottom}>
          <ScrollDownButton
            visible={scrolledUp}
            onClick={scrollToBottom}
            className={styles.scrollDown}
          />
          <Composer value={draft} onChange={setDraft} onSend={handleSend} />
        </div>
      </main>

      <Modal
        open={newChatOpen}
        onOpenChange={handleNewChatOpenChange}
        title="New chat"
        onSubmit={handleStartChat}
        footer={
          <>
            <Button variant="text" size="small" onClick={() => handleNewChatOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="text" size="small">
              Start chat
            </Button>
          </>
        }
      >
        <PhoneField
          value={phone}
          onChange={(next) => {
            setPhone(next);
            setPhoneError(undefined);
          }}
          error={phoneError}
          autoFocus
        />
      </Modal>

      <Modal
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Log out"
        description="Are you sure you want to log out?"
        footer={
          <>
            <Button variant="text" size="small" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="small" onClick={() => setLogoutOpen(false)}>
              Log out
            </Button>
          </>
        }
      />
    </div>
  );
}
