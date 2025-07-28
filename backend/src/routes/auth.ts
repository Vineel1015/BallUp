import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth';

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

router.post('/register', async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = {
      id: 'temp-user-id',
      email,
      username,
      password: hashedPassword,
      profilePicture: null,
      skillLevel: 'beginner',
      preferredPosition: null,
      bio: null,
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const token = generateToken({ id: user.id, email: user.email });

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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const mockUser = {
      id: 'demo-user-id',
      email: 'demo@ballup.com',
      username: 'demo_user',
      password: await bcrypt.hash('password123', 12),
      profilePicture: null,
      skillLevel: 'intermediate',
      preferredPosition: 'Guard',
      bio: 'Love playing basketball!',
      isVerified: true,
      createdAt: '2024-07-20T12:00:00Z',
      updatedAt: '2024-07-28T12:00:00Z',
    };

    if (email !== mockUser.email) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, mockUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ id: mockUser.id, email: mockUser.email });

    res.json({
      message: 'Login successful',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        profilePicture: mockUser.profilePicture,
        skillLevel: mockUser.skillLevel,
        preferredPosition: mockUser.preferredPosition,
        bio: mockUser.bio,
        isVerified: mockUser.isVerified,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;