from pydantic import BaseModel, Field
from typing import Optional, List, Literal

class ConstraintInput(BaseModel):
    coeffs: List[str]                       # Coefficients, fractions and integer only
    operator: Literal["<=", ">="]           # Operator for the constraint
    rhs: str                                # Fracture or integer only

class ProblemInput(BaseModel):
    objectiveType: Literal["max", "min"]    
    numVariables: int = Field(..., gt = 0, le = 4) # number of variables, between 1 and 4
    objectiveCoeffs: List[str]
    constraints: List[ConstraintInput]

class StepLog(BaseModel):
    variable: str                           # Variable being processed
    upperBoundsLatex: List[str]             # Upper bounds in LaTeX format
    lowerBoundsLatex: List[str]             # Lower bounds in LaTeX format
    eliminatedSystemLatex: List[str]        # Eliminated system in LaTeX format

class SolutionOutput(BaseModel):
    status: Literal["optimal", "infeasible", "unbounded"]  # Status of the solution
    objectiveValue: Optional[str] = None      # String (if infeasible or unbounded), fraction or integer
    objectiveValueLatex: Optional[str] = None # LaTeX representation of the objective value
    solution: Optional[dict[str, str]] = None # dict of sol (ex: {"x1": "1/2", "x2": "0", ...})
    message: str

class ProblemResponse(BaseModel):
    normalizedProblem: dict
    steps: List[StepLog]
    solution: SolutionOutput