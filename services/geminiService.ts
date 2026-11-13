import { ChatMessage } from '../types';
import { auth } from './firebase';

export const sendMessageToGemini = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Please sign in to consult the AI advisor.');
  }

  const idToken = await currentUser.getIdToken();

  const formattedHistory = history
    .filter((m) => m.id !== 'welcome')
    .map((m) => ({
      role: m.role,
      text: m.text,
    }));

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      message,
      history: formattedHistory,
    }),
  });

  const data = (await response.json().catch(() => ({}))) as {
    text?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error || 'AI advisor is unavailable');
  }

  return data.text || 'No response generated.';
};