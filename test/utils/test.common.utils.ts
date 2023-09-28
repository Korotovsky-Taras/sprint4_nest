export class TestCommonUtils {
  generateString(length = 20): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let string: string = '';
    for (let i = 0; i < length; i++) {
      string += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return string;
  }

  generateCredentials(loginLength = 8, passwordLength = 8): { login: string; password: string } {
    return { login: this.generateString(loginLength), password: this.generateString(passwordLength) };
  }

  wait(s: number): Promise<void> {
    return new Promise<void>((res) => {
      setTimeout(() => {
        res();
      }, s * 1000);
    });
  }
}

export const createCookie = (cookieObj: Object): string => {
  return Object.entries(cookieObj)
    .map(([name, value]) => {
      return name + '=' + value;
    })
    .join(';');
};
