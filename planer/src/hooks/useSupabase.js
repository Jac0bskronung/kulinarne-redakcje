import { useCallback, useState } from 'react';
import { db } from '@/lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHousingExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db
        .from('expenses')
        .select('*')
        .eq('category', 'Housing')
        .order('date', { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLivingExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db
        .from('expenses')
        .select('*')
        .neq('category', 'Housing')
        .order('date', { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAiNews = useCallback(async () => {
    try {
      const { data, error: err } = await db
        .from('digests')
        .select('ai_items, date, created_at')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1);

      if (err || !data || data.length === 0) return [];

      const items = data[0].ai_items || [];
      // Deduplicate by link
      const seen = new Set();
      return items.filter(item => {
        if (seen.has(item.link)) return false;
        seen.add(item.link);
        return true;
      });
    } catch {
      return [];
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== AUTH FOR REMONT =====

  const ensureAuth = useCallback(async () => {
    const { data: { session } } = await db.auth.getSession();
    if (session) return session;
    const { data, error: err } = await db.auth.signInWithPassword({
      email: 'test@finpulse.local',
      password: 'test123456',
    });
    if (err) {
      console.warn('Supabase auth failed:', err.message);
      return null;
    }
    return data.session;
  }, []);

  // ===== REMONT BUDGET FUNCTIONS =====

  const fetchBudgetConfig = useCallback(async () => {
    try {
      const { data, error: err } = await db
        .from('budget_config')
        .select('*')
        .limit(1);
      if (err) throw err;
      return data && data.length > 0 ? data[0] : null;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const updateBudgetConfig = useCallback(async (totalBudget, id) => {
    try {
      let query = db.from('budget_config').update({ total_budget: totalBudget });
      query = id != null ? query.eq('id', id) : query.not('id', 'is', null);
      const { data, error: err } = await query.select().limit(1);
      if (err) throw err;
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const fetchRooms = useCallback(async () => {
    try {
      const { data, error: err } = await db
        .from('rooms')
        .select('*')
        .order('sort_order', { ascending: true });
      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const fetchExpenseTypes = useCallback(async () => {
    try {
      const { data, error: err } = await db
        .from('expense_types')
        .select('*')
        .order('sort_order', { ascending: true });
      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const fetchKeywordHints = useCallback(async () => {
    try {
      const { data, error: err } = await db
        .from('keyword_hints')
        .select('*')
        .order('priority', { ascending: false });
      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const { data, error: err } = await db
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });
      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const createItem = useCallback(async (item) => {
    try {
      const { data, error: err } = await db
        .from('items')
        .insert(item)
        .select();
      if (err) throw err;
      return data ? data[0] : null;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const updateItem = useCallback(async (id, changes) => {
    try {
      const { data, error: err } = await db
        .from('items')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();
      if (err) throw err;
      return data ? data[0] : null;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, []);

  const deleteItem = useCallback(async (id) => {
    try {
      const { error: err } = await db
        .from('items')
        .delete()
        .eq('id', id);
      if (err) throw err;
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, []);

  // ===== HOUSING EXPENSES CRUD =====

  const createHousingExpense = useCallback(async (expense) => {
    // Form sends {description, amount, subcategory, date} — map to actual DB columns
    const { data, error: err } = await db
      .from('expenses')
      .insert({
        title: expense.description,
        amount: expense.amount,
        note: expense.subcategory,
        date: expense.date,
        category: 'Housing',
      })
      .select()
      .single();
    if (err) throw err;
    return data;
  }, []);

  const updateHousingExpense = useCallback(async (id, changes) => {
    const { data, error: err } = await db
      .from('expenses')
      .update({
        title: changes.description,
        amount: changes.amount,
        note: changes.subcategory,
        date: changes.date,
      })
      .eq('id', id)
      .select()
      .single();
    if (err) throw err;
    return data;
  }, []);

  const deleteHousingExpense = useCallback(async (id) => {
    const { error: err } = await db
      .from('expenses')
      .delete()
      .eq('id', id);
    if (err) throw err;
    return true;
  }, []);

  // ===== HOUSING CATEGORIES =====

  const fetchHousingCategories = useCallback(async () => {
    try {
      const { data, error: err } = await db
        .from('housing_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (err) throw err;
      return data || [];
    } catch {
      return [];
    }
  }, []);

  const createHousingCategory = useCallback(async (name) => {
    const { data, error: err } = await db
      .from('housing_categories')
      .insert({ name, is_custom: true })
      .select()
      .single();
    if (err) throw err;
    return data;
  }, []);

  return {
    db,
    loading,
    setLoading,
    error,
    setError,
    fetchHousingExpenses,
    fetchLivingExpenses,
    fetchAiNews,
    fetchCategories,
    fetchBudgetConfig,
    updateBudgetConfig,
    fetchRooms,
    fetchExpenseTypes,
    fetchKeywordHints,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    ensureAuth,
    createHousingExpense,
    updateHousingExpense,
    deleteHousingExpense,
    fetchHousingCategories,
    createHousingCategory,
  };
};
