import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';

@Module({
  imports: [HttpModule],
  providers: [CommentService],
  controllers: [CommentController],
})
export class CommentModule {}
