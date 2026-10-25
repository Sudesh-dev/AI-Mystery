import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';

export type GeneratedAsset={bytes:Buffer;mimeType:string;provider:string;model:string};
export interface MediaProvider { generateImage(prompt:string):Promise<GeneratedAsset>;generateVideo(prompt:string):Promise<GeneratedAsset> }
export class GeminiMediaProvider implements MediaProvider {
  private readonly ai:GoogleGenAI;
  constructor(){if(!env.GEMINI_API_KEY)throw new Error('Media generation requires a Gemini key');this.ai=new GoogleGenAI({apiKey:env.GEMINI_API_KEY});}
  async generateImage(prompt:string):Promise<GeneratedAsset>{
    if(!env.GEMINI_IMAGE_MODEL)throw new Error('Image model is not configured');
    const interaction=await this.ai.interactions.create({model:env.GEMINI_IMAGE_MODEL,input:`Create a fictional evidence still for a detective puzzle. Synthetic artifact, no real people, no visible answer text. ${prompt}`,response_format:{type:'image',mime_type:'image/png',aspect_ratio:'4:3',image_size:'1K'}});
    const data=interaction.output_image?.data;if(!data)throw new Error('Image output unavailable');
    return {bytes:Buffer.from(data,'base64'),mimeType:'image/png',provider:'Gemini',model:env.GEMINI_IMAGE_MODEL};
  }
  async generateVideo(prompt:string):Promise<GeneratedAsset>{
    if(!env.GEMINI_VIDEO_MODEL)throw new Error('Video model is not configured');
    const interaction=await this.ai.interactions.create({model:env.GEMINI_VIDEO_MODEL,input:`Create a short fictional CCTV-style case clue. Static security camera, subdued low-light realism, no identifiable faces, no text that reveals a culprit. ${prompt}`,response_format:{type:'video',aspect_ratio:'16:9',resolution:'720p'}});
    const data=interaction.output_video?.data;if(!data)throw new Error('Video output unavailable');
    return {bytes:Buffer.from(data,'base64'),mimeType:'video/mp4',provider:'Gemini',model:env.GEMINI_VIDEO_MODEL};
  }
}
