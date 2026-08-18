import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from './ActionButtons.module.css';
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];
const CATEGORY_OPTIONS = ['IT', 'HR', 'Finance', 'General'];
const PRIORITY_COLORS = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    urgent: '#ef4444',
};
export default function ActionButtons({ onApprove, onReject, pendingAction }) {
    const data = pendingAction?.data;
    const isTicket = pendingAction?.type === 'create_ticket';
    const [subject, setSubject] = useState(data?.subject || '');
    const [description, setDescription] = useState((data?.description || '').split('\n\nThis ticket was automatically created')[0]);
    const [priority, setPriority] = useState(data?.priority || 'medium');
    const [category, setCategory] = useState(data?.category || 'IT');
    const [isEditing, setIsEditing] = useState(false);
    const handleConfirm = () => {
        onApprove({
            ...data,
            subject,
            description,
            priority,
            category,
        });
    };
    if (!isTicket) {
        return (_jsxs("div", { className: styles.container, children: [_jsx("p", { className: styles.label, children: "Bobby is waiting for your approval:" }), _jsxs("div", { className: styles.buttons, children: [_jsx("button", { className: styles.approve, onClick: () => onApprove(), children: "\u2705 Approve" }), _jsx("button", { className: styles.reject, onClick: onReject, children: "\u2715 Reject" })] })] }));
    }
    return (_jsxs("div", { className: styles.draftCard, children: [_jsxs("div", { className: styles.draftHeader, children: [_jsx("span", { className: styles.draftIcon, children: "\uD83C\uDFAB" }), _jsxs("div", { children: [_jsx("p", { className: styles.draftTitle, children: "Ticket Draft \u2014 Please Review" }), _jsx("p", { className: styles.draftSub, children: "Review details and confirm or edit before submitting" })] })] }), _jsxs("div", { className: styles.draftBody, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { className: styles.fieldLabel, children: "Subject" }), isEditing ? (_jsx("input", { className: styles.fieldInput, value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Brief description of the issue" })) : (_jsx("p", { className: styles.fieldValue, children: subject || 'IT Support Request' }))] }), _jsxs("div", { className: styles.fieldRow, children: [_jsxs("div", { className: styles.field, children: [_jsx("label", { className: styles.fieldLabel, children: "Priority" }), isEditing ? (_jsx("select", { className: styles.fieldSelect, value: priority, onChange: (e) => setPriority(e.target.value), children: PRIORITY_OPTIONS.map((p) => (_jsx("option", { value: p, children: p.charAt(0).toUpperCase() + p.slice(1) }, p))) })) : (_jsx("span", { className: styles.priorityBadge, style: { background: `${PRIORITY_COLORS[priority]}20`, color: PRIORITY_COLORS[priority], border: `1px solid ${PRIORITY_COLORS[priority]}40` }, children: priority.charAt(0).toUpperCase() + priority.slice(1) }))] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { className: styles.fieldLabel, children: "Category" }), isEditing ? (_jsx("select", { className: styles.fieldSelect, value: category, onChange: (e) => setCategory(e.target.value), children: CATEGORY_OPTIONS.map((c) => (_jsx("option", { value: c, children: c }, c))) })) : (_jsx("span", { className: styles.categoryBadge, children: category }))] })] }), _jsxs("div", { className: styles.field, children: [_jsx("label", { className: styles.fieldLabel, children: "Description" }), isEditing ? (_jsx("textarea", { className: styles.fieldTextarea, value: description, onChange: (e) => setDescription(e.target.value), rows: 3, placeholder: "Detailed description for the IT team" })) : (_jsx("p", { className: styles.fieldDesc, children: description }))] })] }), _jsxs("div", { className: styles.draftActions, children: [!isEditing && (_jsx("button", { className: styles.editBtn, onClick: () => setIsEditing(true), children: "\u270F\uFE0F Edit Details" })), isEditing && (_jsx("button", { className: styles.editBtn, onClick: () => setIsEditing(false), children: "\uD83D\uDC41 Preview" })), _jsx("button", { className: styles.rejectBtn, onClick: onReject, children: "\u2715 Cancel" }), _jsx("button", { className: styles.confirmBtn, onClick: handleConfirm, children: "\u2705 Confirm & Submit" })] })] }));
}
