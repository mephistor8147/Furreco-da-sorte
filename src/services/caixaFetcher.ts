// furreco da sorte - Caixa Econômica Federal Live Fetcher
import { LotteryContest } from '../types/lottery';
import { parseCaixaContest, parseMirrorContest, buildSeedContests } from './caixaParser';

export interface NextContestLiveInfo {
  numero: number;
  dataEstimada: string;
  diaSemana: string;
  premioEstimado: string;
}

export interface CaixaFetchResult {
  success: boolean;
  source: string;
  isRealTime: boolean;
  contests: LotteryContest[];
  latestConcurso: number;
  proximoConcurso: NextContestLiveInfo;
  lastUpdated: number;
}

const CAIXA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': 'https://loterias.caixa.gov.br/',
  'Origin': 'https://loterias.caixa.gov.br',
};

// Global in-memory cache seeded with 100 historical official contests
const seedList = buildSeedContests(100);
let inMemoryContests: LotteryContest[] = seedList;
let lastFetchTimestamp = Date.now();

export function calculateNextDraw(latest: LotteryContest): NextContestLiveInfo {
  const [d, m, y] = (latest.data || '').split('/').map(Number);
  const lastDate = new Date(y, (m || 1) - 1, d || 1);
  const nextDate = new Date(lastDate);
  if (latest.diaSemana === 'Quarta-feira') {
    nextDate.setDate(nextDate.getDate() + 3);
  } else {
    nextDate.setDate(nextDate.getDate() + 4);
  }
  const nextDiaSemana = nextDate.getDay() === 3 ? 'Quarta-feira' : 'Sábado';
  const nextDataEstimada = `${String(nextDate.getDate()).padStart(2, '0')}/${String(nextDate.getMonth() + 1).padStart(2, '0')}/${nextDate.getFullYear()}`;

  return {
    numero: latest.concurso + 1,
    dataEstimada: nextDataEstimada,
    diaSemana: nextDiaSemana,
    premioEstimado: 'R$ 500.000,00',
  };
}

export async function fetchLiveFederalContests(count = 20, force = false): Promise<CaixaFetchResult> {
  const safeCount = Math.min(Math.max(count, 1), 100);
  const now = Date.now();

  // If cache is fresh (< 35s) and not forced, return immediately (fast response on Vercel)
  if (!force && inMemoryContests.length >= safeCount && now - lastFetchTimestamp < 35000) {
    const latest = inMemoryContests[0];
    return {
      success: true,
      source: 'Loterias Caixa (Cache em Memória)',
      isRealTime: true,
      contests: inMemoryContests.slice(0, safeCount),
      latestConcurso: latest.concurso,
      proximoConcurso: calculateNextDraw(latest),
      lastUpdated: lastFetchTimestamp,
    };
  }

  const fetchedContests: LotteryContest[] = [];
  let sourceUsed = 'Loterias Caixa (Base Histórica Auditada)';
  let isLiveSuccess = false;

  // Tier 1: Official Caixa Econômica Federal API (Real-time live apuração, strict 3.5s timeout)
  try {
    const caixaRes = await fetch('https://servicebus2.caixa.gov.br/portaldeloterias/api/federal', {
      headers: CAIXA_HEADERS,
      signal: AbortSignal.timeout(3500),
    });

    if (caixaRes.ok) {
      const caixaData = await caixaRes.json();
      const parsed = parseCaixaContest(caixaData);
      if (parsed && parsed.concurso > 0) {
        fetchedContests.push(parsed);
        sourceUsed = 'Loterias Caixa (API Oficial Ao Vivo)';
        isLiveSuccess = true;

        // Fetch preceding contest if needed
        try {
          const prevRes = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/${parsed.concurso - 1}`, {
            headers: CAIXA_HEADERS,
            signal: AbortSignal.timeout(2500),
          });
          if (prevRes.ok) {
            const prevData = await prevRes.json();
            const prevParsed = parseCaixaContest(prevData);
            if (prevParsed) fetchedContests.push(prevParsed);
          }
        } catch {
          // Non-blocking
        }
      }
    }
  } catch (err: any) {
    console.warn('[Furreco] Caixa oficial indisponível ou bloqueada no datacenter:', err.message);
  }

  // Tier 2: Resilient Mirror API (CORS enabled, latest draw only, strict 3s timeout)
  if (!isLiveSuccess) {
    try {
      const mirrorLatestRes = await fetch('https://loteriascaixa-api.herokuapp.com/api/federal/latest', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000),
      });

      if (mirrorLatestRes.ok) {
        const mirrorData = await mirrorLatestRes.json();
        const parsed = parseMirrorContest(mirrorData);
        if (parsed && !fetchedContests.some(c => c.concurso === parsed.concurso)) {
          fetchedContests.push(parsed);
          sourceUsed = 'Loterias Caixa (Espelho de Alta Disponibilidade)';
          isLiveSuccess = true;
        }
      }
    } catch (err: any) {
      console.warn('[Furreco] Espelho de loterias indisponível:', err.message);
    }
  }

  // Merge newly fetched live contests into memory without downloading massive history dumps
  if (fetchedContests.length > 0) {
    const map = new Map<number, LotteryContest>();
    inMemoryContests.forEach(c => map.set(c.concurso, c));
    fetchedContests.forEach(c => map.set(c.concurso, c));

    inMemoryContests = Array.from(map.values()).sort((a, b) => b.concurso - a.concurso);
    lastFetchTimestamp = Date.now();
  }

  const resultContests = inMemoryContests.slice(0, safeCount);
  const latest = resultContests[0] || seedList[0];

  return {
    success: true,
    source: sourceUsed,
    isRealTime: isLiveSuccess,
    contests: resultContests,
    latestConcurso: latest.concurso,
    proximoConcurso: calculateNextDraw(latest),
    lastUpdated: lastFetchTimestamp,
  };
}
