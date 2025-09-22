import { NavLink, Outlet } from "react-router";

export default function Layout() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-white shadow-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-3xl font-bold text-gray-900">📸 Photo Gallery</h1>
                        <nav className="flex gap-1">
                            <NavLink
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`
                                }
                                to="/"
                            >
                                🏠 Gallery
                            </NavLink>
                            <NavLink
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`
                                }
                                to="/simple-upload"
                            >
                                📤 Simple Upload
                            </NavLink>
                            <NavLink
                                className={({ isActive }) =>
                                    `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`
                                }
                                to="/drag-and-drop-upload"
                            >
                                🖱️ Drag & Drop
                            </NavLink>
                        </nav>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}