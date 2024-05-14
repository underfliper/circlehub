import { IsNotEmpty } from 'class-validator';
import { AuthDto } from './auth.dto';

export class RegisterDto extends AuthDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;
}
