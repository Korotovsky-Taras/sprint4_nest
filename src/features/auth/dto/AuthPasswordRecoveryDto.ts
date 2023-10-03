import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { IsEmail } from 'class-validator';

export class AuthPasswordRecoveryDto {
  @IsNotEmptyString()
  @IsEmail()
  email: string;
}
