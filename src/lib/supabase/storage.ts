import { createClient } from './client';

export async function uploadProductImage(file: File): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabase = createClient();

    // Generate clean unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-');
    const fileName = `${Date.now()}-${cleanName}.${fileExt}`;
    const filePath = `products/${fileName}`;

    // Upload to 'product-images' bucket
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading product image:', uploadError);
      return { url: null, error: uploadError.message };
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err.message || 'Failed to upload image' };
  }
}
