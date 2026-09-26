import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json());

// Animals configuration
const ANIMAL_NAMES = [
  'Avestruz', 'Águia', 'Burro', 'Borboleta', 'Cachorro',
  'Cabra', 'Carneiro', 'Camelo', 'Cobra', 'Coelho',
  'Cavalo', 'Elefante', 'Galo', 'Gato', 'Jacaré',
  'Leão', 'Macaco', 'Porco', 'Pavão', 'Peru',
  'Touro', 'Tigre', 'Urso', 'Veado', 'Vaca',
];

const ANIMAL_EMOJIS = [
  '🦤', '🦅', '🫏', '🦋', '🐕',
  '🐐', '🐏', '🐪', '🐍', '🐇',
  '🐎', '🐘', '🐓', '🐈', '🐊',
  '🦁', '🐒', '🐖', '🦚', '🦃',
  '🐂', '🐅', '🐻', '🦌', '🐄',
];

function getAnimalByDezena(dezenaStr: string) {
  let d = parseInt(dezenaStr.slice(-2), 10);
  if (isNaN(d)) d = 0;
  let groupIndex = 24; // Vaca (00)
  if (d > 0) {
    groupIndex = Math.min(Math.max(Math.ceil(d / 4) - 1, 0), 24);
  }
  const grupo = groupIndex + 1;
  const start = grupo === 25 ? 97 : (grupo - 1) * 4 + 1;
  const dezenas = grupo === 25
    ? ['97', '98', '99', '00']
    : [
        start.toString().padStart(2, '0'),
        (start + 1).toString().padStart(2, '0'),
        (start + 2).toString().padStart(2, '0'),
        (start + 3).toString().padStart(2, '0'),
      ];

  return {
    grupo,
    nome: ANIMAL_NAMES[groupIndex],
    emoji: ANIMAL_EMOJIS[groupIndex],
    dezenas,
  };
}

interface ParsedContest {
  concurso: number;
  data: string;
  diaSemana: 'Quarta-feira' | 'Sábado';
  premios: {
    ordem: number;
    bilhete: string;
    valorPremio: number;
  }[];
  local: string;
  acumulou: boolean;
  bichoPrincipal: {
    grupo: number;
    nome: string;
    emoji: string;
    dezenas: string[];
  };
  todosBichos: {
    grupo: number;
    nome: string;
    emoji: string;
    dezenas: string[];
  }[];
  arrecadacaoTotal: number;
}

function parseCaixaContest(data: any): ParsedContest | null {
  if (!data || !data.numero) return null;

  const [day, month, year] = (data.dataApuracao || '').split('/').map(Number);
  const dateObj = new Date(year, (month || 1) - 1, day || 1);
  const daysOfWeek = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const diaSemana = (daysOfWeek[dateObj.getDay()] || 'Sábado') as 'Quarta-feira' | 'Sábado';

  const rawDezenas = data.listaDezenas || data.dezenasSorteadasOrdemSorteio || [];
  const rateio = data.listaRateioPremio || [];
  const defaultPrizes = [500000, 35000, 30000, 25000, 20363];

  const premios = rawDezenas.slice(0, 5).map((d: string, index: number) => {
    // Ticket formatted to 5 digits (00000-99999)
    const bilhete = (d || '').toString().slice(-5).padStart(5, '0');
    const rateioItem = rateio.find((r: any) => r.faixa === index + 1);
    const valorPremio = rateioItem?.valorPremio ? Number(rateioItem.valorPremio) : defaultPrizes[index];
    return {
      ordem: index + 1,
      bilhete,
      valorPremio,
    };
  });

  const p1Ticket = premios[0]?.bilhete || '00000';
  const bichoPrincipal = getAnimalByDezena(p1Ticket.slice(-2));
  const todosBichos = premios.map((p: any) => getAnimalByDezena(p.bilhete.slice(-2)));

  return {
    concurso: Number(data.numero),
    data: data.dataApuracao || '',
    diaSemana,
    premios,
    local: `${data.localSorteio || 'Espaço da Sorte'}, ${data.nomeMunicipioUFSorteio || 'São Paulo, SP'}`.trim(),
    acumulou: Boolean(data.acumulado),
    bichoPrincipal,
    todosBichos,
    arrecadacaoTotal: Number(data.valorArrecadado) || 4200000,
  };
}

// In-memory cache for live Caixa lottery data
interface NextContestInfo {
  numero: number;
  dataEstimada: string;
  diaSemana: string;
  premioEstimado: string;
}

interface ContestCache {
  contests: ParsedContest[];
  lastFetchTime: number;
  latestConcurso: number;
  proximoConcurso: NextContestInfo | null;
  isUpdating: boolean;
}

const cache: ContestCache = {
  contests: [],
  lastFetchTime: 0,
  latestConcurso: 0,
  proximoConcurso: null,
  isUpdating: false,
};

const CAIXA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
};

// Fetch real-time Caixa contests with concurrency
async function fetchCaixaFederalContests(count = 20, force = false): Promise<ParsedContest[]> {
  const now = Date.now();
  // Return cache if valid (60-second TTL) and not forced
  if (!force && cache.contests.length >= count && now - cache.lastFetchTime < 60000) {
    return cache.contests.slice(0, count);
  }

  if (cache.isUpdating && cache.contests.length > 0) {
    return cache.contests.slice(0, count);
  }

  cache.isUpdating = true;

  try {
    // 1. Fetch latest contest
    const latestRes = await fetch('https://servicebus2.caixa.gov.br/portaldeloterias/api/federal', {
      headers: CAIXA_HEADERS,
      signal: AbortSignal.timeout(8000),
    });

    if (!latestRes.ok) {
      throw new Error(`Caixa API returned HTTP ${latestRes.status}`);
    }

    const latestData = await latestRes.json();
    const parsedLatest = parseCaixaContest(latestData);

    if (!parsedLatest) {
      throw new Error('Failed to parse latest Caixa contest');
    }

    const latestNum = parsedLatest.concurso;
    cache.latestConcurso = latestNum;

    // Calculate real-time next draw data dynamically from Caixa apuração
    const nextConcursoNum = Number(latestData.numeroConcursoProximo) || (parsedLatest.concurso + 1);
    const [d, m, y] = (parsedLatest.data || '').split('/').map(Number);
    const lastDate = new Date(y, (m || 1) - 1, d || 1);
    const nextDate = new Date(lastDate);
    if (parsedLatest.diaSemana === 'Quarta-feira') {
      nextDate.setDate(nextDate.getDate() + 3); // next draw is Saturday
    } else {
      nextDate.setDate(nextDate.getDate() + 4); // next draw is Wednesday
    }
    const nextDiaSemana = nextDate.getDay() === 3 ? 'Quarta-feira' : 'Sábado';
    const nextDataEstimada = `${String(nextDate.getDate()).padStart(2, '0')}/${String(nextDate.getMonth() + 1).padStart(2, '0')}/${nextDate.getFullYear()}`;
    const valorEstimado = Number(latestData.valorEstimadoProximoConcurso);
    const nextPremioEstimado = valorEstimado > 0
      ? `R$ ${valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      : 'R$ 500.000,00';

    cache.proximoConcurso = {
      numero: nextConcursoNum,
      dataEstimada: latestData.dataProximoConcurso || nextDataEstimada,
      diaSemana: nextDiaSemana,
      premioEstimado: nextPremioEstimado,
    };

    // 2. Fetch past contests in batches
    const neededNumbers: number[] = [];
    for (let i = 1; i < count; i++) {
      const num = latestNum - i;
      // Check if we already have it in cache
      const existing = cache.contests.find(c => c.concurso === num);
      if (!existing) {
        neededNumbers.push(num);
      }
    }

    const fetchSingle = async (n: number): Promise<ParsedContest | null> => {
      try {
        const res = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/${n}`, {
          headers: CAIXA_HEADERS,
          signal: AbortSignal.timeout(6000),
        });
        if (res.ok) {
          const d = await res.json();
          return parseCaixaContest(d);
        }
      } catch {
        // ignore single failures
      }
      return null;
    };

    // Fetch in parallel chunks of 5
    const fetchedResults: (ParsedContest | null)[] = [];
    const chunkSize = 5;
    for (let i = 0; i < neededNumbers.length; i += chunkSize) {
      const chunk = neededNumbers.slice(i, i + chunkSize);
      const res = await Promise.all(chunk.map(fetchSingle));
      fetchedResults.push(...res);
    }

    // Merge latest, existing cache, and newly fetched
    const contestMap = new Map<number, ParsedContest>();
    contestMap.set(parsedLatest.concurso, parsedLatest);

    cache.contests.forEach(c => contestMap.set(c.concurso, c));
    fetchedResults.filter((c): c is ParsedContest => c !== null).forEach(c => contestMap.set(c.concurso, c));

    // Sort descending by contest number
    const sorted = Array.from(contestMap.values()).sort((a, b) => b.concurso - a.concurso);

    cache.contests = sorted;
    cache.lastFetchTime = Date.now();

    return cache.contests.slice(0, count);
  } catch (err: any) {
    console.error('Error fetching live Caixa contests:', err?.message || err);
    if (cache.contests.length > 0) {
      return cache.contests.slice(0, count);
    }
    throw err;
  } finally {
    cache.isUpdating = false;
  }
}

// API Routes
app.get('/api/loterias/federal/latest', async (req: Request, res: Response) => {
  try {
    const contests = await fetchCaixaFederalContests(1, req.query.force === 'true');
    if (contests.length > 0) {
      res.json({
        success: true,
        source: 'Caixa Econômica Federal',
        contest: contests[0],
        proximoConcurso: cache.proximoConcurso,
        timestamp: cache.lastFetchTime,
      });
    } else {
      res.status(500).json({ success: false, error: 'No contest data available' });
    }
  } catch (e: any) {
    res.status(502).json({ success: false, error: e.message || 'Caixa API unavailable' });
  }
});

app.get('/api/loterias/federal/recent', async (req: Request, res: Response) => {
  try {
    const count = Math.min(Math.max(parseInt(req.query.count as string, 10) || 20, 1), 50);
    const force = req.query.force === 'true';

    const contests = await fetchCaixaFederalContests(count, force);

    res.json({
      success: true,
      source: 'Caixa Econômica Federal (Loterias)',
      isRealTime: true,
      lastUpdated: cache.lastFetchTime,
      latestConcurso: cache.latestConcurso,
      proximoConcurso: cache.proximoConcurso,
      total: contests.length,
      contests,
    });
  } catch (e: any) {
    res.status(502).json({
      success: false,
      error: e.message || 'Erro ao sincronizar com Loterias Caixa',
      cachedContestsAvailable: cache.contests.length > 0,
      contests: cache.contests,
    });
  }
});

app.get('/api/loterias/federal/concurso/:numero', async (req: Request, res: Response) => {
  const num = parseInt(req.params.numero, 10);
  if (isNaN(num)) {
    return res.status(400).json({ error: 'Número de concurso inválido' });
  }

  // Check cache first
  const existing = cache.contests.find(c => c.concurso === num);
  if (existing) {
    return res.json({ success: true, source: 'cache', contest: existing });
  }

  try {
    const response = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/${num}`, {
      headers: CAIXA_HEADERS,
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const data = await response.json();
      const parsed = parseCaixaContest(data);
      if (parsed) {
        cache.contests.push(parsed);
        cache.contests.sort((a, b) => b.concurso - a.concurso);
        return res.json({ success: true, source: 'Caixa Econômica Federal', contest: parsed });
      }
    }
    return res.status(404).json({ error: 'Concurso não encontrado' });
  } catch (err: any) {
    return res.status(502).json({ error: err.message || 'Erro ao buscar concurso da Caixa' });
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    cachedContests: cache.contests.length,
    latestConcurso: cache.latestConcurso,
    lastFetchTime: cache.lastFetchTime,
  });
});

// Start Express Server with Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    // Serve production static build
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // In development: mount Vite dev server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Furreco] Full-stack server running on http://0.0.0.0:${PORT}`);

    // Pre-fetch live Caixa contests in background upon start
    fetchCaixaFederalContests(20, true)
      .then(contests => {
        console.log(`[Furreco] Pre-fetched ${contests.length} live contests from Caixa Econômica Federal! Latest: Concurso ${cache.latestConcurso}`);
      })
      .catch(err => {
        console.warn('[Furreco] Initial background fetch from Caixa had an issue:', err.message);
      });
  });
}

startServer();
