import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ChatPage, Conversation, EmptyConversation } from '@/pages/chat';
import { LoginPage } from '@/pages/login';
import { UiKitPage } from '@/pages/ui-kit';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/ui-kit', element: <UiKitPage /> },
  {
    path: '/',
    element: <ChatPage />,
    children: [
      { index: true, element: <EmptyConversation /> },
      { path: 'chats/:chatId', element: <Conversation /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
