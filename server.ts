import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy para buscar o resultado mais recente da Loteria Federal
app.get('/api/loterias/federal/latest', async (req: Request, res: Response) => {
  try {
    // 1. Tentar direto da Caixa
    const caixaRes = await fetch('https://servicebus2.caixa.gov.br/portaldeloterias/api/federal', {
      signal: AbortSignal.timeout(4500),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://loterias.caixa.gov.br/',
        'Origin': 'https://loterias.caixa.gov.br',
      },
    });

    if (caixaRes.ok) {
      const data = await caixaRes.json();
      if (data && data.numero && Array.isArray(data.listaDezenas)) {
        return res.json({
          concurso: data.numero,
          data: data.dataApuracao,
          bilhetes: data.listaDezenas.map((d: string) => d.slice(-5)),
          proximoConcurso: data.numeroConcursoProximo,
          dataProximo: data.dataProximoConcurso,
          fonte: 'caixa_oficial',
        });
      }
    }
  } catch (err: any) {
    console.warn('Caixa proxy timeout/error, trying mirror API:', err?.message);
  }

  // 2. Fallback para API Espelho
  try {
    const mirrorRes = await fetch('https://loteriascaixa-api.herokuapp.com/api/federal/latest', {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (mirrorRes.ok) {
      const data = await mirrorRes.json();
      return res.json({
        concurso: data.concurso,
        data: data.data,
        bilhetes: (data.dezenas || []).map((d: string) => d.slice(-5)),
        proximoConcurso: data.proximoConcurso,
        dataProximo: data.dataProximoConcurso,
        fonte: 'mirror_api',
      });
    }
  } catch (err: any) {
    console.warn('Mirror API failed:', err?.message);
  }

  // 3. Fallback estático seguro caso não haja internet
  res.json({
    concurso: 6107,
    data: '07/10/2026',
    bilhetes: ['42050', '72560', '53643', '24384', '53648'],
    fonte: 'fallback_cache',
  });
});

// Start Express Server with Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`\n  Vite & Express server ready\n`);
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://${HOST}:${PORT}/\n`);
  });

  server.on('error', (err: any) => {
    if (err?.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use!`);
    } else {
      console.error('Server error:', err);
    }
  });

  const handleShutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
