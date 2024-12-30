import { Router } from 'express';
import { upload } from "../middlewares/multer.middlewares";
import { deleteImage, uploadImage } from '../controllers/storage.controllers';

const router = Router();

router.post('/upload', upload.single('image'), uploadImage);
router.delete('/delete', deleteImage);

export default router;
