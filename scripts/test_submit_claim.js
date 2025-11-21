const fs = require('fs');
const path = require('path');

async function main() {
  const token = process.argv[2];
  if (!token) {
    console.error('Usage: node scripts/test_submit_claim.js <JWT>');
    process.exit(1);
  }

  const filePath = path.join(__dirname, 'dummy.txt');
  if (!fs.existsSync(filePath)) {
    console.error('Missing dummy file at', filePath);
    process.exit(1);
  }

  const form = new (require('form-data'))();
  form.append('amount', '150.50');
  form.append('purpose', 'Tuition');
  form.append('description', 'Testing claim via node script');
  form.append('upi_id', 'test@upi');
  form.append('account_number', '1234567890');
  form.append('documents', fs.createReadStream(filePath));

  const res = await fetch('http://localhost:4000/api/claims', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // form.getHeaders() will be spread in node-fetch or form-data usage below
    },
    body: form,
  });

  console.log('STATUS', res.status);
  const text = await res.text();
  console.log('BODY', text);
}

main().catch((err) => {
  console.error('ERROR', err);
  process.exit(1);
});
