import { useState } from "react";
import { useNavigate } from "react-router";
import { uploadPhoto } from "../../api/photos-api";

// This component shows the absolute simplest version of a file upload
// using the plain <input type="file"/> HTML input
export default function SimpleUploadForm() {
    // To store any errors
    const [error, setError] = useState("");
    const [imageURL, setImageURL] = useState("");
    const navigate = useNavigate();

    // When we submit the form, this is called
    async function handleSubmit(formData: FormData) {
        setError("");
        const file = formData.get("photo");
        // The File object is documented here:
        // https://developer.mozilla.org/en-US/docs/Web/API/File
        if (file instanceof File) {
            console.log(file);
            // It's a good idea to check that it's a supported type of image file:
            // One of jpeg, png, gif or webp
            if (
                file.type !== "image/jpeg" &&
                file.type !== "image/png" &&
                file.type !== "image/gif" &&
                file.type !== "image/webp"
            ) {
                setError("Unsupported Image Type");
                return;
            }
            // Now we need to make a fetch call and upload the file
            const result = await uploadPhoto(formData);
            if (result.success) {
                console.log(result.data);
                // We set the image URL we got from the backend
                setImageURL(result.data.photo_url);
                // We can also navigate to the photo list page
                // to see the uploaded image
                navigate("/");
            } else {
                setError(result.error);
            }
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">📤 Simple Upload</h2>
                <p className="text-gray-600">Upload your photos with a simple file picker</p>
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

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium mb-2 block">Title (optional)</span>
                            <input
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                type="text"
                                name="title"
                                placeholder="Enter a title for your photo"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-medium mb-2 block">Description (optional)</span>
                            <textarea
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                name="description"
                                rows={3}
                                placeholder="Describe your photo"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-medium mb-2 block">Choose Photo</span>
                            <input
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium hover:file:bg-blue-700 file:cursor-pointer cursor-pointer border border-gray-300 rounded-lg p-3 hover:border-blue-400 transition-colors"
                                type="file"
                                name="photo"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                            />
                        </label>
                        <p className="text-sm text-gray-500">Supports: JPEG, PNG, GIF, WebP files</p>
                    </div>

                    <button
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        type="submit"
                    >
                        🚀 Upload Photo
                    </button>
                </form>
            </div>
        </div>
    );
}
