import { ContractStatus } from '../types';

export const CONTRACT_LIFECYCLE: ContractStatus[] = [
  'created',
  'approved',
  'sent',
  'signed',
  'locked',
];

export const getNextValidStatus = (
  currentStatus: ContractStatus
): ContractStatus | null => {
  if (currentStatus === 'revoked') return null;
  if (currentStatus === 'locked') return null;

  const currentIndex = CONTRACT_LIFECYCLE.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex === CONTRACT_LIFECYCLE.length - 1) {
    return null;
  }

  return CONTRACT_LIFECYCLE[currentIndex + 1];
};

export const canTransitionTo = (
  currentStatus: ContractStatus,
  targetStatus: ContractStatus
): boolean => {
  if (currentStatus === 'revoked') return false;
  if (currentStatus === 'locked') return false;

  if (targetStatus === 'revoked') {
    return currentStatus === 'created' || currentStatus === 'sent';
  }

  const currentIndex = CONTRACT_LIFECYCLE.indexOf(currentStatus);
  const targetIndex = CONTRACT_LIFECYCLE.indexOf(targetStatus);

  return targetIndex === currentIndex + 1;
};

export const canRevoke = (currentStatus: ContractStatus): boolean => {
  return currentStatus === 'created' || currentStatus === 'sent';
};

export const isEditable = (status: ContractStatus): boolean => {
  return status === 'created';
};

export const getStatusColor = (status: ContractStatus): string => {
  const colorMap: Record<ContractStatus, string> = {
    created: 'bg-slate-100 text-slate-700 border-slate-300',
    approved: 'bg-blue-100 text-blue-700 border-blue-300',
    sent: 'bg-amber-100 text-amber-700 border-amber-300',
    signed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    locked: 'bg-gray-100 text-gray-700 border-gray-400',
    revoked: 'bg-red-100 text-red-700 border-red-300',
  };
  return colorMap[status];
};

export const getStatusLabel = (status: ContractStatus): string => {
  const labelMap: Record<ContractStatus, string> = {
    created: 'Created',
    approved: 'Approved',
    sent: 'Sent',
    signed: 'Signed',
    locked: 'Locked',
    revoked: 'Revoked',
  };
  return labelMap[status];
};

export const getStatusProgress = (status: ContractStatus): number => {
  if (status === 'revoked') return 0;
  const index = CONTRACT_LIFECYCLE.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / CONTRACT_LIFECYCLE.length) * 100;
};
