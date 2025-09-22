import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import PhotoThumbnail from "./PhotoThumbnail";
import { getAllPhotos, type PhotoResponse } from "../../api/photos-api";

export default function PhotoList() {
    const [error, setError] = useState("");
    const [photos, setPhotos] = useState<PhotoResponse[]>([]);

    useEffect(() => {
        async function fetchPhotos() {
            const result = await getAllPhotos();
            if (result.success) {
                setPhotos(result.data);
                setError("");
            } else {
                setError(result.error);
            }
        }
        fetchPhotos();
    }, []);

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <div className="text-red-600 text-xl mb-2">⚠️</div>
                    <h3 className="text-red-800 font-semibold mb-2">Error Loading Photos</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                    <div className="text-gray-400 text-6xl mb-4">📷</div>
                    <h3 className="text-gray-600 font-semibold mb-2">No Photos Yet</h3>
                    <p className="text-gray-500 mb-4">Upload your first photo to get started!</p>
                    <NavLink
                        to="/simple-upload"
                        className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Upload Photo
                    </NavLink>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Photo Gallery</h2>
                <p className="text-gray-600">{photos.length} photo{photos.length !== 1 ? 's' : ''} in your collection</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {photos.map((photo) => (
                    <PhotoThumbnail key={photo.id} photo={photo} />
                ))}
            </div>
        </div>
    );
}
