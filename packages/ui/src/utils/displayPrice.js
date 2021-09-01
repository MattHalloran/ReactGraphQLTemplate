import _ from 'lodash';

// Convert price stored in database to user-friendly version
export const displayPrice = (price) => {
    console.log('in display price', price)
    if (!price) return 'N/A';
    let result = Number(price);
    console.log('boop', result)
    if (isNaN(result)) return price;
    console.log('yet', `$${result.toFixed(2)})`);
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
    return (_.isNumber(number) && number > 0) ? number.toFixed(2) : null;
}