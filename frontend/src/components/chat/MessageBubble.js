import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { format } from 'date-fns';
import styles from './MessageBubble.module.css';
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const CATEGORY_OPTIONS = [
    'Workplace & Hardware',
    'Network & Infrastructure',
    'Identity & Access',
    'Cybersecurity',
    'Enterprise Applications',
    'HR',
    'Finance',
    'IT'
];
export default function MessageBubble({ message, isLatest, onApprove, onReject }) {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    const hasPendingAction = isLatest && (message.requiresApproval || !!message.pendingAction);
    const pendingData = message.pendingAction?.data;
    const [isEditing, setIsEditing] = useState(false);
    const [subject, setSubject] = useState(pendingData?.subject || '');
    const [category, setCategory] = useState(pendingData?.category || 'Workplace & Hardware');
    const [priority, setPriority] = useState(pendingData?.priority || 'medium');
    const [description, setDescription] = useState(pendingData?.description || '');
    if (isSystem) {
        return (_jsx("div", { className: styles.system, children: _jsx("span", { children: message.content }) }));
    }
    const handleConfirmEdited = () => {
        if (onApprove) {
            onApprove({
                ...pendingData,
                subject,
                category,
                priority,
                description,
            });
            setIsEditing(false);
        }
    };
    return (_jsxs("div", { className: `${styles.row} ${isUser ? styles.rowUser : styles.rowBobby} animate-fade-in-up`, children: [!isUser && _jsx("div", { className: styles.avatar, children: "B" }), _jsxs("div", { className: `${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleBobby}`, children: [_jsx("div", { className: styles.markdownContent, children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm], children: message.content }) }), hasPendingAction && onApprove && onReject && (_jsx("div", { className: styles.actionContainer, children: !isEditing ? (_jsxs("div", { className: styles.buttonRow, children: [_jsx("button", { className: styles.btnConfirm, onClick: () => onApprove(pendingData), children: "\uD83D\uDE80 Confirm & Submit" }), _jsx("button", { className: styles.btnEdit, onClick: () => {
                                        setSubject(pendingData?.subject || '');
                                        setCategory(pendingData?.category || 'Workplace & Hardware');
                                        setPriority(pendingData?.priority || 'medium');
                                        setDescription(pendingData?.description || '');
                                        setIsEditing(true);
                                    }, children: "\u270F\uFE0F Edit Details" }), _jsx("button", { className: styles.btnCancel, onClick: onReject, children: "\u2715 Cancel" })] })) : (_jsxs("div", { className: styles.editCard, children: [_jsx("p", { className: styles.editTitle, children: "\u270F\uFE0F Customize Ticket Details" }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { className: styles.formLabel, children: "Subject" }), _jsx("input", { className: styles.formInput, value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Subject summary" })] }), _jsxs("div", { className: styles.formRow, children: [_jsxs("div", { className: styles.formGroup, children: [_jsx("label", { className: styles.formLabel, children: "Category" }), _jsx("select", { className: styles.formSelect, value: category, onChange: (e) => setCategory(e.target.value), children: CATEGORY_OPTIONS.map((c) => (_jsx("option", { value: c, children: c }, c))) })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { className: styles.formLabel, children: "Priority" }), _jsx("select", { className: styles.formSelect, value: priority, onChange: (e) => setPriority(e.target.value), children: PRIORITY_OPTIONS.map((p) => (_jsx("option", { value: p, children: p.toUpperCase() }, p))) })] })] }), _jsxs("div", { className: styles.formGroup, children: [_jsx("label", { className: styles.formLabel, children: "Description" }), _jsx("textarea", { className: styles.formTextarea, rows: 2, value: description, onChange: (e) => setDescription(e.target.value) })] }), _jsxs("div", { className: styles.editActions, children: [_jsx("button", { className: styles.btnEditCancel, onClick: () => setIsEditing(false), children: "Back to Preview" }), _jsx("button", { className: styles.btnConfirm, onClick: handleConfirmEdited, children: "\uD83D\uDCBE Save & Submit" })] })] })) })), message.intent && (_jsx("span", { className: styles.intentTag, children: message.intent.replace('_', ' ') })), _jsx("span", { className: styles.timestamp, children: format(new Date(message.timestamp), 'HH:mm') })] })] }));
}
