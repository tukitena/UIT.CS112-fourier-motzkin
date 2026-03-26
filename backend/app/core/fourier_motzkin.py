from fractions import Fraction
from typing import List, Tuple

def fourier_motzkin_elimination(matrix: List[List[Fraction]], rhs: List[Fraction], variable_index: int) -> Tuple[List[List[Fraction]], List[Fraction]]:
    """
    Perform Fourier-Motzkin (FM) on the variable at variable_index.
    Suppose that all the system is Ax <= b
    """

    pos_eqs = []
    neg_eqs = []
    zero_eqs = []

    pos_rhs = []
    neg_rhs = []
    zero_rhs = []

    # Classify the ine
    for i, row in enumerate(matrix):
        coeff = row[variable_index]
        if coeff > 0:
            pos_eqs.append(row)
            pos_rhs.append(rhs[i])
        elif coeff < 0:
            neg_eqs.append(row)
            neg_rhs.append(rhs[i])
        else:
            zero_eqs.append(row)
            zero_rhs.append(rhs[i])

    new_matrix = []
    new_rhs = []

    # Combine positive and negative ine
    for p_row, p_val in zip(pos_eqs, pos_rhs):
        a = p_row[variable_index]
        for n_row, n_val in zip(neg_eqs, neg_rhs):
            c = n_row[variable_index]

            # Suppose we have f(x) + a*xi <= p and g(x) + c*xi <= n (a > 0 and c < 0)
            # We multiply the first ine by -c and the second ine by a, we get:
            # -c*f(x) - a*c*xi <= -c*p and a*g(x) + a*c*xi <= a*n
            # Then add two line, we will get the new ine without xi:
            # -c*f(x) + a*g(x) <= -c*p + a*n
            new_row = []
            for i in range(len(p_row)):
                new_coeffs = -(c) * p_row[i] + a * n_row[i]
                new_row.append(new_coeffs)

            new_val = -(c) * p_val + a * n_val
            new_matrix.append(new_row)
            new_rhs.append(new_val)

    return new_matrix + zero_eqs, new_rhs + zero_rhs