import { DBSchema } from '@ngrx/db';

export const schema: DBSchema = {
  version: 1,
  name: 'cars_app',
  stores: {
    cars: {
      autoIncrement: false,
      primaryKey: 'key',
    },
  },
};
