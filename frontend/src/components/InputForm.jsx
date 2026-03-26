import { useMemo, useState } from "react";
import { Play, LoaderCircle } from "lucide-react";
import { isRational, normalizeRational } from "../utils/validation";

const createConstraint = (numVariables) => ({
  coeffs: Array.from({ length: numVariables }, () => "0"),
  operator: "<=",
  rhs: "0",
});

function InputForm({ onSolve, isLoading }) {
  const [numVariables, setNumVariables] = useState(2);
  const [numConstraints, setNumConstraints] = useState(3);
  const [objectiveType, setObjectiveType] = useState("max");
  const [objectiveCoeffs, setObjectiveCoeffs] = useState(["0", "0"]);
  const [constraints, setConstraints] = useState([
    createConstraint(2),
    createConstraint(2),
    createConstraint(2),
  ]);
  const [validationError, setValidationError] = useState("");

  const resizeObjectiveCoeffs = (nextNumVariables) => {
    setObjectiveCoeffs((prev) =>
      Array.from({ length: nextNumVariables }, (_, idx) => prev[idx] ?? "0"),
    );
  };

  const resizeConstraintsByVariables = (nextNumVariables) => {
    setConstraints((prev) =>
      prev.map((constraint) => ({
        ...constraint,
        coeffs: Array.from({ length: nextNumVariables }, (_, idx) => constraint.coeffs[idx] ?? "0"),
      })),
    );
  };

  const resizeConstraintsByCount = (nextNumConstraints, nextNumVariables = numVariables) => {
    setConstraints((prev) => {
      if (nextNumConstraints > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: nextNumConstraints - prev.length }, () =>
            createConstraint(nextNumVariables),
          ),
        ];
      }
      return prev.slice(0, nextNumConstraints);
    });
  };

  const handleNumVariablesChange = (value) => {
    const next = Math.min(4, Math.max(1, Number(value || 1)));
    setNumVariables(next);
    resizeObjectiveCoeffs(next);
    resizeConstraintsByVariables(next);
  };

  const handleNumConstraintsChange = (value) => {
    const next = Math.min(20, Math.max(1, Number(value || 1)));
    setNumConstraints(next);
    resizeConstraintsByCount(next);
  };

  const variableLabels = useMemo(
    () => Array.from({ length: numVariables }, (_, idx) => `x${idx + 1}`),
    [numVariables],
  );

  const updateObjectiveCoeff = (index, value) => {
    setObjectiveCoeffs((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  };

  const updateConstraintCoeff = (constraintIndex, coeffIndex, value) => {
    setConstraints((prev) =>
      prev.map((constraint, idx) => {
        if (idx !== constraintIndex) {
          return constraint;
        }

        return {
          ...constraint,
          coeffs: constraint.coeffs.map((item, cIdx) => (cIdx === coeffIndex ? value : item)),
        };
      }),
    );
  };

  const updateConstraint = (constraintIndex, key, value) => {
    setConstraints((prev) =>
      prev.map((constraint, idx) => (idx === constraintIndex ? { ...constraint, [key]: value } : constraint)),
    );
  };

  const validatePayload = () => {
    if (numVariables < 1 || numVariables > 4) {
      return "Số ẩn số phải nằm trong khoảng từ 1 đến 4.";
    }

    for (let i = 0; i < objectiveCoeffs.length; i += 1) {
      if (!isRational(objectiveCoeffs[i])) {
        return `Hệ số hàm mục tiêu tại ${variableLabels[i]} không hợp lệ.`;
      }
    }

    for (let i = 0; i < constraints.length; i += 1) {
      for (let j = 0; j < constraints[i].coeffs.length; j += 1) {
        if (!isRational(constraints[i].coeffs[j])) {
          return `Hệ số ràng buộc ${i + 1} tại ${variableLabels[j]} không hợp lệ.`;
        }
      }

      if (!isRational(constraints[i].rhs)) {
        return `Giá trị vế phải của ràng buộc ${i + 1} không hợp lệ.`;
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errorText = validatePayload();
    if (errorText) {
      setValidationError(errorText);
      return;
    }

    setValidationError("");

    const payload = {
      objectiveType,
      numVariables,
      objectiveCoeffs: objectiveCoeffs.map(normalizeRational),
      constraints: constraints.map((constraint) => ({
        coeffs: constraint.coeffs.map(normalizeRational),
        operator: constraint.operator,
        rhs: normalizeRational(constraint.rhs),
      })),
    };

    await onSolve(payload);
  };

  return (
    <form className="solver-form" onSubmit={handleSubmit}>
      <h2>Input Problem</h2>

      <div className="grid-two">
        <label>
          Loại bài toán
          <select value={objectiveType} onChange={(event) => setObjectiveType(event.target.value)}>
            <option value="max">Maximize</option>
            <option value="min">Minimize</option>
          </select>
        </label>

        <label>
          Số ẩn số (1-4)
          <input
            type="number"
            min={1}
            max={4}
            value={numVariables}
            onChange={(event) => handleNumVariablesChange(event.target.value)}
          />
        </label>
      </div>

      <label>
        Số ràng buộc
        <input
          type="number"
          min={1}
          max={20}
          value={numConstraints}
          onChange={(event) => handleNumConstraintsChange(event.target.value)}
        />
      </label>

      <div className="section-title">Hàm mục tiêu</div>
      <div className="coeff-grid">
        {objectiveCoeffs.map((value, idx) => (
          <label key={`objective-${idx}`}>
            {variableLabels[idx]}
            <input
              value={value}
              onChange={(event) => updateObjectiveCoeff(idx, event.target.value)}
              placeholder="vd: 1/2"
            />
          </label>
        ))}
      </div>

      <div className="section-title">Ràng buộc</div>
      <div className="constraints-wrap">
        {constraints.map((constraint, constraintIndex) => (
          <div className="constraint-row" key={`constraint-${constraintIndex}`}>
            <div className="constraint-coeffs">
              {constraint.coeffs.map((value, coeffIndex) => (
                <label key={`constraint-${constraintIndex}-${coeffIndex}`}>
                  {variableLabels[coeffIndex]}
                  <input
                    value={value}
                    onChange={(event) =>
                      updateConstraintCoeff(constraintIndex, coeffIndex, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>

            <select
              value={constraint.operator}
              onChange={(event) => updateConstraint(constraintIndex, "operator", event.target.value)}
            >
              <option value="<=">&lt;=</option>
              <option value=">=">&gt;=</option>
            </select>

            <input
              className="rhs-input"
              value={constraint.rhs}
              onChange={(event) => updateConstraint(constraintIndex, "rhs", event.target.value)}
              placeholder="RHS"
            />
          </div>
        ))}
      </div>

      {validationError ? <p className="input-error">{validationError}</p> : null}

      <button type="submit" className="solve-btn" disabled={isLoading}>
        {isLoading ? <LoaderCircle className="spin" size={18} /> : <Play size={18} />}
        <span>{isLoading ? "Đang giải..." : "Giải bài toán"}</span>
      </button>
    </form>
  );
}

export default InputForm;
