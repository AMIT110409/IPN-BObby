import styles from './ActionButtons.module.css';

interface Props {
  onApprove: () => void;
  onReject: () => void;
}

export default function ActionButtons({ onApprove, onReject }: Props) {
  return (
    <div className={styles.container}>
      <p className={styles.label}>Bobby is waiting for your approval:</p>
      <div className={styles.buttons}>
        <button className={styles.approve} onClick={onApprove}>
          ✅ Approve
        </button>
        <button className={styles.reject} onClick={onReject}>
          ❌ Reject
        </button>
      </div>
    </div>
  );
}
