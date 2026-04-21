import cloudinary from '../config/cloudinary';

type ResourceType = 'image' | 'video' | 'raw';

export async function deleteFile(public_id: string, resource_type: ResourceType = 'image'): Promise<void> {
  await cloudinary.uploader.destroy(public_id, { resource_type });
}
