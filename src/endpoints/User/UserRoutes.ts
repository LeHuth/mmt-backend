import express, { Request, Response } from 'express';
import UserController from "../User/UserController"
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import UserModel from './UserModel';

const router = express.Router();

// POST request um user zu registrieren
router.post("/user/registration", UserController.registration);

// POST /users/login
router.post(
  '/user/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req: Request, res: Response) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Authenticate user
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid email or password' });
      }

      // Generate JWT
      const payload = {
        user: {
          id: user.id
        }
      };

      try {
        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
        res.json({
          token,
          user: {
            id: user.id,
            name: user.username,
            email: user.email
          }
        });
      } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

export default router;