import { useState, useEffect } from 'react'

const baseUrl = 'http://localhost:8000'

type PhotoResponse = {
    id: number
    photo_url: string
}

export default function PhotoList() {
    const [error, setError] = useState('')
    const [photos, setPhotos] = useState<PhotoResponse[]>([])

    useEffect(() => {
        async function getPhotos() {
            try {
                const response = await fetch(`${baseUrl}/api/photos`)
                if (!response.ok) {
                    console.log(response)
                    throw new Error("Couldn't fetch images")
                }
                const photos = (await response.json()) as PhotoResponse[]
                setPhotos(photos)
            } catch (e) {
                if (e instanceof Error) {
                    setError(e.message)
                } else {
                    setError('Unknown Error')
                }
            }
        }
        getPhotos()
    }, [])

    return (
        <div className="flex gap-2 flex-wrap justify-center">
            {error && <p>{error}</p>}
            {photos.map((photo) => (
                <img
                    key={photo.id}
                    className="max-w-sm"
                    src={photo.photo_url}
                />
            ))}
        </div>
    )
}
