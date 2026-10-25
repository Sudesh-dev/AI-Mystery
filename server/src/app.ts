import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { anonymousSession } from './middleware/session.js';
import { errorHandler, requestId } from './middleware/errors.js';
import { apiRouter } from './routes/api.js';

export const app=express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({origin:env.CLIENT_ORIGIN,credentials:true,methods:['GET','POST'],allowedHeaders:['Content-Type']}));
app.use(express.json({limit:'32kb'}));app.use(requestId);
app.get('/api/health',(_req,res)=>res.json({status:'ok'}));
app.use(anonymousSession);
app.use('/api/v1',apiRouter);
app.use((_req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'This route was not found.',requestId:res.locals.requestId}}));
app.use(errorHandler);
