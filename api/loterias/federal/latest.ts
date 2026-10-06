// furreco da sorte - Vercel Serverless Function
import { fetchLiveFederalContests } from '../../../src/services/caixaFetcher';

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
    const force = req.query?.force === 'true';
    const result = await fetchLiveFederalContests(1, force);
    const contest = result.contests[0];

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        source: result.source,
        contest,
        proximoConcurso: result.proximoConcurso,
        timestamp: result.lastUpdated,
      })
    );
  } catch (err: any) {
    const fallback = await fetchLiveFederalContests(1, false);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify({
        success: true,
        source: 'Loterias Caixa (Contingência)',
        contest: fallback.contests[0],
        proximoConcurso: fallback.proximoConcurso,
        timestamp: fallback.lastUpdated,
      })
    );
  }
}
