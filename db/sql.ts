import {getClient} from './client.mjs';
import type {InValue} from '@libsql/client';
/** Parameterized SQL adapter used by account/session queries. */
export const sqlDb={prepare(sql:string){
 let args:InValue[]=[];
 const statement={
  bind(...values:InValue[]){args=values;return statement},
  async run(){return getClient().execute({sql,args})},
  async first<T=Record<string,unknown>>():Promise<T|null>{
   const result=await getClient().execute({sql,args});
   return (result.rows[0] as unknown as T)||null;
  },
 };
 return statement;
}};
