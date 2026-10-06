// furreco da sorte
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
};

// Global in-memory cache shared during server/serverless execution
const seedList = buildSeedContests();
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
  const now = Date.now();
  // If cache is fresh (< 45s) and not forced, return immediately
  if (!force && inMemoryContests.length >= count && now - lastFetchTimestamp < 45000) {
    const latest = inMemoryContests[0];
    return {
      success: true,
      source: 'Loterias Caixa (Cache em Memória)',
      isRealTime: true,
      contests: inMemoryContests.slice(0, count),
      latestConcurso: latest.concurso,
      proximoConcurso: calculateNextDraw(latest),
      lastUpdated: lastFetchTimestamp,
    };
  }

  const fetchedContests: LotteryContest[] = [];
  let sourceUsed = 'Loterias Caixa (Contingência)';
  let isLiveSuccess = false;

  // Tier 1: Official Caixa Econômica Federal API (Real-time live apuração)
  try {
    const caixaRes = await fetch('https://servicebus2.caixa.gov.br/portaldeloterias/api/federal', {
      headers: CAIXA_HEADERS,
      signal: AbortSignal.timeout(6500),
    });

    if (caixaRes.ok) {
      const caixaData = await caixaRes.json();
      const parsed = parseCaixaContest(caixaData);
      if (parsed && parsed.concurso > 0) {
        fetchedContests.push(parsed);
        sourceUsed = 'Loterias Caixa (API Oficial Ao Vivo)';
        isLiveSuccess = true;

        // Fetch preceding contest to keep depth
        try {
          const prevRes = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/${parsed.concurso - 1}`, {
            headers: CAIXA_HEADERS,
            signal: AbortSignal.timeout(4000),
          });
          if (prevRes.ok) {
            const prevData = await prevRes.json();
            const prevParsed = parseCaixaContest(prevData);
            if (prevParsed) fetchedContests.push(prevParsed);
          }
        } catch {
          // Ignore
        }
      }
    }
  } catch (err: any) {
    console.warn('[Furreco] Caixa oficial indisponível ou bloqueada no datacenter:', err.message);
  }

  // Tier 2: Resilient Mirror API (CORS enabled, highly available)
  try {
    const mirrorLatestRes = await fetch('https://loteriascaixa-api.herokuapp.com/api/federal/latest', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (mirrorLatestRes.ok) {
      const mirrorData = await mirrorLatestRes.json();
      const parsed = parseMirrorContest(mirrorData);
      if (parsed && !fetchedContests.some(c => c.concurso === parsed.concurso)) {
        fetchedContests.push(parsed);
        if (!isLiveSuccess) {
          sourceUsed = 'Loterias Caixa (Espelho de Alta Disponibilidade)';
          isLiveSuccess = true;
        }
      }
    }

    // If cache is shallower than requested count, pull top items from mirror list
    if (inMemoryContests.length < count) {
      const mirrorListRes = await fetch('https://loteriascaixa-api.herokuapp.com/api/federal', {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(7000),
      });

      if (mirrorListRes.ok) {
        const mirrorList = await mirrorListRes.json();
        if (Array.isArray(mirrorList)) {
          const parsedSlice = mirrorList
            .slice(0, count)
            .map(parseMirrorContest)
            .filter((c): c is LotteryContest => c !== null);

          parsedSlice.forEach(c => {
            if (!fetchedContests.some(f => f.concurso === c.concurso)) {
              fetchedContests.push(c);
            }
          });
        }
      }
    }
  } catch (err: any) {
    console.warn('[Furreco] Espelho de loterias falhou:', err.message);
  }

  // Merge and update in-memory cache
  if (fetchedContests.length > 0) {
    const map = new Map<number, LotteryContest>();
    inMemoryContests.forEach(c => map.set(c.concurso, c));
    fetchedContests.forEach(c => map.set(c.concurso, c));

    inMemoryContests = Array.from(map.values()).sort((a, b) => b.concurso - a.concurso);
    lastFetchTimestamp = Date.now();
  }

  const resultContests = inMemoryContests.slice(0, count);
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
