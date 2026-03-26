import { useState } from "react";
import { MathJax } from "better-react-mathjax";
import { ChevronDown } from "lucide-react";

function LatexList({ title, values }) {
  return (
    <div className="step-block">
      <h4>{title}</h4>
      {values.length === 0 ? (
        <p className="muted-text">Không có biểu thức ở bước này.</p>
      ) : (
        values.map((item, idx) => (
          <MathJax key={`${title}-${idx}`} dynamic>
            {`\\[${item}\\]`}
          </MathJax>
        ))
      )}
    </div>
  );
}

function StepAccordion({ steps }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="step-list">
      {steps.map((step, idx) => {
        const isOpen = idx === openIndex;

        return (
          <article className="step-item" key={`step-${idx}`}>
            <button
              type="button"
              className="step-header"
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
            >
              <span>
                Bước {idx + 1}: Khử biến
                <strong> {step.variable}</strong>
              </span>
              <ChevronDown className={isOpen ? "chevron open" : "chevron"} size={18} />
            </button>

            {isOpen ? (
              <div className="step-content">
                <LatexList title="Upper bounds" values={step.upperBoundsLatex || []} />
                <LatexList title="Lower bounds" values={step.lowerBoundsLatex || []} />
                <LatexList
                  title="Hệ sau khi loại biến"
                  values={step.eliminatedSystemLatex || []}
                />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

export default StepAccordion;
