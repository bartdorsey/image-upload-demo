import { useNavigate } from "react-router";
import { type PhotoResponse } from "../../api/photos-api";

interface PhotoThumbnailProps {
    photo: PhotoResponse;
}

export default function PhotoThumbnail({ photo }: PhotoThumbnailProps) {
    const navigate = useNavigate();

    return (
        <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="overflow-hidden bg-gray-100">
                <img
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    src={photo.photo_url}
                    alt={photo.title || `Photo ${photo.id}`}
                    loading="lazy"
                />
            </div>
            {(photo.title || photo.description) && (
                <div className="p-4">
                    {photo.title && (
                        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                            {photo.title}
                        </h3>
                    )}
                    {photo.description && (
                        <p className="text-gray-600 text-xs line-clamp-2">
                            {photo.description}
                        </p>
                    )}
                </div>
            )}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                    onClick={() => navigate(`/photo/${photo.id}`)}
                    className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg hover:bg-gray-100 transition-colors"
                >
                    🔍 View Full Size
                </button>
            </div>
        </div>
    );
}