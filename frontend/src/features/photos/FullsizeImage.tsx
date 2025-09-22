import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getPhotoById, type PhotoResponse } from "../../api/photos-api";

export default function FullsizeImage() {
    const { photoId } = useParams<{ photoId: string }>();
    const navigate = useNavigate();
    const [photo, setPhoto] = useState<PhotoResponse | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPhoto() {
            if (!photoId) {
                setLoading(false);
                return;
            }

            const result = await getPhotoById(parseInt(photoId));
            if (result.success) {
                setPhoto(result.data);
                setError("");
            } else {
                setError(result.error);
            }
            setLoading(false);
        }

        fetchPhoto();
    }, [photoId]);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-600 text-xl">Loading photo...</div>
            </div>
        );
    }

    if (error || !photo) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                    <div className="text-red-600 text-6xl mb-4">⚠️</div>
                    <h2 className="text-red-800 text-2xl font-semibold mb-4">Photo Not Found</h2>
                    <p className="text-red-600 mb-6">{error || "The requested photo could not be found."}</p>
                    <button
                        onClick={() => navigate("/")}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        ← Back to Gallery
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header with back button and photo info */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Gallery
                </button>
                <div className="text-gray-600">
                    Photo #{photo.id}
                </div>
            </div>

            {/* Main image container */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-4">
                    <img
                        src={photo.photo_url}
                        alt={`Photo ${photo.id}`}
                        className="w-full h-auto max-h-screen object-contain rounded-lg"
                    />
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 mt-6">
                <button
                    onClick={() => window.open(photo.photo_url, '_blank')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in New Tab
                </button>
                <button
                    onClick={() => navigate("/")}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                    Back to Gallery
                </button>
            </div>
        </div>
    );
}