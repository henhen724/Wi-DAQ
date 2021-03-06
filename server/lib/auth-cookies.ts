import { serialize, parse } from 'cookie';
import { sessionExpTime } from '../models/User';

const TOKEN_NAME = 'wi_daq_token';

export function setTokenCookie(res: any, token: string) {
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: sessionExpTime,
    expires: new Date(Date.now() + sessionExpTime),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  })

  res.setHeader('Set-Cookie', cookie)
}

export function removeTokenCookie(res: any) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  })

  res.setHeader('Set-Cookie', cookie)
}

export function parseCookies(req: any): undefined | { [key: string]: string } {
  // For API Routes we don't need to parse the cookies.
  if (req.cookies) return req!.cookies;
  // For pages we do need to parse the cookies.
  const cookie = req.headers.cookie;
  try {
    return parse(cookie || '');
  } catch (err) {
    console.log(err);
    return
  }
}

export function getTokenCookie(req: any): undefined | string {
  const cookies = parseCookies(req);
  if (!cookies) return
  return cookies[TOKEN_NAME];
}
