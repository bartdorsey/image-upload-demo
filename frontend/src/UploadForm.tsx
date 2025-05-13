export default function UploadForm() {
    function handleSubmit(formData: FormData) {}

    return (
        <form action={handleSubmit}>
            <input type="file" name="file" />
            <button type="submit">Upload</button>
        </form>
    )
}
