import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import styles from './LoginPage.module.css';
import dogImg from '@/assets/dog_login_hero.png';
export function InspiredLogo({ variant = 'dark-bg' }) {
    if (variant === 'header') {
        return (_jsx("div", { style: { display: 'flex', alignItems: 'center' }, children: _jsxs("svg", { width: "170", height: "40", viewBox: "0 0 170 40", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("text", { x: "0", y: "24", fill: "#FFFFFF", fontFamily: "Georgia, serif", fontSize: "22", fontWeight: "bold", children: "Inspired" }), _jsx("text", { x: "0", y: "35", fill: "#FFFFFF", fontFamily: "sans-serif", fontSize: "7", fontWeight: "700", letterSpacing: "2.5", children: "PET NUTRITION" }), _jsxs("g", { transform: "translate(108, 4)", children: [_jsx("path", { d: "M 0 15 L 14 2 L 28 15 L 28 30 L 0 30 Z", fill: "#FFFFFF" }), _jsx("circle", { cx: "14", cy: "20", r: "4.5", fill: "#00473C" }), _jsx("path", { d: "M 9 30 L 9 20 Q 14 15 19 20 L 19 30 Z", fill: "#00473C" })] })] }) }));
    }
    return (_jsx("div", { style: { display: 'flex', alignItems: 'center' }, children: _jsxs("svg", { width: "112", height: "34", viewBox: "0 0 112 34", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("rect", { width: "112", height: "34", rx: "4", fill: "#00473C" }), _jsx("text", { x: "8", y: "22", fill: "#FFFFFF", fontFamily: "Georgia, serif", fontSize: "15", fontWeight: "bold", children: "Inspired" }), _jsxs("g", { transform: "translate(78, 6)", scale: "0.75", children: [_jsx("path", { d: "M 0 12 L 12 0 L 24 12 L 24 24 L 0 24 Z", fill: "#FFFFFF" }), _jsx("circle", { cx: "12", cy: "15", r: "3", fill: "#00473C" }), _jsx("path", { d: "M 8 24 L 8 16 Q 12 13 16 16 L 16 24 Z", fill: "#00473C" })] })] }) }));
}
export default function LoginPage({ onLogin }) {
    const [email, setEmail] = useState('hello@inspirednutrition.com');
    const [password, setPassword] = useState('password123');
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!response.ok)
                throw new Error('Login failed');
            const data = await response.json();
            localStorage.setItem('bobby_token', data.access_token);
            onLogin(data.user);
        }
        catch (err) {
            console.error('Auth API error, falling back to local session:', err);
            const role = email.includes('admin') ? 'admin' : email.includes('helpdesk') ? 'helpdesk' : 'employee';
            const name = role === 'admin' ? 'James (IT Admin)' : role === 'helpdesk' ? 'Sarah (Helpdesk)' : 'Alex (Employee)';
            onLogin({
                user_id: email,
                name,
                role
            });
        }
    };
    return (_jsxs("div", { className: styles.container, children: [_jsx("div", { className: styles.formPane, children: _jsxs("div", { className: styles.formContainer, children: [_jsx("div", { className: styles.logoWrapper, children: _jsx(InspiredLogo, {}) }), _jsxs("div", { className: styles.welcomeHeader, children: [_jsx("h1", { className: styles.title, children: "Welcome Back" }), _jsxs("p", { className: styles.subtitle, children: ["Sign in to continue your journey with ", _jsx("span", { className: styles.brandLink, children: "Inspired." })] })] }), _jsxs("form", { onSubmit: handleSubmit, className: styles.form, children: [_jsxs("div", { className: styles.inputGroup, children: [_jsx("label", { htmlFor: "email", className: styles.label, children: "Email Address" }), _jsxs("div", { className: styles.inputWrapper, children: [_jsx("span", { className: styles.inputIcon, children: "\u2709" }), _jsx("input", { type: "email", id: "email", className: styles.input, value: email, onChange: (e) => setEmail(e.target.value), required: true })] })] }), _jsxs("div", { className: styles.inputGroup, children: [_jsx("label", { htmlFor: "password", className: styles.label, children: "Password" }), _jsxs("div", { className: styles.inputWrapper, children: [_jsx("span", { className: styles.inputIcon, children: "\uD83D\uDD12" }), _jsx("input", { type: showPassword ? 'text' : 'password', id: "password", className: styles.input, value: password, onChange: (e) => setPassword(e.target.value), required: true }), _jsx("button", { type: "button", className: styles.eyeBtn, onClick: () => setShowPassword(!showPassword), children: showPassword ? '👁️' : '👁️‍🗨️' })] })] }), _jsxs("div", { className: styles.formMeta, children: [_jsxs("label", { className: styles.rememberMe, children: [_jsx("input", { type: "checkbox", checked: rememberMe, onChange: (e) => setRememberMe(e.target.checked) }), _jsx("span", { className: styles.checkboxLabel, children: "Remember me" })] }), _jsx("a", { href: "#forgot", className: styles.forgotLink, children: "Forgot password?" })] }), _jsx("button", { type: "submit", className: styles.submitBtn, children: "Sign In" })] }), _jsx("div", { className: styles.divider, children: _jsx("span", { children: "OR" }) })] }) }), _jsx("div", { className: styles.imagePane, style: { backgroundImage: `url(${dogImg})` }, children: _jsxs("div", { className: styles.imageOverlay, children: [_jsx("h2", { className: styles.heroTitle, children: "We Create Happiness" }), _jsx("p", { className: styles.heroSubtitle, children: "Through better nutrition." })] }) })] }));
}
