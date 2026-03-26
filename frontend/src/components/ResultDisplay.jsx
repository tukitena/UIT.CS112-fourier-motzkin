import { MathJax } from "better-react-mathjax";
import { LoaderCircle, CircleCheckBig, OctagonX, AlertTriangle } from "lucide-react";
import StepAccordion from "./StepAccordion";
import { fractionToLatex, variableToLatex } from "../utils/latex";

const STATUS_META = {
  optimal: { icon: CircleCheckBig, label: "Optimal", className: "status-optimal" },
  infeasible: { icon: OctagonX, label: "Infeasible", className: "status-infeasible" },
  unbounded: { icon: AlertTriangle, label: "Unbounded", className: "status-unbounded" },
};

function ResultDisplay({ data, isLoading }) {
  if (isLoading) {
    return (
      <div className="loading-wrap">
        <LoaderCircle className="spin" size={22} />
        <span>Đang chạy Fourier-Motzkin, vui lòng chờ...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="placeholder-wrap">
        <h2>Result Panel</h2>
        <p>
          Kết quả sẽ xuất hiện ở đây sau khi bạn gửi bài toán lên backend.
          Panel này bao gồm hệ chuẩn hóa, các bước khử biến và nghiệm cuối cùng.
        </p>
      </div>
    );
  }

  const { normalizedProblem, steps, solution } = data;
  const statusMeta = STATUS_META[solution?.status] ?? STATUS_META.unbounded;
  const StatusIcon = statusMeta.icon;
  const solutionPairs = Object.entries(solution?.solution || {});

  return (
    <div className="result-content">
      <h2>Result Panel</h2>

      <div className={`status-pill ${statusMeta.className}`}>
        <StatusIcon size={16} />
        <strong>{statusMeta.label}</strong>
        <span>{solution?.message}</span>
      </div>

      {normalizedProblem?.objectiveLatex ? (
        <section>
          <h3>Hệ chuẩn hóa</h3>
          <MathJax dynamic>{`\\[${normalizedProblem.objectiveLatex}\\]`}</MathJax>
          {(normalizedProblem.constraintsLatex || []).map((item, idx) => (
            <MathJax key={`constraint-latex-${idx}`} dynamic>
              {`\\[${item}\\]`}
            </MathJax>
          ))}
        </section>
      ) : null}

      {solution?.objectiveValueLatex ? (
        <section>
          <h3>Giá trị hàm mục tiêu</h3>
          <MathJax dynamic>{`\\[${solution.objectiveValueLatex}\\]`}</MathJax>
        </section>
      ) : null}

      {solutionPairs.length > 0 ? (
        <section>
          <h3>Kết quả thế ngược</h3>
          <div className="solution-chips">
            {solutionPairs.map(([name, value]) => (
              <MathJax key={name} dynamic>
                {`\\(${variableToLatex(name)} = ${fractionToLatex(value)}\\)`}
              </MathJax>
            ))}
          </div>
        </section>
      ) : null}

      {Array.isArray(steps) && steps.length > 0 ? (
        <section>
          <h3>Các bước Fourier-Motzkin</h3>
          <StepAccordion steps={steps} />
        </section>
      ) : null}
    </div>
  );
}

export default ResultDisplay;
