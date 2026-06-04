declare module 'jsonwebtoken' {
  export function sign(payload: string | object | Buffer, secretOrPrivateKey: string, options?: any): string;
  export function verify(token: string, secretOrPublicKey: string, options?: any): any;
  const jwt: {
    sign: typeof sign;
    verify: typeof verify;
  };
  export default jwt;
}
