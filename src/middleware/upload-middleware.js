import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {recursive: true});
}

const createStorage = (folderName) => {
    const uploadDir = path.join(process.cwd(), 'uploads', folderName);

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {recursive: true});
    }

    return multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${Date.now()}-${file.fieldname}${ext}`);
        }
    });
};

/**
 * @param folderName string - folder under uploads/
 * @param options object - { multiple: boolean, maxCount: number, fieldName: string, fileSize: number }
 */
export const uploadFiles = (folderName, options = {}) => {
    const {multiple = false, maxCount = 5, fieldName = 'file', fileSize = 5 * 1024 * 1024} = options;

    const instance = multer({
            storage: createStorage(folderName),
            fileFilter: (req, file, cb) => {
                if (file.mimetype && file.mimetype.startsWith('image/')) {
                    cb(null, true);
                } else {
                    cb(new Error('Only image files are allowed'), false);
                }
            },
            limits: {
                fileSize
            }
        }
    )

    return multiple ? instance.array(fieldName, maxCount) : instance.single(fieldName);
};