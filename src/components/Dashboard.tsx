import { useState, useMemo } from 'react';
import { Plus, Search, Eye, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Contract, ContractStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { EmptyState } from './ui/EmptyState';
import { formatDate } from '../utils/formatters';

interface DashboardProps {
  onViewContract: (contract: Contract) => void;
  onCreateContract: () => void;
}

export const Dashboard = ({
  onViewContract,
  onCreateContract,
}: DashboardProps) => {
  const { contracts, blueprints } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>(
    'all'
  );

  const statusOptions: { value: ContractStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All Contracts' },
    { value: 'created', label: 'Created' },
    { value: 'approved', label: 'Approved' },
    { value: 'sent', label: 'Sent' },
    { value: 'signed', label: 'Signed' },
    { value: 'locked', label: 'Locked' },
    { value: 'revoked', label: 'Revoked' },
  ];

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      const matchesSearch =
        searchQuery === '' ||
        contract.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: contracts.length,
      active: contracts.filter((c) => c.status === 'created' || c.status === 'approved').length,
      pending: contracts.filter((c) => c.status === 'sent').length,
      signed: contracts.filter((c) => c.status === 'signed' || c.status === 'locked').length,
      revoked: contracts.filter((c) => c.status === 'revoked').length,
    };
  }, [contracts]);

  const getBlueprintName = (blueprintId: string) => {
    const blueprint = blueprints.find((b) => b.id === blueprintId);
    return blueprint?.name || 'Unknown Blueprint';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Contract Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and track all your contracts
          </p>
        </div>
        <Button onClick={onCreateContract} size="lg">
          <Plus className="w-5 h-5" />
          New Contract
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Contracts"
          value={stats.total}
          color="bg-blue-600"
        />
        <StatCard
          label="Active"
          value={stats.active}
          color="bg-slate-600"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          color="bg-amber-600"
        />
        <StatCard
          label="Signed"
          value={stats.signed}
          color="bg-emerald-600"
        />
        <StatCard
          label="Revoked"
          value={stats.revoked}
          color="bg-red-600"
        />
      </div>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ContractStatus | 'all')
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-slate-400"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredContracts.length === 0 ? (
            <EmptyState
              icon={<AlertCircle className="w-8 h-8 text-slate-400" />}
              title={
                searchQuery || statusFilter !== 'all'
                  ? 'No contracts found'
                  : 'No contracts yet'
              }
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first contract to get started'
              }
              action={
                !searchQuery && statusFilter === 'all' ? (
                  <Button onClick={onCreateContract}>
                    <Plus className="w-4 h-4" />
                    Create Contract
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Contract Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Blueprint
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContracts.map((contract, index) => (
                    <tr
                      key={contract.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900">
                          {contract.name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-600">
                          {getBlueprintName(contract.blueprint_id)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <StatusBadge status={contract.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-600">
                          {formatDate(contract.created_at)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewContract(contract)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-3 shadow-lg`}>
          <span className="text-2xl font-bold text-white">{value}</span>
        </div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </Card>
  );
};
