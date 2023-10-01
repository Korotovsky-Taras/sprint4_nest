import { Request } from 'express';

export function getRequestAuthorization(request: Request, title: string): string | null {
  const { authorization } = request.headers;

  if (!authorization) {
    return null;
  }

  const authorizationData = authorization.split(' ');
  if (authorizationData.length > 1 && authorizationData[0] === title) {
    return authorizationData[1];
  }

  return null;
}
