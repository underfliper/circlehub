import { Module } from '@nestjs/common';
import { RepostService } from './repost.service';
import { RepostController } from './repost.controller';

@Module({
  providers: [RepostService],
  controllers: [RepostController]
})
export class RepostModule {}
