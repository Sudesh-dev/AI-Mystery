import mongoose, { Schema } from 'mongoose';

const MysteryCaseSchema = new Schema({
  publicId: { type: String, required: true, unique: true, index: true }, ownerSessionId: { type: String, required: true, index: true },
  status: { type: String, enum: ['generating','ready','completed','failed'], default: 'generating', index: true },
  generationStage: { type: String, default: 'blueprint' }, slowGeneration: { type: Boolean, default: false }, demoMode: { type: Boolean, default: false }, fallbackReason: { type: String, default: null }, input: { type: Schema.Types.Mixed, required: true },
  publicCase: { type: Schema.Types.Mixed, default: null },
  solution: { type: Schema.Types.Mixed, select: false, default: null },
  privateAnnotations: { type: Schema.Types.Mixed, select: false, default: null },
  mediaAssets: { type: [Schema.Types.Mixed], default: [] },
  accusation: { type: Schema.Types.Mixed, default: null }, failureCode: { type: String, default: null }, failureStage: { type: String, default: null },
  expiresAt: { type: Date, index: true },
}, { timestamps: true, minimize: false });
MysteryCaseSchema.index({ ownerSessionId: 1, createdAt: -1 });
export const MysteryCaseModel = mongoose.models.MysteryCase || mongoose.model('MysteryCase', MysteryCaseSchema);
