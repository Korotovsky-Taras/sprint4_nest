import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { IsEmail } from 'class-validator';
import { IsAuthEmailResendingValid } from '../../../application/decorators/validation/IsAuthEmailResendingValid';

export class AuthResendingEmailDto {
  @IsAuthEmailResendingValid()
  @IsNotEmptyString()
  @IsEmail()
  email: string;
}
