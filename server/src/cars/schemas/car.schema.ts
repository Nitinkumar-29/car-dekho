import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CarDocument = HydratedDocument<Car>;

@Schema({ timestamps: true, collection: 'cars' })
export class Car {
  _id?: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  brand!: string;

  @Prop({ required: true })
  price!: number;

  @Prop({ required: true })
  fuelType!: string;

  @Prop({ required: true })
  mileage!: number;

  @Prop({ required: true, min: 0, max: 5 })
  safetyRating!: number;

  @Prop({ required: true })
  transmission!: string;

  @Prop({ required: true })
  familyFriendly!: boolean;
}

export const CarSchema = SchemaFactory.createForClass(Car);
