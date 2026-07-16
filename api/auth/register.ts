export const config = { runtime: 'nodejs' };
import { prisma } from '../../lib/prisma'
import bcrypt from 'bcryptjs'
import { generateToken } from '../../utils/generateToken'

const register = async (req: any, res: any) => {
    
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173'); // или '*' для теста
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Если это preflight (OPTIONS) – завершаем запрос
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await prisma.user.findUnique({
        where: {email: email}
    });

    if (userExists) {
        return res.status(400).json({error: "User already exists with this email" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create User
    const user = await prisma.user.create({
        data: {
            name, 
            email,
            password: hashedPassword,
        }
    })

    // Generate JWT Token
    const token = generateToken(user.id, res)

    res.status(201).json({
        status: "success",
        data: {
            user: {
                id: user.id,
                name: name,
                email: email
            },
            token
        }
    })
}

export default register