import { supabase } from '../lib/supabase';
import { Blueprint, BlueprintField, BlueprintWithFields } from '../types';

export const blueprintService = {
  async getAll(): Promise<Blueprint[]> {
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<BlueprintWithFields | null> {
    const { data: blueprint, error: blueprintError } = await supabase
      .from('blueprints')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (blueprintError) throw blueprintError;
    if (!blueprint) return null;

    const { data: fields, error: fieldsError } = await supabase
      .from('blueprint_fields')
      .select('*')
      .eq('blueprint_id', id)
      .order('order_index', { ascending: true });

    if (fieldsError) throw fieldsError;

    return {
      ...blueprint,
      fields: fields || [],
    };
  },

  async create(name: string, description?: string): Promise<Blueprint> {
    const { data, error } = await supabase
      .from('blueprints')
      .insert({ name, description })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    id: string,
    updates: Partial<Blueprint>
  ): Promise<Blueprint> {
    const { data, error } = await supabase
      .from('blueprints')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('blueprints')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async addField(
    blueprintId: string,
    field: Omit<BlueprintField, 'id' | 'blueprint_id' | 'created_at'>
  ): Promise<BlueprintField> {
    const { data, error } = await supabase
      .from('blueprint_fields')
      .insert({
        blueprint_id: blueprintId,
        ...field,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateField(
    fieldId: string,
    updates: Partial<BlueprintField>
  ): Promise<BlueprintField> {
    const { data, error } = await supabase
      .from('blueprint_fields')
      .update(updates)
      .eq('id', fieldId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteField(fieldId: string): Promise<void> {
    const { error } = await supabase
      .from('blueprint_fields')
      .delete()
      .eq('id', fieldId);

    if (error) throw error;
  },

  async getFields(blueprintId: string): Promise<BlueprintField[]> {
    const { data, error } = await supabase
      .from('blueprint_fields')
      .select('*')
      .eq('blueprint_id', blueprintId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
