import jwt from 'jsonwebtoken';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '14d' });
}
