-- Fix: votes persist but totals disappear after refresh when RLS allows INSERT on
-- mood_votes but blocks SELECT. PostgREST aggregates and views then return empty
-- sets (no error). This function runs as SECURITY DEFINER so it can aggregate all
-- rows for a given date while exposing only per-mood counts (no row contents).

CREATE OR REPLACE FUNCTION public.get_mood_vote_counts_for_day(p_vote_date date)
RETURNS TABLE(mood text, vote_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT mv.mood::text, count(*)::bigint AS vote_count
  FROM public.mood_votes mv
  WHERE mv.vote_date = p_vote_date
  GROUP BY mv.mood;
$$;

REVOKE ALL ON FUNCTION public.get_mood_vote_counts_for_day(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_mood_vote_counts_for_day(date) TO anon, authenticated;
