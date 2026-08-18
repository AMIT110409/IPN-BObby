import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import styles from './MessageBubble.module.css';
export default function MessageBubble({ message }) {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    if (isSystem) {
        return (_jsx("div", { className: styles.system, children: _jsx("span", { children: message.content }) }));
    }
    return (_jsxs("div", { className: `${styles.row} ${isUser ? styles.rowUser : styles.rowBobby} animate-fade-in-up`, children: [!isUser && _jsx("div", { className: styles.avatar, children: "B" }), _jsxs("div", { className: `${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleBobby}`, children: [_jsx("div", { className: styles.markdownContent, children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: message.content }) }), message.intent && (_jsx("span", { className: styles.intentTag, children: message.intent.replace('_', ' ') })), _jsx("span", { className: styles.timestamp, children: format(new Date(message.timestamp), 'HH:mm') })] })] }));
}
