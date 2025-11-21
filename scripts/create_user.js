// Usage: node scripts/create_user.js <role> <email> <password> <fullName>
const { registerUser } = require('../src/services/authService');

async function main() {
  const [role, email, password, ...nameParts] = process.argv.slice(2);
  const fullName = nameParts.join(' ');
  if (!role || !email || !password || !fullName) {
    console.error('Usage: node scripts/create_user.js <role> <email> <password> <fullName>');
    process.exit(1);
  }
  try {
    const result = await registerUser({ fullName, email, password, role });
    console.log(`User created: ${result.user.email} (${result.user.role})`);
    console.log(`JWT: ${result.token}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
