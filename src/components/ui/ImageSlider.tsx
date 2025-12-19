'use client'

import { useState, useEffect } from 'react'

interface ImageSliderProps {
    images: string[]
    interval?: number
}

export default function ImageSlider({ images, interval = 3000 }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set())

    useEffect(() => {
        if (images.length <= 1) return

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, interval)

        return () => clearInterval(timer)
    }, [images.length, interval])

    useEffect(() => {
        // Preload first 3 images
        images.slice(0, 3).forEach((src, idx) => {
            const img = new window.Image()
            img.src = src
            img.onload = () => {
                setLoadedImages(prev => new Set(prev).add(idx))
            }
            img.onerror = () => {
                console.error('Failed to load image:', src)
                setFailedImages(prev => new Set(prev).add(idx))
            }
        })
    }, [images])

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
    }

    if (images.length === 0) return null

    return (
        <div className="relative w-full h-full overflow-hidden rounded-xl sm:rounded-2xl group bg-gradient-to-br from-gray-800 via-purple-900 to-indigo-900">
            {/* Images */}
            <div className="relative w-full h-full">
                {images.map((image, index) => {
                    if (failedImages.has(index)) return null
                    
                    return (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-700 ${
                                index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                        >
                            <img
                                src={image}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-cover"
                                loading={index < 3 ? "eager" : "lazy"}
                                onLoad={() => setLoadedImages(prev => new Set(prev).add(index))}
                                onError={() => {
                                    console.error('Failed to load image:', image)
                                    setFailedImages(prev => new Set(prev).add(index))
                                }}
                            />
                            {/* Loading indicator for each image */}
                            {!loadedImages.has(index) && index === currentIndex && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 via-purple-800 to-indigo-800">
                                    <div className="text-white text-center">
                                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                                        <p className="text-sm">Đang tải...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Navigation Arrows - Hidden on mobile, visible on hover on desktop */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        aria-label="Ảnh trước"
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 touch-manipulation active:scale-95"
                    >
                        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToNext}
                        aria-label="Ảnh tiếp theo"
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1.5 sm:p-2 rounded-full opacity-0 sm:group-hover:opacity-100 transition-opacity z-10 touch-manipulation active:scale-95"
                    >
                        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </>
            )}

            {/* Dots Indicator - Responsive sizing and spacing */}
            {images.length > 1 && (
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 sm:space-x-2 z-10 max-w-full overflow-x-auto px-4 scrollbar-hide">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            aria-label={`Đến slide ${index + 1}`}
                            className={`flex-shrink-0 h-1.5 sm:h-2 rounded-full transition-all touch-manipulation ${
                                index === currentIndex
                                    ? 'bg-white w-6 sm:w-8'
                                    : 'bg-white/50 hover:bg-white/75 w-1.5 sm:w-2'
                            }`}
                        />
                    ))}
                </div>
            )}

            {/* Show fallback if all images failed or no images loaded yet */}
            {loadedImages.size === 0 && failedImages.size === images.length && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-700 via-purple-800 to-indigo-800 z-20">
                    <div className="text-white text-center px-4">
                        <div className="text-4xl sm:text-5xl mb-2">🎨</div>
                        <p className="text-sm">AEON Reward Platform</p>
                    </div>
                </div>
            )}
        </div>
    )
}

