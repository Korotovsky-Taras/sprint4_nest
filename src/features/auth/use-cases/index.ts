import { AuthLoginCase } from './auth-login.case';
import { AuthLogoutCase } from './auth-logout.case';
import { AuthRefreshTokensCase } from './auth-refresh-tokens.case';
import { AuthCreateUserWithCodeCase } from './auth-create-user-with-code.case';
import { AuthVerifyRegistrationCodeCase } from './auth-verify-registration-code.case';
import { AuthRecoverPasswordWithCodeCase } from './auth-recover-password-with-code.case';
import { AuthResendConfirmationCodeCase } from './auth-resend-cofirmation-code';
import { AuthResendPassConfirmationCodeCase } from './auth-resend-pass-cofirmation-code';

export const authCases = [
  AuthLoginCase,
  AuthLogoutCase,
  AuthRefreshTokensCase,
  AuthCreateUserWithCodeCase,
  AuthVerifyRegistrationCodeCase,
  AuthRecoverPasswordWithCodeCase,
  AuthResendConfirmationCodeCase,
  AuthResendPassConfirmationCodeCase,
];
