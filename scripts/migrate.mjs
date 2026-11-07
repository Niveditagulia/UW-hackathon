import {config} from 'dotenv';
import {mkdir,readFile,readdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {getClient} from '../db/client.mjs';
config({path:'.env.local'});config();
const url=process.env.TURSO_DATABASE_URL||'file:.data/grove.db';
if(url.startsWith('file:'))await mkdir(dirname(resolve(url.slice(5))),{recursive:true});
const client=getClient();
try{
 await client.execute('CREATE TABLE IF NOT EXISTS grove_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
 // Recognize migrated local D1 copies without replaying their SQL.
 const old=await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='d1_migrations'");
 if(old.rows.length){
  const applied=await client.execute('SELECT name FROM d1_migrations');
  for(const row of applied.rows)await client.execute({sql:'INSERT OR IGNORE INTO grove_migrations VALUES (?,?)',args:[row.name,new Date().toISOString()]});
 }
 for(const name of (await readdir('drizzle')).filter(x=>x.endsWith('.sql')).sort()){
  const tx=await client.transaction('write');
  try{
   if((await tx.execute({sql:'SELECT name FROM grove_migrations WHERE name=?',args:[name]})).rows.length){await tx.rollback();continue}
   const sql=await readFile('drizzle/'+name,'utf8');
   for(const statement of sql.split(';').map(s=>s.replace(/--> statement-breakpoint/g,'').trim()).filter(Boolean))await tx.execute(statement);
   await tx.execute({sql:'INSERT INTO grove_migrations VALUES (?,?)',args:[name,new Date().toISOString()]});
   await tx.commit();console.log('Applied '+name);
  }catch(error){await tx.rollback();throw error}finally{tx.close()}
 }
 console.log('Database ready.');
}finally{client.close()}
