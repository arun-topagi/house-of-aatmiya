const { execSync } = require('child_process');
const dotenv = require('dotenv');
const fs = require('fs');

const envFile = process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else {
  console.warn(`Warning: ${envFile} not found.`);
}

const args = process.argv.slice(2).join(' ');

const url = process.env.LIQUIBASE_URL;
const username = process.env.LIQUIBASE_USERNAME;
const password = process.env.LIQUIBASE_PASSWORD;

try {
  execSync(
    `npx liquibase --url="${url}" --username="${username}" --password="${password}" ${args}`,
    { stdio: 'inherit' },
  );
} catch (error) {
  process.exit(error.status || 1);
}
