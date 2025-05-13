import { NavLink } from 'react-router'
import './App.css'
import SimpleUploadForm from './SimpleUploadForm'
import { Routes, Route } from 'react-router'
import PhotoList from './PhotoList'

function App() {
    return (
        <div className="flex flex-col items-center">
            <header>
                <nav className="flex gap-2">
                    <NavLink className="border-2 p-2" to="/">
                        Home
                    </NavLink>
                    <NavLink className="border-2 p-2" to="/simple-upload">
                        Simple Upload Form
                    </NavLink>
                    <NavLink
                        className="border-2 p-2"
                        to="/drag-and-drop-upload"
                    >
                        Drag and Drop Upload Form
                    </NavLink>
                </nav>
            </header>
            <main>
                <Routes>
                    <Route path="/" element={<PhotoList />} />
                    <Route
                        path="/simple-upload"
                        element={<SimpleUploadForm />}
                    />
                </Routes>
            </main>
        </div>
    )
}
export default App
