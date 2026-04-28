exports.handler = async function(event) {
  const { keywords } = JSON.parse(event.body || '{}');
  const count = 9;
  const orientation = 'landscape';
  const UNSPLASH_KEY = process.env.UNSPLASH_KEY;

  if (!keywords || !keywords.length) {
    return { statusCode: 400, body: JSON.stringify({ error: 'keywords required' }) };
  }

  const results = [];
  for (const kw of keywords) {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(kw)}&per_page=${Math.ceil(count / keywords.length)}&orientation=${orientation}`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` }
    });
    const data = await res.json();
    (data.results || []).forEach(img => results.push(img));
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ images: results.slice(0, count) })
  };
};
