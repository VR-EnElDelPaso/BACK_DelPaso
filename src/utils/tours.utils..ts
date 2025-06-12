import jwt from 'jsonwebtoken';

export const generateTourAccessToken = (userId: string, tourId: string, orderId: string) => {
  const secretKey = process.env.JWT_SECRET as string;
  const payload = { userId, tourId, orderId };

  // 1 minute
  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
};
