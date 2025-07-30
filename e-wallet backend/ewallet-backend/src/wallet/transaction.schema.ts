import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  type: 'add' | 'withdraw' | 'send' | 'receive';

  @Prop({ required: true })
  amount: number;

  @Prop()
  fromEmail?: string;

  @Prop()
  toEmail?: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);