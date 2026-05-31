import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RecommendationLogDocument = HydratedDocument<RecommendationLog>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'recommendation_logs' })
export class RecommendationLog {
  @Prop({ type: Object, required: true })
  userPreferences!: Record<string, unknown>;

  @Prop({ type: [String], required: true })
  recommendedCars!: string[];

  createdAt?: Date;
}

export const RecommendationLogSchema = SchemaFactory.createForClass(RecommendationLog);
