import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { BlueprintList } from './components/BlueprintList';
import { BlueprintEditor } from './components/BlueprintEditor';
import { ContractCreator } from './components/ContractCreator';
import { ContractViewer } from './components/ContractViewer';
import { LoadingPage } from './components/ui/LoadingSpinner';
import { Blueprint, Contract } from './types';

type View =
  | 'dashboard'
  | 'blueprints'
  | 'create-blueprint'
  | 'edit-blueprint'
  | 'create-contract'
  | 'view-contract';

function AppContent() {
  const { isLoading, refreshBlueprints, refreshContracts } = useApp();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint | null>(
    null
  );
  const [selectedContractId, setSelectedContractId] = useState<string | null>(
    null
  );

  const handleNavigate = (view: View) => {
    setCurrentView(view);
    setSelectedBlueprint(null);
    setSelectedContractId(null);
  };

  const handleCreateBlueprint = () => {
    setSelectedBlueprint(null);
    setCurrentView('create-blueprint');
  };

  const handleEditBlueprint = (blueprint: Blueprint) => {
    setSelectedBlueprint(blueprint);
    setCurrentView('edit-blueprint');
  };

  const handleBlueprintSaved = async () => {
    await refreshBlueprints();
    setCurrentView('blueprints');
  };

  const handleCreateContract = () => {
    setCurrentView('create-contract');
  };

  const handleContractCreated = (contractId: string) => {
    setSelectedContractId(contractId);
    setCurrentView('view-contract');
  };

  const handleViewContract = (contract: Contract) => {
    setSelectedContractId(contract.id);
    setCurrentView('view-contract');
  };

  const handleContractUpdated = async () => {
    await refreshContracts();
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <Layout
      currentView={
        currentView === 'create-blueprint' || currentView === 'edit-blueprint'
          ? 'blueprints'
          : currentView === 'create-contract' || currentView === 'view-contract'
          ? 'dashboard'
          : currentView
      }
      onNavigate={handleNavigate}
    >
      {currentView === 'dashboard' && (
        <Dashboard
          onViewContract={handleViewContract}
          onCreateContract={handleCreateContract}
        />
      )}

      {currentView === 'blueprints' && (
        <BlueprintList
          onCreateBlueprint={handleCreateBlueprint}
          onEditBlueprint={handleEditBlueprint}
        />
      )}

      {(currentView === 'create-blueprint' ||
        currentView === 'edit-blueprint') && (
        <BlueprintEditor
          blueprint={selectedBlueprint || undefined}
          onBack={() => setCurrentView('blueprints')}
          onSave={handleBlueprintSaved}
        />
      )}

      {currentView === 'create-contract' && (
        <ContractCreator
          onBack={() => setCurrentView('dashboard')}
          onContractCreated={handleContractCreated}
        />
      )}

      {currentView === 'view-contract' && selectedContractId && (
        <ContractViewer
          contractId={selectedContractId}
          onBack={() => setCurrentView('dashboard')}
          onUpdate={handleContractUpdated}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
