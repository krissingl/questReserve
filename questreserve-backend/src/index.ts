import express from 'express';
import { sanityCheckDbConnection } from './db/db';

async function main() {
  try {
    await sanityCheckDbConnection();
  } catch {
    console.error('DB sanity check failed. Exiting...');
    process.exit(1);
  }

  const app = express();
  const PORT = process.env.PORT || 3001;

  app.use(express.json());
  app.get('/', (_req, res) => res.send('Ollo, Backend?'));

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();
