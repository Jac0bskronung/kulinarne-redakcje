import { useEffect, useState } from 'react';
import { db } from '@/lib/supabase';

export const useSupabase = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pobierz wydatki mieszkaniowe (housing expenses monthly data)
  const fetchHousingExpenses = async () => {
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
  };

  // Pobierz wydatki z życia (living expenses)
  const fetchLivingExpenses = async () => {
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
  };

  // Pobierz wiadomości AI (AI news)
  const fetchAiNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await db
        .from('ai_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12);

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Pobierz kategorie wydatków (expense categories)
  const fetchCategories = async () => {
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
  };

  return {
    db,
    loading,
    setLoading,
    error,
    setError,
    fetchHousingExpenses,
    fetchLivingExpenses,
    fetchAiNews,
    fetchCategories
  };
};
