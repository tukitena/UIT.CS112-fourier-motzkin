from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import ProblemInput, ProblemResponse, SolutionOutput

from app.core.standardizer import standardize_problem
from app.core.optimizer import solve_lp
from app.core.back_substitution import back_substitution

from app.formatter import format_steps_log, format_normalized_problem, format_fraction

app = FastAPI(
    title="Fourier-Motzkin optimizer API",
    description="An API for solving lp problems using Fourier-Motzkin",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/solve", response_model=ProblemResponse)
def solve_linear_problem(payload: ProblemInput):
    try:
        # standardize input
        matrix, rhs = standardize_problem(payload)
        
        # optimize using Fourier-Motzkin elimination
        z_star, status, raw_steps_log = solve_lp(
            matrix, 
            rhs, 
            payload.numVariables, 
            payload.objectiveType
        )
        
        # back substitution
        solution_dict = None
        if status == "optimal":
            solution_dict = back_substitution(raw_steps_log, z_star)
            
        # format log to latex and normalized problem for response
        latex_steps = format_steps_log(raw_steps_log)
        normalized_prob = format_normalized_problem(matrix, rhs)
        
        # Format z* for response
        obj_val_str = str(z_star) if z_star is not None else None
        obj_val_latex = f"z^* = {format_fraction(z_star)}" if z_star is not None else None
        
        messages = {
            "optimal": "Tìm được nghiệm tối ưu thành công.",
            "infeasible": "Bài toán không khả thi (Hệ vô nghiệm).",
            "unbounded": "Bài toán không bị chặn."
        }
        
        # pack response
        return ProblemResponse(
            normalizedProblem=normalized_prob,
            steps=latex_steps,
            solution=SolutionOutput(
                status=status,
                objectiveValue=obj_val_str,
                objectiveValueLatex=obj_val_latex,
                solution=solution_dict,
                message=messages.get(status, "Trạng thái không xác định")
            )
        )
        
    except ValueError as ve:
        # catch validation err
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # other errs
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")

@app.get("/")
def health_check():
    return {"message": "Fourier-Motzkin API is running smoothly!"}