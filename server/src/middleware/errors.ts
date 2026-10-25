import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
export function requestId(req:Request,res:Response,next:NextFunction){const id=randomUUID();const started=Date.now();res.setHeader('X-Request-Id',id);res.locals.requestId=id;res.once('finish',()=>console.log(JSON.stringify({event:'api_request',requestId:id,method:req.method,status:res.statusCode,durationMs:Date.now()-started})));next();}
export function errorHandler(error:unknown,_req:Request,res:Response,_next:NextFunction){
  const requestId=String(res.locals.requestId||'unknown');
  console.error(JSON.stringify({event:'request_failed',requestId,code:'INTERNAL_ERROR'}));
  if(res.headersSent)return;
  res.status(500).json({error:{code:'INTERNAL_ERROR',message:'Something went wrong. Please try again.',requestId}});
}
