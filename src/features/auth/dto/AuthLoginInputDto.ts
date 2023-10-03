import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';

export class AuthLoginInputDto {
  @IsNotEmptyString()
  loginOrEmail: string;

  @IsNotEmptyString()
  password: string;
}
