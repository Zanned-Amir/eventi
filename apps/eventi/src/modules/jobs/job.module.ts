import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLoginData, UserTokens } from '../../database/entities/user';

@Module({
  imports: [TypeOrmModule.forFeature([UserTokens, UserLoginData])],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
