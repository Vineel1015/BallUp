import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth';
import { prisma } from '../lib/prisma';
import { 
  validateRegister, 
  validateLogin, 
  handleValidationErrors 
} from '../middleware/validation';
import { logAuth, logError, logSecurity } from '../utils/logger';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

router.post('/register', 
  authLimiter,
  validateRegister,
  handleValidationErrors,
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      logSecurity('Registration attempt with existing credentials', {
        attemptedEmail: email,
        attemptedUsername: username,
        existingField: existingUser.email === email ? 'email' : 'username',
        ip: req.ip,
      });
      return res.status(400).json({ error: 'User with this email or username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        skillLevel: 'beginner',
      }
    });

    const token = generateToken({ id: user.id, email: user.email });

    logAuth('register', user.id, req.ip);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        skillLevel: user.skillLevel,
        preferredPosition: user.preferredPosition,
        bio: user.bio,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    logError('Registration error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', 
  authLimiter,
  validateLogin,
  handleValidationErrors,
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      logSecurity('Login attempt with non-existent email', {
        attemptedEmail: email,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      logSecurity('Login attempt with invalid password', {
        userId: user.id,
        email: user.email,
        ip: req.ip,
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: user.id, email: user.email });

    logAuth('login', user.id, req.ip);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        skillLevel: user.skillLevel,
        preferredPosition: user.preferredPosition,
        bio: user.bio,
        isVerified: user.isVerified,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      token,
    });
  } catch (error) {
    logError('Login error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;