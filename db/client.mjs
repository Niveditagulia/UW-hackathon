import {createClient} from '@libsql/client';
let client;
export function getClient(){
 if(client)return client;
 const url=process.env.TURSO_DATABASE_URL || (process.env.VERCEL ? '' : 'file:.data/grove.db');
 if(!url)throw new Error('Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel, then redeploy.');
 if(process.env.VERCEL && !/^libsql:\/\//.test(url))throw new Error('Vercel requires a hosted libsql:// database. Local files cannot persist there.');
 if(!url.startsWith('file:')&&!process.env.TURSO_AUTH_TOKEN)throw new Error('TURSO_AUTH_TOKEN is required for the hosted database.');
 client=createClient({url,authToken:process.env.TURSO_AUTH_TOKEN||undefined});
 return client;
}
