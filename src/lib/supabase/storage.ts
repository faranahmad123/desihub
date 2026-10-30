import imageCompression from 'browser-image-compression';
import { createClient } from './client';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_UPLOAD_FILE_SIZE_MB = 10;

export interface UploadImageResult {
  url: string | null;
  error: string | null;
}

/**
 * Validates image type and size, compresses client-side to WebP under 500 KB,
 * and uploads to the Supabase 'product-images' bucket with a unique file name.
 */
export async function uploadProductImage(file: File): Promise<UploadImageResult> {
  // 1. Validate file type: JPG, PNG, WebP only
  const fileType = file.type.toLowerCase();
  if (!ALLOWED_TYPES.includes(fileType)) {
    return {
      url: null,
      error: 'Invalid file format. Only JPG, PNG, and WebP images are allowed.',
    };
  }

  // 2. Validate original size
  if (file.size > MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024) {
    return {
      url: null,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed before compression is 10 MB.`,
    };
  }

  try {
    // 3. Compress to WebP < 500 KB (bucket limit is 1 MB)
    const compressionOptions = {
      maxSizeMB: 0.45, // strictly under 500 KB
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      fileType: 'image/webp',
    };

    let processedFile: File;
    try {
      const compressedBlob = await imageCompression(file, compressionOptions);
      processedFile = new File([compressedBlob], 'image.webp', { type: 'image/webp' });
    } catch (compressionErr) {
      console.warn('Image compression fallback:', compressionErr);
      processedFile = file;
    }

    // Double check compressed size does not exceed 1 MB
    if (processedFile.size > 1 * 1024 * 1024) {
      return {
        url: null,
        error: 'Image is larger than 1 MB after compression. Please use a smaller image.',
      };
    }

    // 4. Generate unique file name
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 9);
    const fileName = `product-${timestamp}-${randomPart}.webp`;
    const filePath = `items/${fileName}`;

    // 5. Upload to Supabase 'product-images' bucket using browser client with session
    const supabase = createClient();
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, processedFile, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      if (uploadError.message.includes('row-level security') || uploadError.message.includes('RLS')) {
        return {
          url: null,
          error: 'Upload unauthorized: You must be signed in as an admin to upload images.',
        };
      }
      return { url: null, error: uploadError.message };
    }

    // 6. Get public URL
    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Failed to upload product image.' };
  }
}

/**
 * Removes an existing product image from Supabase storage when replaced or deleted.
 */
export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  if (!imageUrl || !imageUrl.includes('/product-images/')) return false;

  try {
    const parts = imageUrl.split('/product-images/');
    if (!parts[1]) return false;

    const path = decodeURIComponent(parts[1].split('?')[0]);
    const supabase = createClient();
    const { error } = await supabase.storage.from('product-images').remove([path]);

    return !error;
  } catch {
    return false;
  }
}
