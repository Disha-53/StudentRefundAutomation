const http = require('http');
const url = 'http://localhost:4000/pages/admin.html';
http.get(url, (res) => {
  console.log('STATUS', res.statusCode);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { console.log('LENGTH', data.length); });
}).on('error', (err) => {
  console.error('ERR', err.message);
  process.exit(1);
});
