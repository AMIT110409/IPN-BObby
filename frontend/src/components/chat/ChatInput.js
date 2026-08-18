import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import styles from './ChatInput.module.css';
export default function ChatInput({ onSend, disabled }) {
    const [value, setValue] = useState('');
    const [attachedFile, setAttachedFile] = useState(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const formatFileSize = (bytes) => {
        if (bytes < 1024)
            return bytes + ' B';
        if (bytes < 1048576)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / 1048576).toFixed(1) + ' MB';
    };
    const handleFileClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile({
                name: file.name,
                size: formatFileSize(file.size),
            });
        }
    };
    const handleRemoveFile = () => {
        setAttachedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handleSend = () => {
        let msg = value.trim();
        if (!msg && !attachedFile)
            return;
        if (disabled)
            return;
        if (attachedFile) {
            const fileHeader = `📎 [Attached File: ${attachedFile.name} (${attachedFile.size})]`;
            msg = msg ? `${msg}\n${fileHeader}` : fileHeader;
        }
        onSend(msg);
        setValue('');
        setAttachedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    const handleInput = () => {
        const el = textareaRef.current;
        if (!el)
            return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 80) + 'px';
    };
    return (_jsxs("div", { className: styles.container, children: [attachedFile && (_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    margin: '0 8px 6px 8px',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #10B981',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#064E3B'
                }, children: [_jsx("span", { style: { fontSize: '14px' }, children: "\uD83D\uDCC4" }), _jsx("span", { style: { fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: attachedFile.name }), _jsxs("span", { style: { color: '#059669', fontSize: '11px' }, children: ["(", attachedFile.size, ")"] }), _jsx("button", { type: "button", onClick: handleRemoveFile, style: {
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            color: '#991B1B',
                            cursor: 'pointer',
                            fontWeight: 700,
                            fontSize: '14px',
                            padding: '0 4px'
                        }, title: "Remove attached file", children: "\u2715" })] })), _jsxs("div", { className: styles.inputRow, children: [_jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, style: { display: 'none' }, accept: "image/*,.pdf,.doc,.docx,.txt,.log,.xlsx" }), _jsx("button", { type: "button", className: styles.attachBtn, onClick: handleFileClick, "aria-label": "Attach file", title: "Upload screenshot or document", style: { cursor: 'pointer' }, children: _jsx("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: attachedFile ? '#10B981' : 'currentColor', strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" }) }) }), _jsx("textarea", { ref: textareaRef, className: styles.textarea, value: value, onChange: (e) => setValue(e.target.value), onKeyDown: handleKeyDown, onInput: handleInput, placeholder: "Type your message...", disabled: disabled, rows: 1 }), _jsx("button", { className: styles.sendBtn, onClick: handleSend, disabled: (!value.trim() && !attachedFile) || disabled, "aria-label": "Send message", children: _jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "22", y1: "2", x2: "11", y2: "13" }), _jsx("polygon", { points: "22 2 15 22 11 13 2 9 22 2" })] }) })] }), _jsx("p", { className: styles.hint, children: "Ask Bobby anything Usually replies in under a minute" })] }));
}
