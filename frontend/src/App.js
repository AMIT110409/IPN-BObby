import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useChatStore } from '@/store/chatStore';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import Layout from '@/components/layout/Layout';
export default function App() {
    const { setUser } = useChatStore();
    const [authed, setAuthed] = useState(false);
    useEffect(() => {
        // Demo: restore user from localStorage
        const saved = localStorage.getItem('bobby_user');
        if (saved) {
            const user = JSON.parse(saved);
            setUser(user);
            setAuthed(true);
        }
    }, [setUser]);
    const handleLogin = (user) => {
        localStorage.setItem('bobby_user', JSON.stringify(user));
        setUser(user);
        setAuthed(true);
    };
    if (!authed) {
        return _jsx(LoginPage, { onLogin: handleLogin });
    }
    return (_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/home", replace: true }) }), _jsx(Route, { path: "/home", element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/home", replace: true }) })] }) }) }));
}
