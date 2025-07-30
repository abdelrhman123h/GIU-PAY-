import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://ewalletuser:Abood1234@ewallet-db.rjqospn.mongodb.net/'), // or Atlas URI
    AuthModule,
    WalletModule,
  ],
})
export class AppModule {}
