import { useParams } from 'react-router';

export function Conversation() {
  const { chatId } = useParams();
  return <p>Chat {chatId}</p>;
}
