import { Routes, Route } from "react-router";
import Layout from "./Layout";
import PhotoList from "./features/photos/PhotoList";
import SimpleUploadForm from "./features/upload/SimpleUploadForm";
import UploadForm from "./features/upload/UploadForm";
import FullsizeImage from "./features/photos/FullsizeImage";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<PhotoList />} />
                <Route path="photo/:photoId" element={<FullsizeImage />} />
                <Route path="simple-upload" element={<SimpleUploadForm />} />
                <Route path="drag-and-drop-upload" element={<UploadForm />} />
            </Route>
        </Routes>
    );
}
export default App;
