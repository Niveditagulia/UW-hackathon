import {drizzle} from 'drizzle-orm/libsql';
import {getClient} from './client.mjs';
import * as schema from './schema';
export function getDb(){return drizzle(getClient(),{schema})}
