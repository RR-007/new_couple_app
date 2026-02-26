const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Uploads media to Cloudinary.
 * @param uri The local file URI.
 * @param folder The target folder on Cloudinary.
 * @param resourceType 'image', 'video', or 'auto'
 */
export const uploadMedia = async (
    uri: string,
    folder: string,
    resourceType: 'image' | 'video' | 'auto' = 'auto'
): Promise<string> => {
    const formData = new FormData();

    const filename = uri.split('/').pop() || `media_${Date.now()}`;
    const match = /\.(\w+)$/.exec(filename);
    let mimeType = 'image/jpeg';

    if (resourceType === 'video' || filename.endsWith('.mp4') || filename.endsWith('.mov')) {
        mimeType = match ? `video/${match[1]}` : 'video/mp4';
        resourceType = 'video';
    } else {
        mimeType = match ? `image/${match[1]}` : 'image/jpeg';
        resourceType = 'image';
    }

    formData.append('file', {
        uri,
        name: filename,
        type: mimeType,
    } as any);

    formData.append('upload_preset', UPLOAD_PRESET!);
    formData.append('folder', folder);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error('Cloudinary upload error:', data);
        throw new Error(data.error?.message || 'Upload failed');
    }

    return data.secure_url;
};
