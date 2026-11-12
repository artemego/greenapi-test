import { useState } from 'react';
import { Link } from 'react-router';
import { ChatListItem, ChatListItemSkeleton } from '@/entities/chat';
import { Composer, MessageList } from '@/entities/message';
import {
  Avatar,
  Banner,
  Button,
  Icon,
  icons,
  type IconName,
  IconButton,
  Menu,
  MenuItem,
  Modal,
  PhoneField,
  ScrollDownButton,
  SearchInput,
  Spinner,
  TextField,
} from '@/shared/ui';
import { mockChats, mockShortConversation } from '../model/mocks';
import { MessengerMock } from './MessengerMock';
import { Section } from './Section';
import styles from './UiKitPage.module.scss';

const iconNames = Object.keys(icons) as IconName[];

const avatarNames = [
  'Anna Petrova',
  'Maria',
  'Dmitry Sokolov',
  'John Smith',
  'Olga',
  'Elena K',
  'Sergey',
];

export function UiKitPage() {
  const [idInstance, setIdInstance] = useState('1101000001');
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [search, setSearch] = useState('Anna');
  const [phone, setPhone] = useState('+1 415 555 0123');
  const [draft, setDraft] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <header className={styles.header}>
          <h1>UI kit</h1>
          <nav className={styles.nav}>
            <Link to="/login">Login screen</Link>
            <Link to="/">App</Link>
          </nav>
        </header>

        <Section title="Buttons">
          <div className={styles.row}>
            <Button>Next</Button>
            <Button loading>Next</Button>
            <Button disabled>Next</Button>
            <Button variant="text">Cancel</Button>
            <Button variant="danger">Log out</Button>
          </div>
          <div className={styles.row}>
            <Button size="small" variant="text">
              Cancel
            </Button>
            <Button size="small" variant="danger">
              Log out
            </Button>
            <Button size="small">Retry</Button>
          </div>
        </Section>

        <Section title="Icon buttons">
          <div className={styles.row}>
            <IconButton icon="more" label="More" />
            <IconButton icon="arrowLeft" label="Back" />
            <IconButton icon="close" label="Close" />
            <IconButton icon="eye" label="Show" size="small" />
            <IconButton icon="plus" label="New chat" variant="primary" size="large" />
            <IconButton icon="send" label="Send" variant="raised" size="large" />
            <IconButton icon="send" label="Send" variant="raised" size="large" disabled />
          </div>
        </Section>

        <Section title="Text fields">
          <div className={styles.grid}>
            <TextField label="idInstance" />
            <TextField
              label="idInstance"
              value={idInstance}
              onChange={(event) => setIdInstance(event.target.value)}
            />
            <TextField
              label="apiTokenInstance"
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(event) => setToken(event.target.value)}
              endAdornment={
                <IconButton
                  icon={showToken ? 'eyeOff' : 'eye'}
                  label={showToken ? 'Hide' : 'Show'}
                  onClick={() => setShowToken((value) => !value)}
                />
              }
            />
            <TextField
              label="idInstance"
              defaultValue="abc"
              error="Wrong idInstance or apiTokenInstance"
            />
            <TextField label="Disabled" defaultValue="1101000001" disabled />
            <PhoneField value={phone} onChange={setPhone} />
            <PhoneField value="+7 999 12" onChange={() => undefined} error="Invalid phone number" />
          </div>
        </Section>

        <Section title="Search">
          <div className={styles.searchRow}>
            <SearchInput />
            <SearchInput
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
        </Section>

        <Section title="Avatars">
          <div className={styles.row}>
            {avatarNames.map((name) => (
              <Avatar key={name} name={name} seed={name} />
            ))}
            <Avatar name="+7 999 111-22-33" seed="79991112233" />
            <Avatar name="Anna Petrova" seed="Anna Petrova" size="medium" />
            <Avatar name="+7 999 111-22-33" seed="79991112233" size="medium" />
          </div>
        </Section>

        <Section title="Spinners and banners">
          <div className={styles.row}>
            <Spinner size="small" />
            <Spinner />
            <Spinner size="large" />
            <span className={styles.spinnerOnPrimary}>
              <Spinner color="white" />
            </span>
          </div>
          <div className={styles.banners}>
            <Banner loading>Reconnecting…</Banner>
            <Banner tone="warning" action={{ label: 'Log in again', onClick: () => undefined }}>
              Instance is not authorized
            </Banner>
          </div>
        </Section>

        <Section title="Menu and modal">
          <div className={styles.row}>
            <Menu trigger={<IconButton icon="more" label="More" />}>
              <MenuItem icon="retry">Retry</MenuItem>
              <MenuItem icon="trash" danger>
                Delete
              </MenuItem>
            </Menu>
            <Button variant="text" onClick={() => setModalOpen(true)}>
              Open modal
            </Button>
          </div>
          <Modal
            open={modalOpen}
            onOpenChange={setModalOpen}
            title="Log out"
            description="Are you sure you want to log out?"
            footer={
              <>
                <Button variant="text" size="small" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="small" onClick={() => setModalOpen(false)}>
                  Log out
                </Button>
              </>
            }
          />
        </Section>

        <Section title="Chat list items">
          <div className={styles.chatList}>
            <ChatListItem chat={mockChats[0]} selected />
            <ChatListItem chat={mockChats[1]} unreadCount={2} />
            <ChatListItem chat={mockChats[2]} unreadCount={128} />
            <ChatListItem chat={mockChats[3]} />
            <ChatListItem chat={mockChats[6]} />
            <ChatListItemSkeleton />
            <ChatListItemSkeleton />
          </div>
        </Section>

        <Section title="Messages" surface="wallpaper">
          <MessageList messages={mockShortConversation} />
          <div className={styles.scrollDownDemo}>
            <ScrollDownButton visible onClick={() => undefined} />
            <ScrollDownButton visible unreadCount={3} onClick={() => undefined} />
          </div>
        </Section>

        <Section title="Composer" surface="wallpaper">
          <div className={styles.composerDemo}>
            <Composer value={draft} onChange={setDraft} onSend={() => setDraft('')} />
          </div>
        </Section>

        <Section title="Icons">
          <div className={styles.icons}>
            {iconNames.map((name) => (
              <div key={name} className={styles.iconCell}>
                <Icon name={name} />
                <span>{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Composition</h2>
          <div className={styles.composition}>
            <MessengerMock />
          </div>
        </section>
      </div>
    </div>
  );
}
