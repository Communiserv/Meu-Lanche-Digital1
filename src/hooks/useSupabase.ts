import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

export function useSupabase<T extends keyof Tables>(table: T) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (query?: { column: string; value: any }[]) => {
    setLoading(true);
    setError(null);
    try {
      let queryBuilder = supabase.from(table).select('*');
      
      if (query) {
        query.forEach(({ column, value }) => {
          queryBuilder = queryBuilder.eq(column, value);
        });
      }

      const { data, error: fetchError } = await queryBuilder;
      
      if (fetchError) throw fetchError;
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [table]);

  const insert = useCallback(async (data: Tables[T]['Insert']) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: insertError } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (insertError) throw insertError;
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [table]);

  const update = useCallback(async (id: string, data: Partial<Tables[T]['Update']>) => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [table]);

  const remove = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [table]);

  return {
    loading,
    error,
    fetch,
    insert,
    update,
    remove,
  };
} 