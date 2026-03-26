from fractions import Fraction
from app.schemas import ProblemInput
from .parser import parse_fraction, parse_row

def standardize_problem(problem: ProblemInput):
    """
    Standardize:
    1. add z variable to matrix (index 0)
    2. convert objective function to two inequalities >= 0 or <= 0 (depends on objective type)
    3. convert all constraints to <=
    """
    matrix = []
    rhs = []

    obj_coeffs = parse_row(problem.objectiveCoeffs)

    if len(obj_coeffs) != problem.numVariables:
        raise ValueError("Number of coefficients in objective function does not match numVariables")

    # Add objective function
    if problem.objectiveType == "max":
        # For max z = a1*x1 + a2*x2 + ... => z - a1*x1 - a2*x2 <= 0
        matrix.append([Fraction(1)] + [-c for c in obj_coeffs]) # z - a1*x1 - a2*x2 <= 0
        rhs.append(Fraction(0))
    else:
        # For min z = a1*x1 + a2*x2 + ... => -z + a1*x1 + a2*x2 <= 0
        matrix.append([Fraction(-1)] + obj_coeffs) # -z + a1*x1 + a2*x2 <= 0
        rhs.append(Fraction(0))

    for const in problem.constraints:
        coeffs = parse_row(const.coeffs)

        if len(coeffs) != problem.numVariables:
            raise ValueError("Number of coefficients in constraint does not match numVariables")

        val_rhs = parse_fraction(const.rhs)

        # Convert to <= if needed
        if const.operator == ">=":
            coeffs = [-c for c in coeffs]
            val_rhs = -val_rhs

        # Add z variable with coefficient 0
        coeffs = [Fraction(0)] + coeffs
        matrix.append(coeffs)
        rhs.append(val_rhs)

    return matrix, rhs