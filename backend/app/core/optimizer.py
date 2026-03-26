from fractions import Fraction
from typing import List, Tuple
from .fourier_motzkin import fourier_motzkin_elimination

def solve_lp(
    matrix: List[List[Fraction]],
    rhs: List[Fraction],
    num_vars: int,
    obj_type: str
):
    """
    Solve the linear programming problem using FM
    return z*, status, steps_log
    """

    steps_log = []
    curr_matrix = matrix
    curr_rhs = rhs

    # Loop to eliminate variables one by one (from n-1 to 1, avoid z at x0)
    for var_index in range(num_vars, 0, -1):
        raw_new_matrix, raw_new_rhs = fourier_motzkin_elimination(curr_matrix, curr_rhs, var_index)
        
        new_matrix = []
        new_rhs = []

        # Eliminate always true ineq (0 <= b), if b < 0 then infeasible
        for row, val in zip(raw_new_matrix, raw_new_rhs):
            is_all_zero = all(coeff == 0 for coeff in row)
            if is_all_zero:
                if val < 0:
                    return None, "infeasible", steps_log
                # else: 0 <= val is always true, skip this
                continue

            new_matrix.append(row)
            new_rhs.append(val)
        
        # Log the step (variable eliminated, upper/lower bounds, new system)
        steps_log.append({
            "variable_index": var_index,
            "matrix_before": curr_matrix,
            "rhs_before": curr_rhs,
            "matrix_after": new_matrix,
            "rhs_after": new_rhs
        })

        curr_matrix = new_matrix
        curr_rhs = new_rhs

    # Hence, we will have only z-var lines at the end
    # Optimize z by checking upper and lower bounds
    upper_bounds = []
    lower_bounds = []

    for row, val in zip(curr_matrix, curr_rhs):
        coeff = row[0] # Coeff of z
        # if coeff == 0, we will have 0z <= val, if val < 0 then feasible
        if coeff == 0:
            if val < 0:
                return None, "infeasible", steps_log
        # az <= b (a > 0) => z <= b/a, we will have an upper bound
        elif coeff > 0:
            upper_bounds.append(val / coeff)
        # az <= b (a < 0) => z >= b/a, we will have a lower bound
        else:
            lower_bounds.append(val / coeff)

    # Check if there is a feasible solution
    max_lower_bound = max(lower_bounds) if lower_bounds else None
    min_upper_bound = min(upper_bounds) if upper_bounds else None

    if (max_lower_bound is not None and min_upper_bound is not None):
        if max_lower_bound > min_upper_bound:
            return None, "infeasible", steps_log
        
    # Find z* based on objective type
    z_star = None
    if obj_type == "max":
        if min_upper_bound is None:
            return None, "unbounded", steps_log
        z_star = min_upper_bound
    else: # obj_type == "min"
        if max_lower_bound is None:
            return None, "unbounded", steps_log
        z_star = max_lower_bound
    
    return z_star, "optimal", steps_log