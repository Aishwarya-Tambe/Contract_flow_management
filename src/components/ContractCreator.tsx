import { useState } from 'react';
import { ArrowLeft, FileText, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Blueprint } from '../types';
import { Button } from './ui/Button';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Input } from './ui/Input';
import { EmptyState } from './ui/EmptyState';
import { contractService } from '../services/contractService';
import { formatDate } from '../utils/formatters';

interface ContractCreatorProps {
  onBack: () => void;
  onContractCreated: (contractId: string) => void;
}

export const ContractCreator = ({
  onBack,
  onContractCreated,
}: ContractCreatorProps) => {
  const { blueprints } = useApp();
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(
    null
  );
  const [contractName, setContractName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSelectBlueprint = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setContractName(`${blueprint.name} - ${new Date().toLocaleDateString()}`);
  };

  const handleCreate = async () => {
    if (!selectedBlueprint || !contractName.trim()) {
      alert('Please select a blueprint and enter a contract name');
      return;
    }

    setIsCreating(true);
    try {
      const contract = await contractService.create(
        selectedBlueprint.id,
        contractName
      );
      onContractCreated(contract.id);
    } catch (error) {
      console.error('Error creating contract:', error);
      alert('Failed to create contract');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Create New Contract
          </h1>
          <p className="text-slate-600 mt-1">
            Select a blueprint template to get started
          </p>
        </div>
      </div>

      {!selectedBlueprint ? (
        <>
          {blueprints.length === 0 ? (
            <Card>
              <CardBody>
                <EmptyState
                  icon={<FileText className="w-8 h-8 text-slate-400" />}
                  title="No blueprints available"
                  description="Create a blueprint template first before creating contracts"
                />
              </CardBody>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blueprints.map((blueprint, index) => (
                <Card
                  key={blueprint.id}
                  hover
                  onClick={() => handleSelectBlueprint(blueprint)}
                  className="cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {blueprint.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Created {formatDate(blueprint.created_at)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {blueprint.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                        {blueprint.description}
                      </p>
                    )}
                    <Button variant="secondary" size="sm" className="w-full">
                      Select Template
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <h2 className="text-xl font-semibold text-slate-900">
              Contract Details
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Using template: <span className="font-medium">{selectedBlueprint.name}</span>
            </p>
          </CardHeader>
          <CardBody className="space-y-6">
            <Input
              label="Contract Name"
              value={contractName}
              onChange={(e) => setContractName(e.target.value)}
              placeholder="Enter contract name"
              required
              helperText="Give this contract a unique name to identify it"
            />

            <div className="flex items-center gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => setSelectedBlueprint(null)}
                className="flex-1"
              >
                Change Template
              </Button>
              <Button
                onClick={handleCreate}
                isLoading={isCreating}
                className="flex-1"
              >
                Create Contract
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
