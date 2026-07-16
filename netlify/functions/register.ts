export const config = { runtime: 'nodejs' };

import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import { generateToken, createCookieHeader } from '../../utils/generateToken';

// Главный обработчик для Netlify
export default async (request: Request) => {
  // Настройка CORS заголовков (общие для всех ответов)
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Обработка preflight (OPTIONS)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204, // No Content
      headers: corsHeaders,
    });
  }

  // Только POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // Парсим тело запроса
  const { name, email, password } = await request.json();

  // Основная логика (без изменений)
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    return new Response(
      JSON.stringify({ error: 'User already exists with this email' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  // Генерируем токен (передаём только userId)
  const token = generateToken(user.id);

  // Формируем заголовок Set-Cookie
  const cookieHeader = createCookieHeader(token);

  // Ответ с токеном и cookie
  return new Response(
    JSON.stringify({
      status: 'success',
      data: {
        user: { id: user.id, name, email },
        token, // можно оставить для клиента
      },
    }),
    {
      status: 201,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Set-Cookie': cookieHeader,
      },
    }
  );
};