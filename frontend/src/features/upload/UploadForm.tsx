import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { uploadPhoto } from "../../api/photos-api";

export default function UploadForm() {
    const [error, setError] = useState("");
    const [imageURL, setImageURL] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    async function handleSubmit(formData: FormData) {
        setError("");
        const file = formData.get("photo");
        if (file instanceof File) {
            if (
                file.type !== "image/jpeg" &&
                file.type !== "image/png" &&
                file.type !== "image/gif" &&
                file.type !== "image/webp"
            ) {
                setError("Unsupported Image Type");
                return;
            }
            const result = await uploadPhoto(formData);
            if (result.success) {
                setImageURL(result.data.photo_url);
                // We can also navigate to the photo list page
                // to see the uploaded image
                navigate("/");
            } else {
                setError(result.error);
            }
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (
                file.type !== "image/jpeg" &&
                file.type !== "image/png" &&
                file.type !== "image/gif" &&
                file.type !== "image/webp"
            ) {
                setError("Unsupported Image Type");
                setPreview(null);
                return;
            }
            setError("");
            setPreview(URL.createObjectURL(file));
        }
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragActive(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (
                file.type !== "image/jpeg" &&
                file.type !== "image/png" &&
                file.type !== "image/gif" &&
                file.type !== "image/webp"
            ) {
                setError("Unsupported Image Type");
                setPreview(null);
                return;
            }
            setError("");
            setPreview(URL.createObjectURL(file));
            // Set file in input for form submission
            if (fileInputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInputRef.current.files = dt.files;
            }
        }
    }

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragActive(true);
    }

    function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        setDragActive(false);
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">🖱️ Drag & Drop Upload</h2>
                <p className="text-gray-600">Drag and drop your images or click to browse</p>
            </div>

            {imageURL && (
                <div className="mb-8 text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="text-green-600 text-xl mb-2">✓</div>
                        <p className="text-green-800 font-medium">Upload successful!</p>
                    </div>
                    <img className="max-w-full rounded-lg shadow-lg mx-auto" src={imageURL} alt="Uploaded" />
                </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-6">
                <form className="space-y-6" action={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="text-red-600 text-lg mr-2">⚠️</div>
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    <div
                        className={`relative p-8 border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer ${
                            dragActive
                                ? "border-blue-500 bg-blue-50 transform scale-105"
                                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                        }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-4">📷</div>
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                {dragActive ? "Drop your image here!" : "Drag & drop an image here"}
                            </p>
                            <p className="text-gray-500 mb-4">or</p>
                            <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                Choose File
                            </div>
                            <p className="text-sm text-gray-400 mt-4">Supports: JPEG, PNG, GIF, WebP</p>
                        </div>

                        <input
                            ref={fileInputRef}
                            className="hidden"
                            type="file"
                            name="photo"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleFileChange}
                        />

                        {preview && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 mb-3">Preview:</p>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="max-h-64 rounded-lg shadow-md mx-auto"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        type="submit"
                        disabled={!preview}
                    >
                        {preview ? "🚀 Upload Photo" : "Select a photo first"}
                    </button>
                </form>
            </div>
        </div>
    );
}
