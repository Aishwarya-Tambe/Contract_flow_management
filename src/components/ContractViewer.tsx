import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Lock,
  XCircle,
} from 'lucide-react';
import { Contract, BlueprintField } from '../types';
import { Button } from './ui/Button';
import { Card, CardBody, CardHeader, CardFooter } from './ui/Card';
import { Input } from './ui/Input';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { StatusBadge } from './StatusBadge';
import { blueprintService } from '../services/blueprintService';
import { contractService } from '../services/contractService';
import {
  isEditable,
  getNextValidStatus,
  canRevoke,
  getStatusLabel,
} from '../utils/contractLifecycle';
import { formatDateTime } from '../utils/formatters';
import { ContractLifecycleTimeline } from './ContractLifecycleTimeline';

interface ContractViewerProps {
  contractId: string;
  onBack: () => void;
  onUpdate: () => void;
}

export const ContractViewer = ({
  contractId,
  onBack,
  onUpdate,
}: ContractViewerProps) => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [blueprintFields, setBlueprintFields] = useState<BlueprintField[]>([]);
  const [editedValues, setEditedValues] = useState<Map<string, string>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const loadContract = async () => {
    setIsLoading(true);
    try {
      const contractData = await contractService.getById(contractId);
      if (!contractData) {
        alert('Contract not found');
        onBack();
        return;
      }

      setContract(contractData);

      const fields = await blueprintService.getFields(
        contractData.blueprint_id
      );
      setBlueprintFields(fields);

      const values = await contractService.getFieldValues(contractId);
      const editMap = new Map<string, string>();
      values.forEach((v) => {
        if (v.value) {
          editMap.set(v.blueprint_field_id, v.value);
        }
      });
      setEditedValues(editMap);
    } catch (error) {
      console.error('Error loading contract:', error);
      alert('Failed to load contract');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveValues = async () => {
    if (!contract) return;

    setIsSaving(true);
    try {
      for (const [fieldId, value] of editedValues.entries()) {
        await contractService.updateFieldValue(contract.id, fieldId, value);
      }
      await loadContract();
      onUpdate();
    } catch (error) {
      console.error('Error saving values:', error);
      alert('Failed to save values');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!contract) return;

    const requiredFields = blueprintFields.filter((f) => f.required);
    const missingFields = requiredFields.filter(
      (f) => !editedValues.get(f.id)?.trim()
    );

    if (missingFields.length > 0 && newStatus !== 'revoked') {
      alert(
        `Please fill in all required fields: ${missingFields.map((f) => f.label).join(', ')}`
      );
      return;
    }

    const confirmMessage =
      newStatus === 'revoked'
        ? 'Are you sure you want to revoke this contract? This action cannot be undone.'
        : `Transition contract to "${getStatusLabel(newStatus as any)}"?`;

    if (!confirm(confirmMessage)) return;

    setIsUpdatingStatus(true);
    try {
      await contractService.updateStatus(contract.id, newStatus as any);
      await loadContract();
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const renderFieldInput = (field: BlueprintField) => {
    const value = editedValues.get(field.id) || '';
    const disabled = !contract || !isEditable(contract.status);

    switch (field.field_type) {
      case 'text':
        return (
          <Input
            label={field.label}
            value={value}
            onChange={(e) => {
              const newMap = new Map(editedValues);
              newMap.set(field.id, e.target.value);
              setEditedValues(newMap);
            }}
            placeholder={field.placeholder}
            required={field.required}
            disabled={disabled}
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            label={field.label}
            value={value}
            onChange={(e) => {
              const newMap = new Map(editedValues);
              newMap.set(field.id, e.target.value);
              setEditedValues(newMap);
            }}
            required={field.required}
            disabled={disabled}
          />
        );

      case 'signature':
        return (
          <Input
            label={field.label}
            value={value}
            onChange={(e) => {
              const newMap = new Map(editedValues);
              newMap.set(field.id, e.target.value);
              setEditedValues(newMap);
            }}
            placeholder="Type your full name to sign"
            required={field.required}
            disabled={disabled}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.id}
              checked={value === 'true'}
              onChange={(e) => {
                const newMap = new Map(editedValues);
                newMap.set(field.id, e.target.checked.toString());
                setEditedValues(newMap);
              }}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <label
              htmlFor={field.id}
              className="text-sm text-slate-700"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!contract) {
    return null;
  }

  const canEdit = isEditable(contract.status);
  const nextStatus = getNextValidStatus(contract.status);
  const canRevokeContract = canRevoke(contract.status);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">
            {contract.name}
          </h1>
          <p className="text-slate-600 mt-1">
            Created {formatDateTime(contract.created_at)}
          </p>
        </div>
        <StatusBadge status={contract.status} />
      </div>

      {contract.status === 'locked' && (
        <div className="flex items-start gap-3 p-4 bg-slate-100 border border-slate-300 rounded-lg">
          <Lock className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">
              This contract is locked
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Locked contracts cannot be modified. All fields are read-only.
            </p>
          </div>
        </div>
      )}

      {contract.status === 'revoked' && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-300 rounded-lg">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">
              This contract has been revoked
            </p>
            <p className="text-sm text-red-700 mt-1">
              Revoked on {formatDateTime(contract.revoked_at || contract.updated_at)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">
                Contract Fields
              </h2>
              {canEdit && (
                <p className="text-sm text-slate-600 mt-1">
                  Fill in all required fields before proceeding
                </p>
              )}
            </CardHeader>
            <CardBody className="space-y-4">
              {blueprintFields.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600">
                    No fields defined in this blueprint
                  </p>
                </div>
              ) : (
                blueprintFields.map((field) => (
                  <div key={field.id}>{renderFieldInput(field)}</div>
                ))
              )}
            </CardBody>
            {canEdit && (
              <CardFooter>
                <Button
                  onClick={handleSaveValues}
                  isLoading={isSaving}
                  className="ml-auto"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">
                Lifecycle Timeline
              </h2>
            </CardHeader>
            <CardBody>
              <ContractLifecycleTimeline contract={contract} />
            </CardBody>
          </Card>

          {(nextStatus || canRevokeContract) && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-slate-900">
                  Actions
                </h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {nextStatus && (
                  <Button
                    onClick={() => handleUpdateStatus(nextStatus)}
                    isLoading={isUpdatingStatus}
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Move to {getStatusLabel(nextStatus)}
                  </Button>
                )}

                {canRevokeContract && (
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus('revoked')}
                    isLoading={isUpdatingStatus}
                    className="w-full"
                  >
                    <XCircle className="w-4 h-4" />
                    Revoke Contract
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
