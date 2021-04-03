
// Convert price stored in database to user-friendly version
export const displayPrice = (price) => {
    console.log('in display price', price, !price)
    if (!price) return 'N/A';
    let result = price/100;
    if (isNaN(result)) return price;
    return `$${result.toFixed(2)}`;
}

// Convert display price to database representation
export const displayPriceToDatabase = (price) => {
    // Convert to string, if needed
    let priceString = price + '';
    // Remove unit
    priceString = priceString.replace('$', '');
    let number = Number(priceString);
    // If number, return cents
    // If not a number, return 'N/A'
    if (isNaN(number)) {
        return 'N/A';
    }
    return number.toFixed(2) * 100;
}