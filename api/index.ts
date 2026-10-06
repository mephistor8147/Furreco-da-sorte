// furreco da sorte - Universal Vercel API Gateway
import { fetchLiveFederalContests } from '../src/services/caixaFetcher';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const count = Math.min(Math.max(parseInt(req.query?.count, 10) || 20, 1), 50);
    const force = req.query?.force === 'true';
    const result = await fetchLiveFederalContests(count, force);

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err: any) {
    const fallback = await fetchLiveFederalContests(20, false);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(fallback));
  }
}
