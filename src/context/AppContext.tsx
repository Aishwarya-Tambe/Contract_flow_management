import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import {
  Blueprint,
  BlueprintWithFields,
  Contract,
  ContractWithDetails,
} from '../types';
import { blueprintService } from '../services/blueprintService';
import { contractService } from '../services/contractService';

interface AppContextType {
  blueprints: Blueprint[];
  contracts: Contract[];
  isLoading: boolean;
  error: string | null;
  refreshBlueprints: () => Promise<void>;
  refreshContracts: () => Promise<void>;
  getBlueprint: (id: string) => Promise<BlueprintWithFields | null>;
  getContract: (id: string) => Promise<ContractWithDetails | null>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshBlueprints = useCallback(async () => {
    try {
      const data = await blueprintService.getAll();
      setBlueprints(data);
      setError(null);
    } catch (err) {
      setError('Failed to load blueprints');
      console.error(err);
    }
  }, []);

  const refreshContracts = useCallback(async () => {
    try {
      const data = await contractService.getAll();
      setContracts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load contracts');
      console.error(err);
    }
  }, []);

  const getBlueprint = useCallback(async (id: string) => {
    try {
      return await blueprintService.getById(id);
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  const getContract = useCallback(async (id: string) => {
    try {
      return await contractService.getById(id);
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([refreshBlueprints(), refreshContracts()]);
      setIsLoading(false);
    };

    loadInitialData();
  }, [refreshBlueprints, refreshContracts]);

  return (
    <AppContext.Provider
      value={{
        blueprints,
        contracts,
        isLoading,
        error,
        refreshBlueprints,
        refreshContracts,
        getBlueprint,
        getContract,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
