const http = require('http');

async function sendRequest(reqNum) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email: 'invalid_bruteforce@community.local', password: 'WrongPassword123!' });
    const req = http.request('http://localhost:4000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rate-limit-mode': 'production'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        resolve({
          reqNum,
          statusCode: res.statusCode,
          retryAfter: res.headers['retry-after'] || null,
          remaining: res.headers['x-ratelimit-remaining'] || null,
          limit: res.headers['x-ratelimit-limit'] || null
        });
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('--- RUN 1: CLEAN RATE LIMITER STATE (15 REQUESTS) ---');
  for (let i = 1; i <= 15; i++) {
    const res = await sendRequest(i);
    console.log(`Req #${String(res.reqNum).padStart(2)} -> HTTP ${res.statusCode} | Remaining: ${res.remaining ?? 'N/A'} | Retry-After: ${res.retryAfter ?? 'N/A'}`);
  }

  console.log('\n--- RUN 2: IMMEDIATELY AFTER WITHOUT RESTART (15 REQUESTS) ---');
  for (let i = 1; i <= 15; i++) {
    const res = await sendRequest(i);
    console.log(`Req #${String(res.reqNum).padStart(2)} -> HTTP ${res.statusCode} | Remaining: ${res.remaining ?? 'N/A'} | Retry-After: ${res.retryAfter ?? 'N/A'}`);
  }
}

main().catch(console.error);
