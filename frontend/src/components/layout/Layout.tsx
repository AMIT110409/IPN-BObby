import { NavLink } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import styles from './Layout.module.css';

interface Props { children: React.ReactNode; }

export default function Layout({ children }: Props) {
  const { user, clearChat } = useChatStore();

  const handleLogout = () => {
    localStorage.removeItem('bobby_user');
    localStorage.removeItem('bobby_token');
    window.location.href = '/';
  };

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoMark}>B</div>
          <span className={styles.logoText}>Bobby</span>
        </div>

        <nav className={styles.nav}>
          <NavLink
            to="/chat"
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>💬</span>
            Chat
          </NavLink>

          {(user?.role === 'helpdesk' || user?.role === 'admin') && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>📋</span>
              Dashboard
            </NavLink>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          {user && (
            <div className={styles.userCard}>
              <div className={styles.userAvatar}>{user.name[0]}</div>
              <div className={styles.userInfo}>
                <p className={styles.userName}>{user.name.split(' (')[0]}</p>
                <p className={styles.userRole}>{user.role}</p>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
