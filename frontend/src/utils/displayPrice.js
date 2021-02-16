
// Convert price stored in database to user-friendly version
export const displayPrice = (price) => {
    let result = price/100;
    if (isNaN(result)) return price;
    return `$${result.toFixed(2)}`;
}