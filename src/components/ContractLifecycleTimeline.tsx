import { Check, Circle, X } from 'lucide-react';
import { Contract } from '../types';
import { CONTRACT_LIFECYCLE, getStatusLabel } from '../utils/contractLifecycle';
import { formatDateTime } from '../utils/formatters';

interface ContractLifecycleTimelineProps {
  contract: Contract;
}

export const ContractLifecycleTimeline = ({
  contract,
}: ContractLifecycleTimelineProps) => {
  const getStatusDate = (status: string): string | null => {
    switch (status) {
      case 'created':
        return contract.created_at;
      case 'approved':
        return contract.approved_at || null;
      case 'sent':
        return contract.sent_at || null;
      case 'signed':
        return contract.signed_at || null;
      case 'locked':
        return contract.locked_at || null;
      default:
        return null;
    }
  };

  const currentIndex = CONTRACT_LIFECYCLE.indexOf(contract.status);
  const isRevoked = contract.status === 'revoked';

  return (
    <div className="space-y-4">
      {CONTRACT_LIFECYCLE.map((status, index) => {
        const isCompleted = isRevoked ? false : index <= currentIndex;
        const isCurrent = !isRevoked && index === currentIndex;
        const statusDate = getStatusDate(status);

        return (
          <div key={status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-blue-600 text-white shadow-md'
                    : isCurrent
                    ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>
              {index < CONTRACT_LIFECYCLE.length - 1 && (
                <div
                  className={`w-0.5 h-8 transition-all duration-300 ${
                    isCompleted ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>

            <div className="flex-1 pb-8">
              <div
                className={`font-medium transition-colors duration-300 ${
                  isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                {getStatusLabel(status)}
              </div>
              {statusDate && (
                <div className="text-xs text-slate-500 mt-1">
                  {formatDateTime(statusDate)}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {isRevoked && (
        <div className="flex items-start gap-3 mt-4 pt-4 border-t border-slate-200">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600 text-white shadow-md">
            <X className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-red-900">Revoked</div>
            {contract.revoked_at && (
              <div className="text-xs text-red-700 mt-1">
                {formatDateTime(contract.revoked_at)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
