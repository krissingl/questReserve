import { sanityCheckDbConnection } from './db/db';
import app from './app';

async function main() {
  try {
    await sanityCheckDbConnection();
  } catch {
    console.error('DB sanity check failed. Exiting...');
    process.exit(1);
  }

  const PORT = process.env.PORT || 3001;

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

main();
