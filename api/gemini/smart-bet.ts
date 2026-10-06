// furreco da sorte - Vercel Serverless Function for Gemini Smart Bet
import { generateGeminiSmartBet } from '../../src/services/geminiBetService';
import { fetchLiveFederalContests } from '../../src/services/caixaFetcher';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    let sampleSize: 20 | 50 | 100 = 50;
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const requested = parseInt(body.sampleSize || req.query?.sampleSize, 10);
    if (requested === 20 || requested === 50 || requested === 100) {
      sampleSize = requested;
    }

    // Load contests from body or from server cache
    let contests = Array.isArray(body.contests) && body.contests.length > 0 ? body.contests : [];
    if (contests.length < sampleSize) {
      const serverData = await fetchLiveFederalContests(sampleSize, false);
      contests = serverData.contests;
    }

    const result = await generateGeminiSmartBet(sampleSize, contests);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(result));
  } catch (err: any) {
    console.error('[API Gemini Smart Bet Error]:', err.message);
    const serverData = await fetchLiveFederalContests(50, false);
    const fallback = await generateGeminiSmartBet(50, serverData.contests);
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(fallback));
  }
}
