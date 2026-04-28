exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { keywords, count, orientation } = JSON.parse(event.body);
    const UNSPLASH_KEY = process.env.UNSPLASH_KEY;
    const perKw = Math.ceil(count / keywords.length);
    const results = [];

    for (const kw of keywords) {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(kw)}&per_page=${perKw}&orientation=${orientation}`;
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
  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
