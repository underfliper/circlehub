import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [HttpModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
