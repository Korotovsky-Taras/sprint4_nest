import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX, PASSWORD_MIN } from './dto.variables';
import { IsPassConfirmationCodeValid } from '../../../application/decorators/validation/IsPassConfirmationCodeValid';

export class AuthNewPasswordDto {
  @IsNotEmptyString()
  @MinLength(PASSWORD_MIN)
  @MaxLength(PASSWORD_MAX)
  newPassword: string;

  @IsPassConfirmationCodeValid()
  @IsNotEmptyString()
  recoveryCode: string;
}
