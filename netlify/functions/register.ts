export const config = { runtime: 'nodejs' };
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'
import { generateToken } from '../../utils/generateToken'

const register = async (req: any, res: any) => {
    // Устанавливаем CORS заголовки
    if (res && typeof res.setHeader === 'function') {
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    } else {
        // fallback
        res.writeHead(200, {
            'Access-Control-Allow-Origin': 'http://localhost:5173',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
    }

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
        return res.status(400).json({ error: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword }
    });

    const token = generateToken(user.id, res);

    res.status(201).json({
        status: "success",
        data: { user: { id: user.id, name, email }, token }
    });
};

// Экспортируем как handler для Netlify
export const handler = register;