import { useState } from 'react';
import { Plus, FileText, Edit, Trash2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Blueprint } from '../types';
import { Button } from './ui/Button';
import { Card, CardBody, CardHeader } from './ui/Card';
import { EmptyState } from './ui/EmptyState';
import { Modal, ModalFooter } from './ui/Modal';
import { blueprintService } from '../services/blueprintService';
import { formatDate } from '../utils/formatters';

interface BlueprintListProps {
  onCreateBlueprint: () => void;
  onEditBlueprint: (blueprint: Blueprint) => void;
}

export const BlueprintList = ({
  onCreateBlueprint,
  onEditBlueprint,
}: BlueprintListProps) => {
  const { blueprints, refreshBlueprints } = useApp();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    blueprint: Blueprint | null;
  }>({ isOpen: false, blueprint: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteModal.blueprint) return;

    setIsDeleting(true);
    try {
      await blueprintService.delete(deleteModal.blueprint.id);
      await refreshBlueprints();
      setDeleteModal({ isOpen: false, blueprint: null });
    } catch (error) {
      console.error('Error deleting blueprint:', error);
      alert('Failed to delete blueprint. It may be in use by existing contracts.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Blueprint Templates
          </h1>
          <p className="text-slate-600 mt-1">
            Create and manage reusable contract templates
          </p>
        </div>
        <Button onClick={onCreateBlueprint} size="lg">
          <Plus className="w-5 h-5" />
          New Blueprint
        </Button>
      </div>

      {blueprints.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FileText className="w-8 h-8 text-slate-400" />}
              title="No blueprints yet"
              description="Create your first blueprint template to start generating contracts"
              action={
                <Button onClick={onCreateBlueprint}>
                  <Plus className="w-4 h-4" />
                  Create Blueprint
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blueprints.map((blueprint, index) => (
            <Card
              key={blueprint.id}
              hover
              className="animate-in fade-in slide-in-from-bottom-4 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
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

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditBlueprint(blueprint)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      setDeleteModal({ isOpen: true, blueprint })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, blueprint: null })}
        title="Delete Blueprint"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-red-700 mt-1">
                Deleting this blueprint will prevent new contracts from being
                created from it. Existing contracts will not be affected.
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">
              {deleteModal.blueprint?.name}
            </span>
            ?
          </p>
        </div>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => setDeleteModal({ isOpen: false, blueprint: null })}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete Blueprint
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
