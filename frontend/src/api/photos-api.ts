// Get API URL from environment variables, with fallback for local development
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

export type PhotoResponse = {
    id: number;
    photo_url: string;
    title?: string;
    description?: string;
};

// Result types for easy error checking
export type ApiResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};

/**
 * Fetch all photos from the API
 */
export async function getAllPhotos(): Promise<ApiResult<PhotoResponse[]>> {
    try {
        const response = await fetch(`${baseUrl}/api/photos`);
        if (!response.ok) {
            return { success: false, error: "Couldn't fetch photos" };
        }
        const photos = await response.json();
        return { success: true, data: photos };
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : "Unknown error occurred"
        };
    }
}

/**
 * Fetch a single photo by ID
 */
export async function getPhotoById(photoId: number): Promise<ApiResult<PhotoResponse>> {
    try {
        const photosResult = await getAllPhotos();

        if (!photosResult.success) {
            return photosResult;
        }

        const photo = photosResult.data.find(p => p.id === photoId);
        if (!photo) {
            return { success: false, error: "Photo not found" };
        }

        return { success: true, data: photo };
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : "Unknown error occurred"
        };
    }
}

/**
 * Upload a new photo
 */
export async function uploadPhoto(formData: FormData): Promise<ApiResult<PhotoResponse>> {
    try {
        const response = await fetch(`${baseUrl}/api/photos`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            return { success: false, error: "Unable to upload image" };
        }

        const photo = await response.json();
        return { success: true, data: photo };
    } catch (e) {
        return {
            success: false,
            error: e instanceof Error ? e.message : "Unknown error occurred"
        };
    }
}