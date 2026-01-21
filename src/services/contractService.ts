import { supabase } from '../lib/supabase';
import {
  Contract,
  ContractFieldValue,
  ContractStatus,
  ContractWithDetails,
} from '../types';
import { canTransitionTo } from '../utils/contractLifecycle';

export const contractService = {
  async getAll(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<ContractWithDetails | null> {
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*, blueprints(*)')
      .eq('id', id)
      .maybeSingle();

    if (contractError) throw contractError;
    if (!contract) return null;

    const { data: fieldValues, error: valuesError } = await supabase
      .from('contract_field_values')
      .select('*')
      .eq('contract_id', id);

    if (valuesError) throw valuesError;

    const { blueprints, ...contractData } = contract;

    return {
      ...contractData,
      blueprint: Array.isArray(blueprints) ? blueprints[0] : blueprints,
      field_values: fieldValues || [],
    };
  },

  async create(
    blueprintId: string,
    name: string
  ): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert({
        blueprint_id: blueprintId,
        name,
        status: 'created',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateStatus(
    contractId: string,
    newStatus: ContractStatus
  ): Promise<Contract> {
    const { data: currentContract } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (!currentContract) {
      throw new Error('Contract not found');
    }

    if (!canTransitionTo(currentContract.status, newStatus)) {
      throw new Error(
        `Cannot transition from ${currentContract.status} to ${newStatus}`
      );
    }

    const updates: Record<string, unknown> = { status: newStatus };

    switch (newStatus) {
      case 'approved':
        updates.approved_at = new Date().toISOString();
        break;
      case 'sent':
        updates.sent_at = new Date().toISOString();
        break;
      case 'signed':
        updates.signed_at = new Date().toISOString();
        break;
      case 'locked':
        updates.locked_at = new Date().toISOString();
        break;
      case 'revoked':
        updates.revoked_at = new Date().toISOString();
        break;
    }

    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', contractId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFieldValue(
    contractId: string,
    blueprintFieldId: string,
    value: string
  ): Promise<ContractFieldValue> {
    const { data: existing } = await supabase
      .from('contract_field_values')
      .select('*')
      .eq('contract_id', contractId)
      .eq('blueprint_field_id', blueprintFieldId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('contract_field_values')
        .update({ value })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('contract_field_values')
        .insert({
          contract_id: contractId,
          blueprint_field_id: blueprintFieldId,
          value,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async getFieldValues(contractId: string): Promise<ContractFieldValue[]> {
    const { data, error } = await supabase
      .from('contract_field_values')
      .select('*')
      .eq('contract_id', contractId);

    if (error) throw error;
    return data || [];
  },

  async delete(contractId: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', contractId);

    if (error) throw error;
  },
};
