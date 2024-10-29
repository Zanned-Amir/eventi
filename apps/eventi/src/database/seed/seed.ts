import dbConfig from '../../config/db.seed.config';
import { runSeeders, SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './main.seeder';
import { DataSource, DataSourceOptions } from 'typeorm';

console.log('Seeding database...');

const options: DataSourceOptions & SeederOptions = {
  ...dbConfig(),
  seeds: [MainSeeder],
};

const datasource = new DataSource(options);

datasource
  .initialize()
  .then(async () => {
    await datasource.synchronize(true);
    await runSeeders(datasource);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  });
