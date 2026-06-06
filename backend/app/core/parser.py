from fractions import Fraction

def parse_fraction(val_str: str) -> Fraction:
    """ 
    Parses a string to fraction.
    Supports both integer and fraction formats.
    """
    val_str = val_str.strip()
    if not val_str:
        raise ValueError("Input string is empty.")
    try:
        return Fraction(val_str)
    except (ValueError, ZeroDivisionError):
        raise ValueError(f"Invalid input: '{val_str}' is not a valid fraction or integer.")
        
def parse_row(row_str_list: list[str]) -> list[Fraction]:
    """ 
    Parses a list of strings to a list of fractions.
    """
    return [parse_fraction(val) for val in row_str_list]
