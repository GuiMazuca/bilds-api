import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import { ConversationController } from './conversation/conversation.controller';
import { ConversationModule } from './conversation/conversation.module';
import { MessagesModule } from './messages/messages.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    MessagesModule,
    ConversationModule,
  ],
  controllers: [AppController, ConversationController],
  providers: [AppService],
})
export class AppModule {}
