import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { ResponseData } from '../types/ResponseData';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file || !req.file.buffer) {
      res.status(400).json({
        ok: false,
        message: 'No valid file provided',
      } as ResponseData);
      return;
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'muvi' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file?.buffer); // Aquí es donde usamos el buffer directamente
    });

    res.status(200).json({
      ok: true,
      message: 'Image uploaded successfully',
      data: {
        url: (result as any).secure_url,
      }
    } as ResponseData);
  } catch (error) {
    console.error('UploadImage error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to upload image',
      errors: error,
    } as ResponseData);
  }
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    const public_id = "muvi/" + url?.split('/').pop()?.split('.').shift();

    if (!public_id) {
      res.status(400).json({
        ok: false,
        message: 'No public_id provided',
      } as ResponseData);
      return;
    }

    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result === 'ok') {
      res.status(200).json({
        ok: true,
        message: 'Image deleted successfully',
      } as ResponseData);
    } else {
      res.status(404).json({
        ok: false,
        message: 'Failed to delete image',
        errors: result.result,
      } as ResponseData);
    }
  } catch (error) {
    console.error('DeleteImage error:', error);
    res.status(500).json({
      ok: false,
      message: 'Failed to delete image',
      errors: error,
    } as ResponseData);
  }
};