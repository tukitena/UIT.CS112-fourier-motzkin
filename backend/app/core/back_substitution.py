from fractions import Fraction
from typing import List, Dict, Optional, Tuple

def back_substitution(
    steps_log: List[Dict],
    z_star: Fraction
) -> Tuple[Optional[Dict[str, str]], List[Dict[str, str]]]:
    """
    Perform back substitution to find the optimal solution for all variables.
    Receive the steps log from the optimization process and the optimal value of z (z_star).
    Returns (solution_dict, back_sub_logs):
    - solution_dict: dictionary of variable values (ex: {"x1": "1/2", "x2": "0", ...})
    - back_sub_logs: logs of each back-substitution step
    """

    if z_star is None:
        return None, []
    
    known_vals: Dict[int, Fraction] = {0: z_star}  # Start with the optimal value of z
    back_sub_logs = [] # For logging the back substitution steps

    # Back substitute from the last step to the first step
    for step in reversed(steps_log):
        var_index = step["variable_index"]
        matrix = step["matrix_before"]
        rhs = step["rhs_before"]

        upper_bounds = []
        lower_bounds = []

        for row, val in zip(matrix, rhs):

            coeff = row[var_index] # Coeff of the variable being processed
            if coeff == 0:
                continue

            # Sum all the known variable values multiplied by their coefficients
            # For ex, if we are at x2, we will have something like: a0*z + a1*x1 + a2*x2 <= b
            # We already know z, and x1 cause we have processed it in the previous step

            known_sum = Fraction(0)
            for i, coeff_i in enumerate(row):
                if i != var_index and coeff_i != 0:
                    known_sum += coeff_i * known_vals.get(i, Fraction(0))
            # known_sum + axi <= val => axi <= val - known_sum
            rhs_val = val - known_sum

            # if axi <= val (a > 0) => xi <= val/a, we will have an upper bound
            if coeff > 0:
                upper_bounds.append(rhs_val / coeff)
            # or else we will have a lower bound
            else:
                lower_bounds.append(rhs_val / coeff)

        max_lower_bound = max(lower_bounds) if lower_bounds else None
        min_upper_bound = min(upper_bounds) if upper_bounds else None

        # Chose a value for the variable
        if max_lower_bound is not None:
            chosen_val = max_lower_bound
        elif min_upper_bound is not None:
            chosen_val = min_upper_bound
        else:
            chosen_val = Fraction(0) # If there is no bound, we can choose any value, in this case, 0 for simplicity

        #Log for back substitution steps
        back_sub_logs.append({
            "variableIndex": str(var_index),
            "lowerBound": f"max({[str(b) for b in lower_bounds]})" if lower_bounds else "-∞",
            "upperBound": f"min({[str(b) for b in upper_bounds]})" if upper_bounds else "+∞",
            "chosenValue": str(chosen_val)
        })

        known_vals[var_index] = chosen_val

    solution = {}
    for i in sorted(known_vals.keys()):
        if i != 0: # Skip z variable
            solution[f"x{i}"] = str(known_vals[i])

    return solution, back_sub_logs
        