-- Aggregated mood counts per day (avoids transferring every raw vote row to the client).
create or replace view public.mood_vote_counts_by_day as
select
  vote_date,
  mood,
  count(*)::bigint as vote_count
from public.mood_votes
group by vote_date, mood;

comment on view public.mood_vote_counts_by_day is
  'Per-day, per-mood vote totals for mood_votes.';

grant select on public.mood_vote_counts_by_day to anon, authenticated;
