import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PostService } from './post.service';
import { PostController } from './post.controller';

@Module({
  imports: [HttpModule],
  providers: [PostService],
  controllers: [PostController],
})
export class PostModule {}
