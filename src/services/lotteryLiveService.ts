import { useState, useEffect, useCallback } from 'react';
import { LotteryContest } from '../types/lottery';
import { LOTTERY_CONTESTS as FALLBACK_CONTESTS } from '../data/mockLotteryData';

const CACHE_STORAGE_KEY = 'furreco_caixa_live_contests_v2';
const LAST_SYNC_KEY = 'furreco_caixa_last_sync_timestamp';

export interface NextContestLiveInfo {
  numero: number;
  dataEstimada: string;
  diaSemana: string;
  premioEstimado: string;
}

export interface LiveLotteryState {
  contests: LotteryContest[];
  isLive: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  latestConcursoNumber: number;
  latestContest: LotteryContest | undefined;
  proximoConcurso: NextContestLiveInfo | null;
  syncNow: (force?: boolean) => Promise<void>;
}

// Load cached contests from localStorage if available
function getInitialContests(): LotteryContest[] {
  if (typeof window === 'undefined') return FALLBACK_CONTESTS;
  try {
    const saved = localStorage.getItem(CACHE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return FALLBACK_CONTESTS;
}

function getInitialSyncTime(): Date | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(LAST_SYNC_KEY);
    if (saved) {
      const parsed = new Date(parseInt(saved, 10));
      if (!isNaN(parsed.getTime())) return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export function useLiveLotteryContests(): LiveLotteryState {
  const [contests, setContests] = useState<LotteryContest[]>(getInitialContests);
  const [isLive, setIsLive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(CACHE_STORAGE_KEY);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(getInitialSyncTime);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [proximoConcurso, setProximoConcurso] = useState<NextContestLiveInfo | null>(null);

  const syncNow = useCallback(async (force = true) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const url = `/api/loterias/federal/recent?count=20&force=${force ? 'true' : 'false'}`;
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`Servidor respondeu com status ${res.status}`);
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.contests) && data.contests.length > 0) {
        setContests(data.contests);
        setIsLive(true);
        if (data.proximoConcurso) {
          setProximoConcurso(data.proximoConcurso);
        }
        const now = new Date();
        setLastSyncTime(now);

        try {
          localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(data.contests));
          localStorage.setItem(LAST_SYNC_KEY, now.getTime().toString());
        } catch {
          // ignore localStorage errors
        }
      } else {
        throw new Error(data.error || 'Dados da Caixa indisponíveis no momento');
      }
    } catch (err: any) {
      console.warn('[Furreco] Erro ao sincronizar com a Caixa Econômica:', err.message);
      setSyncError(err.message || 'Não foi possível contatar a Caixa no momento');
      // If we don't have contests yet, keep fallback
      if (contests.length === 0) {
        setContests(FALLBACK_CONTESTS);
      }
    } finally {
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [contests.length]);

  // Initial fetch on mount
  useEffect(() => {
    syncNow(false);

    // Auto-refresh every 60 seconds for true real-time updates
    const interval = setInterval(() => {
      syncNow(false);
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [syncNow]);

  const latestConcursoNumber = contests.length > 0 ? contests[0].concurso : 0;
  const latestContest = contests.length > 0 ? contests[0] : undefined;

  return {
    contests,
    isLive,
    isLoading,
    isSyncing,
    lastSyncTime,
    syncError,
    latestConcursoNumber,
    latestContest,
    proximoConcurso,
    syncNow,
  };
}
