// Return the image name with the best-match size
// Size is measured by width
// Priority:
// 0. largest size if none requested
// 1. exact size match
// 2. smallest size greater than requested
import _ from 'lodash';

// 3. largest size smaller than requested
export function getImageSrc(image, size) {
    // Return null if invalid input
    if (!Array.isArray(image?.files) || image.files.length === 0) return null;
    // Return largest size if size not specified
    if (!_.isNumber(size)) return image.files.sort((a, b) => b.width - a.width)[0].src;
    // Determine sizes >= requested
    const largerSizes = image.files.filter(f => f.width >= size);
    // If any images match, return the smallest one
    if (largerSizes.length > 0) return largerSizes.sort((a, b) => a.width - b.width)[0].src;
    // Determine sizes < requested
    const smallerSizes = image.files.filter(f => f.width < size);
    // If any images match, return the largest one
    if (smallerSizes.length > 0) return smallerSizes.sort((a, b) => b.width - a.width)[0].src;
    // Shouldn't reach this point, unless the image data is formatted incorrectly
    return null;
}