import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChatListItem, ChatListItemSkeleton, chatTitle, type Chat } from '@/entities/chat';
import { useMe } from '@/shared/api';
import { phoneDigits } from '@/shared/lib';
import { Banner, Button, IconButton, Menu, MenuItem, Modal, SearchInput } from '@/shared/ui';
import { useChats } from '../api/useChats';
import { useLogout } from '../api/useLogout';
import type { ConnectionState } from '../model/useLiveEvents';
import { NewChatModal } from './NewChatModal';
import styles from './Sidebar.module.scss';

const SKELETON_ROWS = 8;

function matchesQuery(chat: Chat, query: string) {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  const digits = phoneDigits(text);
  return (
    chatTitle(chat).toLowerCase().includes(text) ||
    (digits.length > 0 && (chat.phoneNumber?.includes(digits) ?? false))
  );
}

type SidebarProps = {
  selectedId?: string;
  connection: ConnectionState;
  unread: Record<string, number>;
};

export function Sidebar({ selectedId, connection, unread }: SidebarProps) {
  const [query, setQuery] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const chats = useChats();
  const { data: me } = useMe();
  const logout = useLogout();
  const navigate = useNavigate();
  const instanceLost = Boolean(me && me.state !== 'authorized');

  function renderBanner() {
    if (instanceLost) {
      return (
        <Banner tone="warning" action={{ label: 'Log in again', onClick: () => logout.mutate() }}>
          Instance is not authorized in GREEN-API
        </Banner>
      );
    }
    if (connection === 'reconnecting') return <Banner loading>Reconnecting…</Banner>;
    return null;
  }

  function renderList() {
    if (chats.isPending) {
      return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <ChatListItemSkeleton key={index} />
      ));
    }

    if (chats.isError) {
      return (
        <div className={styles.state}>
          <p>Couldn't load chats</p>
          <Button variant="text" size="small" onClick={() => chats.refetch()}>
            Retry
          </Button>
        </div>
      );
    }

    if (chats.data.length === 0) {
      return (
        <div className={styles.state}>
          <p className={styles.stateTitle}>No chats yet</p>
          <p>Start a chat with any Telegram user by their phone number</p>
          <Button variant="text" size="small" onClick={() => setNewChatOpen(true)}>
            New chat
          </Button>
        </div>
      );
    }

    const visible = chats.data.filter((chat) => matchesQuery(chat, query));
    if (visible.length === 0) {
      return <p className={styles.state}>No chats found</p>;
    }

    return visible.map((chat) => (
      <ChatListItem
        key={chat.id}
        chat={chat}
        selected={chat.id === selectedId}
        unreadCount={chat.id === selectedId ? 0 : unread[chat.id]}
        onSelect={() => navigate(`/chats/${chat.id}`)}
      />
    ));
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
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

      {renderBanner()}

      <nav className={styles.list} aria-label="Chats">
        {renderList()}
      </nav>

      <IconButton
        icon="plus"
        label="New chat"
        variant="primary"
        size="large"
        className={styles.fab}
        onClick={() => setNewChatOpen(true)}
      />

      <NewChatModal open={newChatOpen} onOpenChange={setNewChatOpen} />

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
            <Button
              variant="danger"
              size="small"
              loading={logout.isPending}
              onClick={() => logout.mutate()}
            >
              Log out
            </Button>
          </>
        }
      />
    </aside>
  );
}
