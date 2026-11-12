import { useState } from 'react';
import { useNavigate } from 'react-router';
import { isPossiblePhone, phoneDigits } from '@/shared/lib';
import { Button, Modal, PhoneField } from '@/shared/ui';
import { useCreateChat } from '../api/useCreateChat';
import { createChatError } from '../model/createChatError';

type NewChatModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NewChatModal({ open, onOpenChange }: NewChatModalProps) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string>();
  const createChat = useCreateChat();
  const navigate = useNavigate();

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setPhone('');
      setError(undefined);
      createChat.reset();
    }
  }

  function handleSubmit() {
    if (createChat.isPending) return;
    const digits = phoneDigits(phone);
    if (!isPossiblePhone(digits)) {
      setError('Invalid phone number');
      return;
    }
    createChat.mutate(digits, {
      onSuccess: (chat) => {
        handleOpenChange(false);
        navigate(`/chats/${chat.id}`);
      },
      onError: (mutationError) => setError(createChatError(mutationError)),
    });
  }

  return (
    <Modal
      open={open}
      onOpenChange={handleOpenChange}
      title="New chat"
      onSubmit={handleSubmit}
      footer={
        <>
          <Button variant="text" size="small" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="text" size="small" loading={createChat.isPending}>
            Start chat
          </Button>
        </>
      }
    >
      <PhoneField
        value={phone}
        onChange={(next) => {
          setPhone(next);
          setError(undefined);
        }}
        error={error}
        autoFocus
      />
    </Modal>
  );
}
