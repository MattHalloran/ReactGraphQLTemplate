def priceStringToDecimal(price: str):
    from re import sub
    from decimal import Decimal
    from decimal import InvalidOperation
    try:
        return Decimal(sub(r'[^\d.]', '', price))
    except InvalidOperation:
        return 0
