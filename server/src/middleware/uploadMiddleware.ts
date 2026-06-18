import multer from 'multer';
import path from 'path';

export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    }),
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png/;
        const valid = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
        valid ? cb(null, true) : cb(new Error('Only jpeg, jpg, png images are allowed'));
    }
});
