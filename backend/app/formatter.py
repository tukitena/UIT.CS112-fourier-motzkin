from fractions import Fraction
from typing import List, Dict
from app.schemas import StepLog 

def get_var_name(idx: int) -> str:
    """ 
    Get variable name based on index.
    For example, 0 -> z, 1 -> x_{1}, 2 -> x_{2}, ...
    """
    if idx == 0:
        return "z"
    return f"x_{{{idx}}}"
    
def format_fraction(frac: Fraction) -> str:
    """ Format a fraction as a string. """
    if frac.denominator == 1:
        return str(frac.numerator)
    
    sign = "-" if frac < 0 else ""
    abs_val = abs(frac)
    return f"{sign}\\frac{{{abs_val.numerator}}}{{{abs_val.denominator}}}"

def format_expression(coeffs: List[Fraction], constant: Fraction = Fraction(0)) -> str:
    """
    Change arr of coeffs to latex expression
    ex: [1, -1/2, 0] -> "z - \\frac{1}{2}x_{1}"
    """
    terms = []
    
    for i, coeff in enumerate(coeffs):
        if coeff == 0:
            continue
        
        var_name = get_var_name(i)
        abs_coeff = abs(coeff)
        
        # Determine coefficient string (omit '1' for variables)
        if abs_coeff == 1:
            coeff_str = ""
        else:
            coeff_str = format_fraction(abs_coeff)
            
        # Determine sign and spacing
        if not terms: # First term in the expression
            sign = "-" if coeff < 0 else ""
        else:         # Subsequent terms
            sign = " - " if coeff < 0 else " + "
            
        terms.append(f"{sign}{coeff_str}{var_name}")

    # Process constant term
    if constant != 0:
        abs_constant = abs(constant)
        if not terms:
            terms.append(format_fraction(constant))
        else:
            sign = " + " if constant > 0 else " - "
            terms.append(f"{sign}{format_fraction(abs_constant)}")

    if not terms:
        return "0"
    
    return "".join(terms).strip()

def format_inequality(coeffs: List[Fraction], constant: Fraction) -> str:
    """
    Format an inequality expression.
    ex: [1, -1/2, 0], 3 -> "z - \\frac{1}{2}x_{1} \\leq 3"
    """
    lhs = format_expression(coeffs)
    rhs = format_fraction(constant)
    return f"{lhs} \\leq {rhs}"

def format_steps_log(raw_steps: List[Dict]) -> List[StepLog]:
    """
    Format the raw steps log from optimizer to frontend's schema.
    Auto calculate and format upper bound and lower bound algebraically.
    """
    formatted_steps = []

    for step in raw_steps:
        var_index = step["variable_index"]
        var_name = get_var_name(var_index)

        upper_bounds = []
        lower_bounds = []

        # Extract upper and lower bounds from the matrix before elimination
        for row, val in zip(step["matrix_before"], step["rhs_before"]):
            c_k = row[var_index]
            if c_k == 0:
                continue
            
            # c_k * x_k + SUM(a_i * x_i) <= val
            # => c_k * x_k <= val - SUM(a_i * x_i)
            # xk = (val - SUM(a_i * x_i)) / c_k
            
            bound_coeffs = []
            for i, coeff in enumerate(row):
                if i == var_index:
                    bound_coeffs.append(Fraction(0))
                else:
                    bound_coeffs.append(-coeff / c_k)
                    
            # Divide the cons on rhs by c_k
            bound_const = val / c_k
            
            bound_expr = format_expression(bound_coeffs, bound_const)
            
            # Determine upper or lower bound based on the sign of c_k
            if c_k > 0:
                upper_bounds.append(f"{var_name} \\leq {bound_expr}")
            else:
                lower_bounds.append(f"{var_name} \\geq {bound_expr}")

        # Format the eliminated system after elimination
        eliminated_system = []
        for row, val in zip(step["matrix_after"], step["rhs_after"]):
            eliminated_system.append(format_inequality(row, val))

        formatted_step = StepLog(
            variable=var_name,
            upperBoundsLatex=upper_bounds,
            lowerBoundsLatex=lower_bounds,
            eliminatedSystemLatex=eliminated_system
        )
        formatted_steps.append(formatted_step)

    return formatted_steps

def format_normalized_problem(matrix: List[List[Fraction]], rhs: List[Fraction]) -> dict:
    """Format the initial standardized problem to show on the Result Panel"""
    if not matrix:
        return {"objectiveLatex": "", "constraintsLatex": []}
        
    # Standardizer pushed the objective function to the first 2 rows. 
    # Row index 0 is z - c1*x1 - c2*x2 ... <= 0
    # We display it as an equation: z - c1*x1 - c2*x2 ... = 0
    obj_row = matrix[0]
    obj_latex = format_expression(obj_row) + " = 0"
    
    constraints_latex = []
    # User's constraints start from index 1
    for i in range(1, len(matrix)):
        constraints_latex.append(format_inequality(matrix[i], rhs[i]))
        
    return {
        "objectiveLatex": obj_latex,
        "constraintsLatex": constraints_latex
    }