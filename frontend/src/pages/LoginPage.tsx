import { useState } from 'react';
import type { User, UserRole } from '@/types/chat.types';
import styles from './LoginPage.module.css';

const DEMO_USERS: User[] = [
  { user_id: 'employee-001@company.com', name: 'Alex (Employee)', role: 'employee' },
  { user_id: 'helpdesk-001@company.com', name: 'Sarah (Helpdesk)', role: 'helpdesk' },
  { user_id: 'admin-001@company.com',    name: 'James (IT Admin)', role: 'admin' },
];

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [selected, setSelected] = useState<User>(DEMO_USERS[0]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}>B</div>
          <div>
            <h1 className={styles.logoTitle}>Bobby</h1>
            <p className={styles.logoSub}>AI Service Management</p>
          </div>
        </div>

        <p className={styles.demoLabel}>🚧 Demo — Select a role to continue</p>

        {/* Role selector */}
        <div className={styles.roleList}>
          {DEMO_USERS.map((u) => (
            <button
              key={u.user_id}
              className={`${styles.roleCard} ${selected.user_id === u.user_id ? styles.selected : ''}`}
              onClick={() => setSelected(u)}
            >
              <div className={styles.roleAvatar}>{u.name[0]}</div>
              <div>
                <p className={styles.roleName}>{u.name}</p>
                <p className={styles.roleTag}>{u.role}</p>
              </div>
            </button>
          ))}
        </div>

        <button className={styles.loginBtn} onClick={() => onLogin(selected)}>
          Continue as {selected.name.split(' (')[0]} →
        </button>
      </div>
    </div>
  );
}
