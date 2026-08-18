import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message } from '@/types/chat.types';
import { format } from 'date-fns';
import styles from './MessageBubble.module.css';

interface Props { message: Message; }

export default function MessageBubble({ message }: Props) {
  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className={styles.system}>
        <span>{message.content}</span>
      </div>
    );
  }

  return (
    <div className={`${styles.row} ${isUser ? styles.rowUser : styles.rowBobby} animate-fade-in-up`}>
      {!isUser && <div className={styles.avatar}>B</div>}
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleBobby}`}>
        <div className={styles.markdownContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>
        {message.intent && (
          <span className={styles.intentTag}>{message.intent.replace('_', ' ')}</span>
        )}
        <span className={styles.timestamp}>
          {format(new Date(message.timestamp), 'HH:mm')}
        </span>
      </div>
    </div>
  );
}
