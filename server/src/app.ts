import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { anonymousSession } from './middleware/session.js';
import { errorHandler, requestId } from './middleware/errors.js';
import { apiRouter } from './routes/api.js';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const app=express();
app.disable('x-powered-by');
if(env.NODE_ENV==='production')app.set('trust proxy',1);
app.use(helmet({contentSecurityPolicy:{directives:{...helmet.contentSecurityPolicy.getDefaultDirectives(),'style-src':["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],'font-src':["'self'",'https://fonts.gstatic.com','data:']}}}));
app.use(cors({origin:env.CLIENT_ORIGIN,credentials:true,methods:['GET','POST'],allowedHeaders:['Content-Type']}));
app.use(express.json({limit:'32kb'}));app.use(requestId);
app.get('/api/health',(_req,res)=>res.json({status:'ok'}));
app.use(anonymousSession);
app.use('/api/v1',(_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
app.use('/api/v1',apiRouter);
if(env.NODE_ENV==='production'){
  const clientDist=resolve(dirname(fileURLToPath(import.meta.url)),'../../client/dist');
  app.use(express.static(clientDist,{index:false,maxAge:'1y',immutable:true}));
  app.get('*',(req,res,next)=>{
    if(req.path.startsWith('/api/'))return next();
    res.setHeader('Cache-Control','no-cache');
    return res.sendFile(resolve(clientDist,'index.html'));
  });
}
app.use((_req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'This route was not found.',requestId:res.locals.requestId}}));
app.use(errorHandler);
