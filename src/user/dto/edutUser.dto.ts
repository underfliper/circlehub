import { Gender } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class EditUserProfileDto {
  @IsString()
  @IsOptional()
  firstname?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}

export class EditUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsOptional()
  profile?: EditUserProfileDto;
}
