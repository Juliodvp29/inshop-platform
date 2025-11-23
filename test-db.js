const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  // password: 'postgres123',  // ← COMENTAR ESTO
  database: 'auth_db',
});

client
  .connect()
  .then(() => {
    console.log('✅ Connected successfully!');
    return client.query('SELECT version()');
  })
  .then((res) => {
    console.log('📦 PostgreSQL version:', res.rows[0].version);
    return client.query('SELECT current_database()');
  })
  .then((res) => {
    console.log('🗄️  Current database:', res.rows[0].current_database);
    return client.end();
  })
  .then(() => {
    console.log('✅ Test completed successfully!');
  })
  .catch((err) => {
    console.error('❌ Error:', err.message);
  });