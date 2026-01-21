import { ContractStatus } from '../types';
import { getStatusColor, getStatusLabel } from '../utils/contractLifecycle';

interface StatusBadgeProps {
  status: ContractStatus;
  showIcon?: boolean;
}

export const StatusBadge = ({ status, showIcon = true }: StatusBadgeProps) => {
  const getStatusIcon = (status: ContractStatus) => {
    const icons = {
      created: '📝',
      approved: '✓',
      sent: '📤',
      signed: '✍️',
      locked: '🔒',
      revoked: '❌',
    };
    return icons[status];
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
    >
      {showIcon && <span>{getStatusIcon(status)}</span>}
      {getStatusLabel(status)}
    </span>
  );
};
