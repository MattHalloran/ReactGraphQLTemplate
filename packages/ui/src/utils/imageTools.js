// Return the image name with the best-match size
export function getImageSrc(image, size) {
    if (!Array.isArray(image?.files) || image.files.length === 0) return null;
    const requestedSize = image.files.find(f => f.width === size);
    if (requestedSize) return requestedSize;
    const largestSize = image.files.reduce(function(prev, current) {
        return (prev.width > current.width) ? prev : current;
    }).src;
    return largestSize;
}