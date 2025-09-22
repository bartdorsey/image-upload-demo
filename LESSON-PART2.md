# Part 2: Frontend Image Upload Implementation

This lesson covers the React frontend components that handle image uploads, demonstrating both simple file input and drag-and-drop approaches.

**Prerequisites**: Complete [Part 1: Backend Implementation](LESSON-PART1.md) which covers the FastAPI backend setup.

---

## Frontend Architecture Overview

The frontend is built with React 19 and TypeScript, organized into feature-based folders:

```
src/
├── api/
│   └── photos-api.ts           # Centralized API functions
├── features/
│   ├── photos/                 # Photo display components
│   └── upload/                 # Upload components
│       ├── SimpleUploadForm.tsx
│       └── UploadForm.tsx
└── App.tsx                     # Main routing
```

The upload functionality is split into two components that demonstrate different UX approaches:

1. **SimpleUploadForm** - Traditional file input
2. **UploadForm** - Drag-and-drop with preview

Both components use the same backend API but provide different user experiences.

---

## Centralized API Layer

Before diving into the upload components, let's understand the API layer that handles all communication with the backend:

```typescript
// filepath: /home/junpt2025/projects/image-upload-demo/frontend/src/api/photos-api.ts

// Result types for easy error checking
export type ApiResult<T> = {
    success: true;
    data: T;
} | {
    success: false;
    error: string;
};

export type PhotoResponse = {
    id: number;
    photo_url: string;
    title?: string;
    description?: string;
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
```

### Key Features of the API Layer:

- **Result Pattern**: Uses a discriminated union that makes error handling explicit and type-safe
- **No Exceptions**: Components never need try/catch blocks
- **Centralized Error Handling**: All network errors are handled in one place
- **Type Safety**: TypeScript ensures correct usage of success/error states

---

## Simple File Upload Component

The `SimpleUploadForm` demonstrates the most basic approach to file uploads using a standard HTML file input:

```typescript
// filepath: /home/junpt2025/projects/image-upload-demo/frontend/src/features/upload/SimpleUploadForm.tsx

export default function SimpleUploadForm() {
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSubmit(formData: FormData) {
        setError("");
        const file = formData.get("photo");

        if (file instanceof File) {
            // Client-side validation for better UX
            if (
                file.type !== "image/jpeg" &&
                file.type !== "image/png" &&
                file.type !== "image/gif" &&
                file.type !== "image/webp"
            ) {
                setError("Unsupported Image Type");
                return;
            }

            // Upload using our API layer
            const result = await uploadPhoto(formData);
            if (result.success) {
                console.log(result.data);
                navigate("/"); // Return to gallery
            } else {
                setError(result.error);
            }
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    📤 Simple Upload
                </h2>
                <p className="text-gray-600">
                    Upload your photos with a simple file picker
                </p>
            </div>

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
                            <span className="text-gray-700 font-medium mb-2 block">
                                Title (optional)
                            </span>
                            <input
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                type="text"
                                name="title"
                                placeholder="Enter a title for your photo"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-medium mb-2 block">
                                Description (optional)
                            </span>
                            <textarea
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                name="description"
                                rows={3}
                                placeholder="Describe your photo"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-medium mb-2 block">
                                Choose Photo
                            </span>
                            <input
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-medium hover:file:bg-blue-700 file:cursor-pointer cursor-pointer border border-gray-300 rounded-lg p-3 hover:border-blue-400 transition-colors"
                                type="file"
                                name="photo"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                            />
                        </label>
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
```

### Key Concepts:

1. **FormData API**: React automatically creates FormData from the form when using `action`
2. **Client-side Validation**: Check file types on the frontend for immediate feedback
3. **File Type Checking**: Use `file.type` to validate MIME types
4. **Error State Management**: Display validation and upload errors to the user
5. **Navigation**: Use React Router to redirect after successful upload

---

## Advanced Drag-and-Drop Upload

The `UploadForm` component demonstrates a more sophisticated upload experience with drag-and-drop functionality and image preview:

```typescript
// filepath: /home/junpt2025/projects/image-upload-demo/frontend/src/features/upload/UploadForm.tsx

export default function UploadForm() {
    const [error, setError] = useState("");
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
                navigate("/"); // Return to gallery
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

            // Set the file in the hidden input for form submission
            if (fileInputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInputRef.current.files = dt.files;
            }
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    🖱️ Drag & Drop Upload
                </h2>
                <p className="text-gray-600">
                    Drag and drop your images or click to browse
                </p>
            </div>

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
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="text-center">
                            <div className="text-4xl mb-4">📷</div>
                            <p className="text-lg font-medium text-gray-700 mb-2">
                                {dragActive
                                    ? "Drop your image here!"
                                    : "Drag & drop an image here"}
                            </p>
                            <p className="text-gray-500 mb-4">or</p>
                            <div className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                Choose File
                            </div>
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

                    <div className="space-y-4">
                        <label className="block">
                            <span className="text-gray-700 font-medium mb-2 block">
                                Title (optional)
                            </span>
                            <input
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                type="text"
                                name="title"
                                placeholder="Enter a title for your photo"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-medium mb-2 block">
                                Description (optional)
                            </span>
                            <textarea
                                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                name="description"
                                rows={3}
                                placeholder="Describe your photo"
                            />
                        </label>
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
```

### Advanced Features Explained:

#### 1. Drag and Drop Events
- **onDragOver**: Prevents default behavior and indicates drop zone is active
- **onDrop**: Handles the actual file drop and extracts files from `dataTransfer`
- **onDragLeave**: Updates UI when user drags out of the drop zone

#### 2. File Preview with URL.createObjectURL()
```typescript
setPreview(URL.createObjectURL(file));
```
- Creates a temporary blob URL for the selected file
- Allows immediate preview without uploading
- **Important**: Should call `URL.revokeObjectURL()` when component unmounts to prevent memory leaks

#### 3. DataTransfer API Integration
```typescript
const dt = new DataTransfer();
dt.items.add(file);
fileInputRef.current.files = dt.files;
```
- Bridges drag-and-drop files with the form input
- Allows using the same form submission logic for both drag-drop and click-to-browse

#### 4. useRef for Hidden Input
- Keeps a reference to the hidden file input
- Allows programmatic triggering of file selection dialog
- Maintains accessibility while providing custom UI

---

## Frontend Validation Strategy

Both components implement a **defensive validation** strategy:

### Client-Side Validation (Immediate Feedback)
```typescript
if (
    file.type !== "image/jpeg" &&
    file.type !== "image/png" &&
    file.type !== "image/gif" &&
    file.type !== "image/webp"
) {
    setError("Unsupported Image Type");
    return;
}
```

### Why Validate on Frontend?
- **Better UX**: Immediate feedback without network round-trip
- **Reduced Server Load**: Filter out obviously invalid files
- **Faster Feedback Loop**: Users can correct mistakes immediately

### Security Note
**Client-side validation is not security** - it's purely for user experience. The backend must still validate everything, as shown in Part 1 of this lesson.

---

## State Management Patterns

Both upload components use similar state management patterns:

```typescript
const [error, setError] = useState("");           // Error messages
const [preview, setPreview] = useState<string | null>(null); // File preview (UploadForm only)
const [dragActive, setDragActive] = useState(false); // Drag state (UploadForm only)
```

### State Flow:
1. **Initial**: All states empty/null/false
2. **File Selected**: `preview` set (UploadForm), `error` cleared
3. **Upload Started**: Loading state (could be added)
4. **Upload Success**: Navigate to gallery page
5. **Upload Error**: `error` set with message

### Key Differences:
- **SimpleUploadForm**: Only tracks `error` state - relies on native form behavior
- **UploadForm**: Tracks `error`, `preview`, and `dragActive` for enhanced UX

---

## Modern React Patterns Used

### Form Actions (React 19)
```typescript
<form action={handleSubmit}>
```
- Uses React 19's built-in form actions
- Automatically creates FormData from form fields
- Cleaner than traditional onSubmit handlers

### TypeScript Event Handling
```typescript
function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
}

function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    const file = e.dataTransfer.files?.[0];
}
```
- Proper TypeScript event types
- Optional chaining for safe property access
- Type-safe file handling

### Conditional Rendering
```typescript
{preview && <img src={preview} alt="Preview" />}
{error && <div className="error">{error}</div>}
```
- React's conditional rendering patterns
- Clean, declarative UI updates

---

## Integration with Backend

The frontend components integrate seamlessly with the FastAPI backend through:

### 1. Consistent FormData Usage
- Both frontend and backend expect a `photo` field
- FormData automatically handles file encoding
- No manual multipart/form-data setup required

### 2. Error Handling Alignment
- Frontend displays backend validation errors
- API layer normalizes error responses
- Consistent error experience across validation layers

### 3. CORS Configuration
```typescript
// Backend CORS allows frontend origin
CORS_ORIGINS = ["http://localhost:5173"]

// Frontend API calls work seamlessly
const response = await fetch(`${baseUrl}/api/photos`, {
    method: "POST",
    body: formData,
});
```

---

## Best Practices Demonstrated

### 1. Separation of Concerns
- **API Layer**: Handles all network communication
- **Components**: Focus on UI and user interaction
- **Validation**: Split between client (UX) and server (security)

### 2. Type Safety
- TypeScript ensures correct API usage
- Discriminated unions prevent runtime errors
- Proper event typing for file handling

### 3. User Experience
- Immediate feedback on file selection
- Visual drag-and-drop indicators
- Preview before upload
- Clear error messaging

### 4. Accessibility
- Hidden input maintains keyboard navigation
- Click-to-browse fallback for drag-and-drop
- Proper form semantics

---

## Extension Points

This upload system can be easily extended:

### Progress Tracking
```typescript
const [uploadProgress, setUploadProgress] = useState(0);

// Use XMLHttpRequest or fetch with streams for progress
```

### Multiple File Upload
```typescript
const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

// Handle multiple files in drag-and-drop
```

### Image Resizing
```typescript
// Use Canvas API to resize before upload
function resizeImage(file: File, maxWidth: number): Promise<File>
```

---

## Summary of Frontend Implementation

The frontend demonstrates modern React patterns for file uploads:

- **Two UX approaches**: Simple input vs. drag-and-drop
- **Type-safe API layer**: Centralized error handling without exceptions
- **Progressive enhancement**: Works with and without JavaScript
- **Client-side validation**: Immediate feedback for better UX
- **Modern React patterns**: Form actions, TypeScript, conditional rendering

The components work seamlessly with the FastAPI backend from Part 1, creating a complete, production-ready image upload system.

---

## Further Reading

- [MDN File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [MDN Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [React 19 Form Actions](https://react.dev/reference/react-dom/components/form#handling-form-submission)
- [TypeScript React Event Types](https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/)
