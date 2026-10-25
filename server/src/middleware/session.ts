import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

declare global { namespace Express { interface Request { sessionId: string } } }
const cookieName='mystery_session';
function signature(id:string){return createHmac('sha256',env.SESSION_SECRET).update(id).digest('base64url');}
function valid(token:string){const [id,sig]=token.split('.');if(!id||!sig)return null;const expected=Buffer.from(signature(id));const actual=Buffer.from(sig);return expected.length===actual.length&&timingSafeEqual(expected,actual)?id:null;}
export function anonymousSession(req:Request,res:Response,next:NextFunction){
  const cookies:Record<string,string>={};
  for(const part of (req.headers.cookie||'').split(';')){const index=part.indexOf('=');if(index>0){const name=part.slice(0,index).trim();const value=part.slice(index+1);try{cookies[decodeURIComponent(name)]=decodeURIComponent(value);}catch{continue;}}}
  let id=valid(cookies[cookieName]||'');
  if(!id){id=randomBytes(24).toString('base64url');const token=`${id}.${signature(id)}`;const flags=['Path=/','HttpOnly','SameSite=Lax','Max-Age=604800'];if(env.NODE_ENV==='production')flags.push('Secure');res.append('Set-Cookie',`${cookieName}=${encodeURIComponent(token)}; ${flags.join('; ')}`);}
  req.sessionId=id;next();
}
