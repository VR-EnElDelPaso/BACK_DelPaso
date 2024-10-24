import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, tourId: string): string => {
  const secretKey = process.env.JWT_SECRET as string;
  const payload = { userId, tourId };

  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
};