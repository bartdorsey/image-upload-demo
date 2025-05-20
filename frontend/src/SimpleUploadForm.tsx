import { useState } from "react";
import { useNavigate } from "react-router";

const baseURL = "http://localhost:8000";

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
            try {
                const response = await fetch(`${baseURL}/api/photos`, {
                    method: "POST",
                    body: formData,
                });
                if (!response.ok) {
                    throw new Error("Unable to upload image");
                }
                const data = await response.json();
                console.log(data);
                // We set the image URL we got from the backend
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

    return (
        <>
            {imageURL ? <img className="max-w-2xl" src={imageURL} /> : null}
            <form className="grid grid-rows-2 gap-2" action={handleSubmit}>
                {error ? <p>{error}</p> : ""}
                <input className="p-2 border-2" type="file" name="photo" />
                <button className="p-2 border-2" type="submit">
                    Upload
                </button>
            </form>
        </>
    );
}
