// Return the image name with the best-match size
export function getImageSrc(image, size) {
    console.log('GETTING IMAGE SRC', image, size)
    if (!Array.isArray(image?.files) || image.files.length === 0) return null;
    console.log('YEET')
    const requestedSize = image.files.find(f => f.width === size);
    console.log('YEET 2', requestedSize)
    if (requestedSize) return requestedSize.src;
    const largestSize = image.files.reduce(function(prev, current) {
        return (prev.width > current.width) ? prev : current;
    }).src;
    console.log('GET IMAGE SRD', largestSize)
    return largestSize;
}