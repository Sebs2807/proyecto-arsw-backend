import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

const sslConfig =
  process.env.DB_SSL === 'true'
    ? {
        ca: readFileSync(join(__dirname, '..', '..', 'certs', 'ca.pem')),
        rejectUnauthorized: true,
      }
    : undefined;

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, 'entities', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: process.env.NODE_ENV === 'local',
  ssl: sslConfig,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
