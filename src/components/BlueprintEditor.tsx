import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  Type,
  Calendar,
  Edit3,
  CheckSquare,
  GripVertical,
} from 'lucide-react';
import { Blueprint, BlueprintField, FieldType } from '../types';
import { Button } from './ui/Button';
import { Card, CardBody, CardHeader } from './ui/Card';
import { Input, Textarea, Select } from './ui/Input';
import { Modal, ModalFooter } from './ui/Modal';
import { blueprintService } from '../services/blueprintService';

interface BlueprintEditorProps {
  blueprint?: Blueprint;
  onBack: () => void;
  onSave: () => void;
}

export const BlueprintEditor = ({
  blueprint,
  onBack,
  onSave,
}: BlueprintEditorProps) => {
  const [name, setName] = useState(blueprint?.name || '');
  const [description, setDescription] = useState(blueprint?.description || '');
  const [fields, setFields] = useState<BlueprintField[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingFields, setIsLoadingFields] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingField, setEditingField] = useState<BlueprintField | null>(null);

  useEffect(() => {
    if (blueprint) {
      loadFields();
    }
  }, [blueprint]);

  const loadFields = async () => {
    if (!blueprint) return;

    setIsLoadingFields(true);
    try {
      const loadedFields = await blueprintService.getFields(blueprint.id);
      setFields(loadedFields);
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setIsLoadingFields(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter a blueprint name');
      return;
    }

    setIsSaving(true);
    try {
      if (blueprint) {
        await blueprintService.update(blueprint.id, { name, description });
      } else {
        await blueprintService.create(name, description);
      }
      onSave();
    } catch (error) {
      console.error('Error saving blueprint:', error);
      alert('Failed to save blueprint');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddField = () => {
    setEditingField(null);
    setShowFieldModal(true);
  };

  const handleEditField = (field: BlueprintField) => {
    setEditingField(field);
    setShowFieldModal(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field?')) return;

    try {
      await blueprintService.deleteField(fieldId);
      setFields(fields.filter((f) => f.id !== fieldId));
    } catch (error) {
      console.error('Error deleting field:', error);
      alert('Failed to delete field');
    }
  };

  const handleFieldSaved = async (field: BlueprintField) => {
    if (editingField) {
      setFields(fields.map((f) => (f.id === field.id ? field : f)));
    } else {
      setFields([...fields, field]);
    }
    setShowFieldModal(false);
    setEditingField(null);
  };

  const getFieldIcon = (type: FieldType) => {
    switch (type) {
      case 'text':
        return <Type className="w-4 h-4" />;
      case 'date':
        return <Calendar className="w-4 h-4" />;
      case 'signature':
        return <Edit3 className="w-4 h-4" />;
      case 'checkbox':
        return <CheckSquare className="w-4 h-4" />;
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
            {blueprint ? 'Edit Blueprint' : 'Create Blueprint'}
          </h1>
          <p className="text-slate-600 mt-1">
            {blueprint
              ? 'Modify your contract template'
              : 'Design a new contract template'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">
                Blueprint Details
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Blueprint Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Employment Contract"
                required
              />

              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this blueprint..."
                rows={4}
              />

              <Button onClick={handleSave} isLoading={isSaving} className="w-full">
                <Save className="w-4 h-4" />
                {blueprint ? 'Update Blueprint' : 'Create Blueprint'}
              </Button>
            </CardBody>
          </Card>

          {blueprint && (
            <Card>
              <CardHeader className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Fields</h2>
                <Button size="sm" onClick={handleAddField}>
                  <Plus className="w-4 h-4" />
                  Add Field
                </Button>
              </CardHeader>
              <CardBody>
                {isLoadingFields ? (
                  <p className="text-sm text-slate-500">Loading fields...</p>
                ) : fields.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500 mb-4">
                      No fields added yet
                    </p>
                    <Button size="sm" onClick={handleAddField}>
                      <Plus className="w-4 h-4" />
                      Add First Field
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fields.map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors group"
                      >
                        <GripVertical className="w-4 h-4 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {getFieldIcon(field.field_type)}
                            <span className="text-sm font-medium text-slate-900 truncate">
                              {field.label}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {field.field_type}
                            {field.required && ' • Required'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditField(field)}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteField(field.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <h2 className="text-lg font-semibold text-slate-900">
                Preview
              </h2>
            </CardHeader>
            <CardBody className="relative bg-slate-50 h-[calc(100%-72px)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-slate-500">
                    Blueprint preview
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {fields.length} field{fields.length !== 1 ? 's' : ''}{' '}
                    configured
                  </p>
                </div>
              </div>

              {fields.map((field) => (
                <div
                  key={field.id}
                  className="absolute bg-white border-2 border-blue-400 rounded-lg p-3 shadow-sm cursor-move hover:shadow-md transition-shadow"
                  style={{
                    left: field.position_x,
                    top: field.position_y,
                    width: field.width,
                    minHeight: field.height,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getFieldIcon(field.field_type)}
                    <span className="text-xs font-medium text-slate-700">
                      {field.label}
                    </span>
                    {field.required && (
                      <span className="text-red-500 text-xs">*</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {field.field_type}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {blueprint && showFieldModal && (
        <FieldEditorModal
          blueprintId={blueprint.id}
          field={editingField}
          existingFields={fields}
          onSave={handleFieldSaved}
          onClose={() => {
            setShowFieldModal(false);
            setEditingField(null);
          }}
        />
      )}
    </div>
  );
};

interface FieldEditorModalProps {
  blueprintId: string;
  field: BlueprintField | null;
  existingFields: BlueprintField[];
  onSave: (field: BlueprintField) => void;
  onClose: () => void;
}

const FieldEditorModal = ({
  blueprintId,
  field,
  existingFields,
  onSave,
  onClose,
}: FieldEditorModalProps) => {
  const [fieldType, setFieldType] = useState<FieldType>(
    field?.field_type || 'text'
  );
  const [label, setLabel] = useState(field?.label || '');
  const [required, setRequired] = useState(field?.required || false);
  const [placeholder, setPlaceholder] = useState(field?.placeholder || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!label.trim()) {
      alert('Please enter a field label');
      return;
    }

    setIsSaving(true);
    try {
      const orderIndex = field?.order_index ?? existingFields.length;
      const positionY = field?.position_y ?? existingFields.length * 80 + 20;

      if (field) {
        const updated = await blueprintService.updateField(field.id, {
          field_type: fieldType,
          label,
          required,
          placeholder,
        });
        onSave(updated);
      } else {
        const created = await blueprintService.addField(blueprintId, {
          field_type: fieldType,
          label,
          required,
          placeholder,
          position_x: 20,
          position_y: positionY,
          width: 300,
          height: 40,
          order_index: orderIndex,
        });
        onSave(created);
      }
    } catch (error) {
      console.error('Error saving field:', error);
      alert('Failed to save field');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={field ? 'Edit Field' : 'Add Field'}
      size="sm"
    >
      <div className="space-y-4">
        <Select
          label="Field Type"
          value={fieldType}
          onChange={(e) => setFieldType(e.target.value as FieldType)}
          options={[
            { value: 'text', label: 'Text' },
            { value: 'date', label: 'Date' },
            { value: 'signature', label: 'Signature' },
            { value: 'checkbox', label: 'Checkbox' },
          ]}
          required
        />

        <Input
          label="Field Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., Full Name"
          required
        />

        {(fieldType === 'text' || fieldType === 'date') && (
          <Input
            label="Placeholder"
            value={placeholder}
            onChange={(e) => setPlaceholder(e.target.value)}
            placeholder="Optional placeholder text"
          />
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="required"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="required" className="text-sm text-slate-700">
            Required field
          </label>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          {field ? 'Update Field' : 'Add Field'}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
