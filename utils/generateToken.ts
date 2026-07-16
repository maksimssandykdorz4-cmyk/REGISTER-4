import jwt from 'jsonwebtoken';

// Генерирует JWT и возвращает строку токена
export const generateToken = (userId: number | string): string => {
  const payload = { id: userId };
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  return jwt.sign(payload, secret, { expiresIn });
};

// Создаёт строку для заголовка Set-Cookie
export const createCookieHeader = (token: string): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60; // 7 дней в секундах
  return `jwt=${token}; HttpOnly; Secure=${isProduction}; SameSite=Strict; Max-Age=${maxAge}; Path=/`;
};
