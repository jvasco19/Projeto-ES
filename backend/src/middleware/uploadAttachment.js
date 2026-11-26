import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { HttpError } from '../utils/HttpError.js';
import { error } from 'node:console';

// pasta onde ficam os ficheiros (relativamente à pasta backend)
export const UPLOAD_DIR = path.resolve('uploads');
fs.mkdirSync(UPLOAD_DIR, {recursive: true});

// tipos permitidos
const ALLOWED_TYPES = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'application/pdf': '.pdf',
    'text/plain': '.txt',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
}

const upload = multer({
    storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, cb) => cb(null, crypto.randomUUID() + ALLOWED_TYPES[file.mimetype]),
    }),
    limits: {fileSize: 5 * 1024 * 1024, files: 1},
    fileFilter: (req, file, cb) => {
        if(ALLOWED_TYPES[file.mimetype])
            cb(null, true);
        else
            cb(new HttpError(400, 'Formato não permitido.'));
    },
});

export function uploadAttachment(req, res, next) {
    upload.single('file') (req,res, (err) => {
        if (!err) return next();
        if(err instanceof multer.MulterError && err.code == 'LIMIT_FILE_SIZE')
            return next(new HttpError(400, 'O ficheiro tem mais de 5 MB', 'file'));
        if (err instanceof multer.MulterError)
            return next(new HttpError(400, 'Envia um unico ficheiro', ' file'));

        next(err);
    });
}