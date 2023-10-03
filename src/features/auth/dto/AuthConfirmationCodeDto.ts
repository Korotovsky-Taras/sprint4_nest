import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { IsAuthConfirmationCodeValid } from '../../../application/decorators/validation/IsAuthConfirmationCodeValid';

export class AuthConfirmationCodeDto {
  @IsAuthConfirmationCodeValid()
  @IsNotEmptyString()
  code: string;
}
