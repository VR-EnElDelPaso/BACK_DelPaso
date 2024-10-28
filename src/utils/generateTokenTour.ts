import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId: string, tourIds: string[]): string => {
  const secretKey = process.env.JWT_SECRET as string;
  const payload = { userId, tourIds };

  return jwt.sign(payload, secretKey, { expiresIn: '24h' });
};
