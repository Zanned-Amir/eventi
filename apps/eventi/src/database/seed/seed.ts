import dbConfig from '../../config/db.seed.config';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './main.seeder';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { blue, green, red, yellow } from 'colorette'; // Import colorette colors

dotenv.config({ path: join(__dirname, '../../.env') });

const args = process.argv.slice(2);
const force = args.includes('-force');

console.log(blue('start main seeder'));

const options: DataSourceOptions & SeederOptions = {
  ...dbConfig(),
  seeds: [MainSeeder],
};

const datasource = new DataSource(options);

datasource
  .initialize()
  .then(async () => {
    console.log(yellow('Checking if the database has already been seeded...'));

    // Example query to check if the database is seeded
    const userAccountRepository = datasource.getRepository('user_account');
    const existingUsersCount = await userAccountRepository.count();

    if (existingUsersCount > 0 && !force) {
      console.log(
        red(
          'Database has already been seeded. Use the -force option to reseed.',
        ),
      );
      process.exit(0);
    }

    console.log(green('Synchronizing database...'));
    await datasource.synchronize(true);

    console.log(green('Running seeders...'));
    await runSeeders(datasource);

    console.log(green('Database seeding completed successfully.'));
    process.exit(0);
  })
  .catch((error) => {
    console.error(red('Error during seeding:'), error);
    process.exit(1);
  });
