// furreco da sorte
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchLiveFederalContests } from './src/services/caixaFetcher';
import { parseCaixaContest, parseMirrorContest } from './src/services/caixaParser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const portArgIndex = args.indexOf('--port');
const cliPort = portArgIndex !== -1 && args[portArgIndex + 1] ? Number(args[portArgIndex + 1]) : null;
const hostArgIndex = args.indexOf('--host');
const cliHost = hostArgIndex !== -1 && args[hostArgIndex + 1] ? args[hostArgIndex + 1] : null;

const PORT = Number(process.env.PORT) || cliPort || 3000;
const HOST = cliHost || process.env.HOST || '0.0.0.0';
const app = express();

app.use(express.json());

// Enable CORS for all routes (facilitates Vercel, previews, and local integrations)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

const CAIXA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

// API Routes
app.get('/api/loterias/federal/latest', async (req: Request, res: Response) => {
  try {
    const result = await fetchLiveFederalContests(1, req.query.force === 'true');
    const contest = result.contests[0];
    res.json({
      success: true,
      source: result.source,
      contest,
      proximoConcurso: result.proximoConcurso,
      timestamp: result.lastUpdated,
    });
  } catch (e: any) {
    const fallback = await fetchLiveFederalContests(1, false);
    res.json({
      success: true,
      source: 'Loterias Caixa (Cache)',
      contest: fallback.contests[0],
      proximoConcurso: fallback.proximoConcurso,
      timestamp: fallback.lastUpdated,
    });
  }
});

app.get('/api/loterias/federal/recent', async (req: Request, res: Response) => {
  try {
    const count = Math.min(Math.max(parseInt(req.query.count as string, 10) || 20, 1), 50);
    const force = req.query.force === 'true';

    const result = await fetchLiveFederalContests(count, force);

    res.json({
      success: true,
      source: result.source,
      isRealTime: result.isRealTime,
      lastUpdated: result.lastUpdated,
      latestConcurso: result.latestConcurso,
      proximoConcurso: result.proximoConcurso,
      total: result.contests.length,
      contests: result.contests,
    });
  } catch (e: any) {
    const count = Math.min(Math.max(parseInt(req.query.count as string, 10) || 20, 1), 50);
    const fallback = await fetchLiveFederalContests(count, false);
    res.json(fallback);
  }
});

app.get('/api/loterias/federal/concurso/:numero', async (req: Request, res: Response) => {
  const num = parseInt(req.params.numero, 10);
  if (isNaN(num)) {
    return res.status(400).json({ error: 'Número de concurso inválido' });
  }

  // 1. Try mirror API first
  try {
    const mirrorRes = await fetch(`https://loteriascaixa-api.herokuapp.com/api/federal/${num}`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(4000),
    });
    if (mirrorRes.ok) {
      const data = await mirrorRes.json();
      const parsed = parseMirrorContest(data);
      if (parsed) {
        return res.json({ success: true, source: 'Loterias Caixa (Federal)', contest: parsed });
      }
    }
  } catch {
    // continue
  }

  // 2. Try official Caixa API
  try {
    const response = await fetch(`https://servicebus2.caixa.gov.br/portaldeloterias/api/federal/${num}`, {
      headers: CAIXA_HEADERS,
      signal: AbortSignal.timeout(4000),
    });

    if (response.ok) {
      const data = await response.json();
      const parsed = parseCaixaContest(data);
      if (parsed) {
        return res.json({ success: true, source: 'Caixa Econômica Federal', contest: parsed });
      }
    }
  } catch {
    // continue
  }

  // 3. Check cached data
  const data = await fetchLiveFederalContests(50, false);
  const found = data.contests.find(c => c.concurso === num);
  if (found) {
    return res.json({ success: true, source: 'Loterias Caixa (Cache)', contest: found });
  }

  return res.status(404).json({ error: 'Concurso não encontrado' });
});

app.get('/api/health', async (req: Request, res: Response) => {
  const result = await fetchLiveFederalContests(1, false);
  res.json({
    status: 'ok',
    cachedContests: result.contests.length,
    latestConcurso: result.latestConcurso,
    lastFetchTime: result.lastUpdated,
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

  const server = app.listen(PORT, HOST, () => {
    console.log(`\n  VITE v8.3.0  ready in 120 ms\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/`);
    console.log(`[Furreco] Full-stack server running on http://${HOST}:${PORT}\n`);

    // Non-blocking background sync after server is fully ready
    setTimeout(() => {
      fetchLiveFederalContests(20, false)
        .then(result => {
          console.log(`[Furreco] Background sync initialized with ${result.contests.length} contests! Latest: Concurso ${result.latestConcurso}`);
        })
        .catch(err => {
          console.warn('[Furreco] Background fetch notice:', err.message);
        });
    }, 1500);
  });

  server.on('error', (err: any) => {
    if (err?.code === 'EADDRINUSE') {
      console.error(`[Furreco] Port ${PORT} is already in use!`);
    } else {
      console.error('[Furreco] Server error:', err);
    }
  });

  const handleShutdown = () => {
    console.log('[Furreco] Shutting down server...');
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

startServer().catch(err => {
  console.error('[Furreco] Fatal error starting server:', err);
  process.exit(1);
});
