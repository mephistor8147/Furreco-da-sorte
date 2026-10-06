// furreco da sorte - Vercel Serverless Function
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      service: 'Furreco da Sorte API (Vercel)',
      timestamp: new Date().toISOString(),
    })
  );
}
