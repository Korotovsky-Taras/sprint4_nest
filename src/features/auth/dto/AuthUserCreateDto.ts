import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { LOGIN_MAX, LOGIN_MIN, PASSWORD_MAX, PASSWORD_MIN } from './dto.variables';

export class AuthUserCreateDto {
  @IsNotEmptyString()
  @MinLength(LOGIN_MIN)
  @MaxLength(LOGIN_MAX)
  login: string;

  @IsNotEmptyString()
  @IsEmail()
  email: string;

  @IsNotEmptyString()
  @MinLength(PASSWORD_MIN)
  @MaxLength(PASSWORD_MAX)
  password: string;
}
