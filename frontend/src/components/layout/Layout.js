import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { InspiredLogo } from '@/pages/LoginPage';
import MessageBubble from '@/components/chat/MessageBubble';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import ActionButtons from '@/components/chat/ActionButtons';
import styles from './Layout.module.css';
const QUICK_ACTIONS = [
    {
        icon: '🎫',
        title: 'Report an IT Issue',
        desc: 'Raise a Freshdesk support ticket',
        prompt: 'I want to raise an IT support ticket',
    },
    {
        icon: '🔍',
        title: 'Check Ticket Status',
        desc: 'Track your open requests',
        prompt: 'What is the status of my ticket?',
    },
    {
        icon: '🌐',
        title: 'VPN & Wi-Fi Support',
        desc: 'Connection & network guides',
        prompt: 'How do I connect to the company VPN?',
    },
    {
        icon: '🔑',
        title: 'Password & Account',
        desc: 'SSPR reset & MFA setup',
        prompt: 'How do I reset my password?',
    },
];
export default function Layout({ children }) {
    const { user, messages, isLoading, pendingAction, sendMessage, approveAction } = useChatStore();
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [emailNotification, setEmailNotification] = useState(null);
    const chatBottomRef = useRef(null);
    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12)
            return 'Good morning';
        if (hour < 17)
            return 'Good afternoon';
        return 'Good evening';
    };
    const userName = user?.name ? user.name.split(' (')[0].split(' ')[0] : 'there';
    const greeting = `${getTimeGreeting()}, ${userName}! 👋`;
    const handleLogout = () => {
        localStorage.removeItem('bobby_user');
        localStorage.removeItem('bobby_token');
        window.location.href = '/';
    };
    useEffect(() => {
        if (isChatOpen) {
            chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading, isChatOpen]);
    useEffect(() => {
        if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.sender === 'bobby') {
                const text = lastMsg.content.toLowerCase();
                if (text.includes("shall i create a ticket")) {
                    setIsChatOpen(true);
                }
                if (text.includes("escalated to p1 priority") || text.includes("escalated to high priority")) {
                    setEmailNotification({
                        subject: "Notification: Ticket Escalated to P1 Priority",
                        body: `Hello ${user?.name.split(' (')[0] || 'Employee'},\n\nYour request has been escalated to P1 priority. An on-call engineer has been assigned.\nExpected MTTR: 15 minutes.\n\nBest Regards,\nInspired Pet Nutrition Helpdesk`
                    });
                    const timer = setTimeout(() => setEmailNotification(null), 10000);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [messages, user]);
    return (_jsxs("div", { className: styles.shell, children: [_jsx("header", { className: styles.header, children: _jsxs("div", { className: styles.headerContainer, children: [_jsx("div", { className: styles.logoWrapper, children: _jsx(InspiredLogo, { variant: "header" }) }), _jsxs("nav", { className: styles.nav, children: [_jsx(NavLink, { to: "/home", className: styles.navLink, children: "HOME" }), _jsx("a", { href: "#brands", className: styles.navLink, children: "BRANDS" }), _jsx("a", { href: "#about", className: styles.navLink, children: "ABOUT" }), _jsx("a", { href: "#careers", className: styles.navLink, children: "CAREERS" }), _jsx("a", { href: "#news", className: styles.navLink, children: "NEWS" }), _jsx("a", { href: "#environment", className: styles.navLink, children: "ENVIRONMENT" }), _jsx("a", { href: "#contact", className: styles.contactBtn, children: "CONTACT" }), user && (_jsxs("button", { className: styles.logoutBtn, onClick: handleLogout, children: ["Sign out (", user.name.split(' (')[0], ")"] }))] })] }) }), _jsx("main", { className: styles.main, children: children }), emailNotification && (_jsxs("div", { className: styles.emailToast, children: [_jsxs("div", { className: styles.emailToastHeader, children: [_jsx("span", { className: styles.emailIcon, children: "\u2709\uFE0F" }), _jsxs("div", { children: [_jsx("p", { className: styles.emailSender, children: "Inspired Pet Nutrition Helpdesk" }), _jsx("p", { className: styles.emailSubject, children: emailNotification.subject })] }), _jsx("button", { className: styles.toastCloseBtn, onClick: () => setEmailNotification(null), children: "\u2715" })] }), _jsx("div", { className: styles.emailToastBody, children: emailNotification.body.split('\n').map((line, i) => (_jsx("p", { children: line }, i))) })] })), _jsxs("div", { className: styles.widgetContainer, children: [!isChatOpen && (_jsxs("button", { className: styles.chatBadge, onClick: () => setIsChatOpen(true), "aria-label": "Open Bobby Chat", children: [_jsx("span", { className: styles.statusDot }), _jsx("span", { className: styles.badgeText, children: "Bobby, AI agent" })] })), isChatOpen && (_jsxs("div", { className: styles.chatWindow, children: [_jsxs("div", { className: styles.chatHeader, children: [_jsxs("div", { className: styles.headerInfo, children: [_jsx("div", { className: styles.avatar, children: "B" }), _jsxs("div", { children: [_jsx("h3", { className: styles.headerTitle, children: "Bobby" }), _jsx("p", { className: styles.headerSub, children: "AI IT Service Management" })] })] }), _jsx("button", { className: styles.closeBtn, onClick: () => setIsChatOpen(false), "aria-label": "Close Chat", children: "\u2715" })] }), _jsxs("div", { className: styles.chatBody, children: [messages.length === 0 && (_jsxs("div", { className: styles.welcome, children: [_jsxs("div", { className: styles.welcomeBadge, children: [_jsx("span", { className: styles.welcomeLiveDot }), _jsx("span", { children: "24/7 IT Service Desk" })] }), _jsx("h4", { className: styles.welcomeHeading, children: greeting }), _jsx("p", { className: styles.welcomeSub, children: "How can IT Support help you today? Select a common request or type below." }), _jsx("div", { className: styles.quickActionGrid, children: QUICK_ACTIONS.map((action) => (_jsxs("button", { className: styles.quickActionCard, onClick: () => sendMessage(action.prompt), children: [_jsx("span", { className: styles.quickActionIcon, children: action.icon }), _jsxs("div", { className: styles.quickActionText, children: [_jsx("span", { className: styles.quickActionTitle, children: action.title }), _jsx("span", { className: styles.quickActionDesc, children: action.desc })] })] }, action.title))) })] })), messages.map((msg) => (_jsx(MessageBubble, { message: msg }, msg.id))), isLoading && _jsx(TypingIndicator, {}), pendingAction && !isLoading && (_jsx(ActionButtons, { pendingAction: pendingAction, onApprove: (editedData) => approveAction(true, editedData), onReject: () => approveAction(false) })), _jsx("div", { ref: chatBottomRef })] }), _jsx(ChatInput, { onSend: sendMessage, disabled: isLoading || !!pendingAction })] }))] })] }));
}
