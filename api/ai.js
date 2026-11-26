/* =========================================================
   /ai  —  GET  ?q=text   (browser direct)
           POST { text }  (UI se, optional)
   Returns:
   {
     "creator": "c9muzamil 😈🇵🇰",
     "Team":    "RedXhackers",
     "Contect": "923130122643",
     "Reponse": "…answer…"
   }
   ========================================================= */

export default async function handler(req, res) {
  /* ── CORS ── */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  /* ── meta block (har response mein same) ── */
  const meta = {
    creator: 'c9muzamil 😈🇵🇰',
    Team:    'RedXhackers',
    Contect: '923130122643'
  };

  try {
    /* ── text nikalna ── */
    let text = '';
    if (req.method === 'GET') {
      text = String(req.query?.q || req.query?.text || '').trim();
    } else if (req.method === 'POST') {
      text = String(req.body?.text || req.body?.q || '').trim();
    } else {
      return res.status(405).json({ ...meta, Reponse: 'Only GET / POST allowed' });
    }

    if (!text) {
      return res.status(400).json({ ...meta, Reponse: 'Missing ?q= parameter. Example: /ai?q=hello' });
    }

    /* ── upstream call ── */
    const UPSTREAM = 'https://llama.gtech-apiz.workers.dev/';
    const APIKEY   = process.env.LLAMA_API_KEY || 'Suhail';

    const url = new URL(UPSTREAM);
    url.searchParams.set('apikey', APIKEY);
    url.searchParams.set('text', text);

    const upstream = await fetch(url.toString(), {
      method: 'GET',
      signal: AbortSignal.timeout(25000)
    });

    if (!upstream.ok) {
      return res.status(502).json({ ...meta, Reponse: 'Upstream HTTP ' + upstream.status });
    }

    const data = await upstream.json();

    /* ── answer extract ── */
    const answer =
      data?.data?.choices?.[0]?.message?.content ||
      data?.data?.response ||
      data?.response ||
      '';

    if (!answer) {
      return res.status(502).json({ ...meta, Reponse: 'No answer from upstream' });
    }

    /* ── final response ── */
    return res.status(200).json({ ...meta, Reponse: answer });

  } catch (err) {
    return res.status(500).json({ ...meta, Reponse: 'Error: ' + err.message });
  }
  }
