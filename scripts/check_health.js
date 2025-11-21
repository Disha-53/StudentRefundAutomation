const http = require('http');
http.get('http://localhost:4000/health', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log(data); });
}).on('error', (err) => {
  console.error('ERR', err.message);
  process.exit(1);
});
