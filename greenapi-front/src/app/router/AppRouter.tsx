import { createBrowserRouter, Navigate } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { ChatPage, Conversation, EmptyConversation } from '@/pages/chat';
import { LoginPage } from '@/pages/login';
import { UiKitPage } from '@/pages/ui-kit';
import { GuestOnly, RequireAuth } from './guards';

const router = createBrowserRouter([
  { path: '/ui-kit', element: <UiKitPage /> },
  {
    element: <GuestOnly />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <ChatPage />,
        children: [
          { index: true, element: <EmptyConversation /> },
          { path: 'chats/:chatId', element: <Conversation /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
