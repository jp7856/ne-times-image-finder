const https = require('https');

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      console.log('Unsplash status:', res.statusCode);
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Unsplash response:', data.slice(0, 200));
        resolve(JSON.parse(data));
      });
    }).on('error', (e) => {
      console.log('Unsplash error:', e.message);
      reject(e);
    });
  });
}

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
    const body = JSON.parse(event.body);
    console.log('Received keywords:', body.keywords);
    console.log('UNSPLASH_KEY exists:', !!process.env.UNSPLASH_KEY);
    console.log('UNSPLASH_KEY length:', process.env.UNSPLASH_KEY?.length);

    const { keywords, count, orientation } = body;
    const UNSPLASH_KEY = process.env.UNSPLASH_KEY;
    const perKw = Math.ceil(count / keywords.length);
    const results = [];

    for (const kw of keywords) {
      const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(kw)}&per_page=${perKw}&orientation=${orientation}`;
      console.log('Fetching:', url);
      const data = await httpsGet(url, { Authorization: `Client-ID ${UNSPLASH_KEY}` });
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
    console.log('Error:', e.message);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
