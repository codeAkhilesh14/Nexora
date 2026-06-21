import { Readable } from 'node:stream';
import { cloudinary } from '../config/cloudinary.js';

export const uploadBuffer = (file, folder = 'nexora') => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => {
    if (error) reject(error);
    else resolve(result.secure_url);
  });
  Readable.from(file.buffer).pipe(stream);
});
