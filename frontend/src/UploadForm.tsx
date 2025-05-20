import { useState, useRef } from "react";
import { useNavigate } from "react-router";

const baseURL = "http://localhost:8000";

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
            try {
                const response = await fetch(`${baseURL}/api/photos`, {
                    method: "POST",
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error("Unable to upload image");
                }
                const data = await response.json();
                setImageURL(data.photo_url);
                // We can also navigate to the photo list page
                // to see the uploaded image
                navigate("/");
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError("Unknown Error");
                }
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
        <>
            {imageURL ? <img className="max-w-2xl" src={imageURL} /> : null}
            <form className="grid grid-rows-2 gap-2" action={handleSubmit}>
                {error ? <p>{error}</p> : ""}
                <div
                    className={`p-4 border-2 border-dashed rounded ${
                        dragActive
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: "pointer" }}
                >
                    <p>Drag & drop an image here, or click to select</p>
                    <input
                        ref={fileInputRef}
                        className="hidden"
                        type="file"
                        name="photo"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleFileChange}
                    />
                    {preview && (
                        <img
                            src={preview}
                            alt="Preview"
                            className="mt-2 max-h-48 mx-auto"
                        />
                    )}
                </div>
                <button className="p-2 border-2" type="submit">
                    Upload
                </button>
            </form>
        </>
    );
}
