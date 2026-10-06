// furreco da sorte
import { useState, useEffect, useCallback, useRef } from 'react';
import { LotteryContest } from '../types/lottery';
import { LOTTERY_CONTESTS as FALLBACK_CONTESTS } from '../data/mockLotteryData';
import { parseMirrorContest } from './caixaParser';

const CACHE_STORAGE_KEY = 'furreco_caixa_live_contests_v4';
const LAST_SYNC_KEY = 'furreco_caixa_last_sync_timestamp_v4';

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
  syncNow: (force?: boolean) => Promise<boolean>;
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
  const [proximoConcurso, setProximoConcurso] = useState<NextContestLiveInfo | null>(() => {
    const first = getInitialContests()[0];
    if (first) {
      const [d, m, y] = (first.data || '').split('/').map(Number);
      const dateObj = new Date(y, (m || 1) - 1, d || 1);
      dateObj.setDate(dateObj.getDate() + (first.diaSemana === 'Quarta-feira' ? 3 : 4));
      return {
        numero: first.concurso + 1,
        dataEstimada: `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`,
        diaSemana: dateObj.getDay() === 3 ? 'Quarta-feira' : 'Sábado',
        premioEstimado: 'R$ 500.000,00',
      };
    }
    return null;
  });

  // Stable refs to prevent infinite re-render / fetch loops
  const contestsRef = useRef<LotteryContest[]>(contests);
  contestsRef.current = contests;

  const isSyncInProgressRef = useRef<boolean>(false);

  const syncNow = useCallback(async (force = true): Promise<boolean> => {
    // Prevent overlapping concurrent syncs
    if (isSyncInProgressRef.current) {
      return false;
    }

    isSyncInProgressRef.current = true;
    setIsSyncing(true);

    let fetchedList: LotteryContest[] | null = null;
    let nextInfo: NextContestLiveInfo | null = null;

    try {
      // Tier 1: Local / Vercel Serverless Function Proxy (/api/loterias/federal/recent)
      try {
        const url = `/api/loterias/federal/recent?count=20&force=${force ? 'true' : 'false'}`;
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json' },
        });

        const contentType = res.headers.get('content-type') || '';
        // Ensure we received genuine JSON, not an HTML page from an SPA fallback rewrite
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && data.success && Array.isArray(data.contests) && data.contests.length > 0) {
            fetchedList = data.contests;
            if (data.proximoConcurso) {
              nextInfo = data.proximoConcurso;
            }
          }
        }
      } catch (err: any) {
        console.warn('[Furreco Sync] Tier 1 (/api) indisponível:', err.message);
      }

      // Tier 2: Direct High-Availability Public CORS API (Essential fallback for static hosting on Vercel)
      if (!fetchedList || fetchedList.length === 0) {
        try {
          const mirrorRes = await fetch('https://loteriascaixa-api.herokuapp.com/api/federal/latest', {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(6000),
          });

          if (mirrorRes.ok) {
            const mirrorData = await mirrorRes.json();
            const parsed = parseMirrorContest(mirrorData);
            if (parsed && parsed.concurso > 0) {
              const currentList = contestsRef.current;
              const map = new Map<number, LotteryContest>();
              currentList.forEach(c => map.set(c.concurso, c));
              FALLBACK_CONTESTS.forEach(c => map.set(c.concurso, c));
              map.set(parsed.concurso, parsed);

              fetchedList = Array.from(map.values()).sort((a, b) => b.concurso - a.concurso);

              const [d, m, y] = (parsed.data || '').split('/').map(Number);
              const dateObj = new Date(y, (m || 1) - 1, d || 1);
              dateObj.setDate(dateObj.getDate() + (parsed.diaSemana === 'Quarta-feira' ? 3 : 4));
              nextInfo = {
                numero: parsed.concurso + 1,
                dataEstimada: `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`,
                diaSemana: dateObj.getDay() === 3 ? 'Quarta-feira' : 'Sábado',
                premioEstimado: 'R$ 500.000,00',
              };
            }
          }
        } catch (err: any) {
          console.warn('[Furreco Sync] Tier 2 (Espelho CORS) indisponível:', err.message);
        }
      }

      // Tier 3: Apply results or preserve safe contingency
      if (fetchedList && fetchedList.length > 0) {
        setContests(fetchedList);
        setIsLive(true);
        setSyncError(null);
        if (nextInfo) {
          setProximoConcurso(nextInfo);
        }
        const now = new Date();
        setLastSyncTime(now);

        try {
          localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(fetchedList));
          localStorage.setItem(LAST_SYNC_KEY, now.getTime().toString());
        } catch {
          // ignore localStorage errors
        }

        return true;
      } else {
        if (contestsRef.current.length === 0) {
          setContests(FALLBACK_CONTESTS);
        }
        setSyncError('A Caixa Econômica está em manutenção ou o dispositivo está offline. Base em contingência ativa.');
        return false;
      }
    } finally {
      isSyncInProgressRef.current = false;
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, []); // Empty dependency array: perfectly stable identity, zero loop risk!

  // Initial fetch on mount & background auto-refresh every 60 seconds
  useEffect(() => {
    syncNow(false);

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
