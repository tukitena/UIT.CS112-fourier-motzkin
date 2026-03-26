import { useState } from "react";
import { Calculator, CircleAlert } from "lucide-react";
import InputForm from "./components/InputForm";
import ResultDisplay from "./components/ResultDisplay";
import { solveLP } from "./services/api";

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSolve = async (payload) => {
    setIsLoading(true);
    setError("");

    try {
      const data = await solveLP(payload);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(typeof err === "string" ? err : "Đã xảy ra lỗi không xác định.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-glow page-glow-left" />
      <div className="page-glow page-glow-right" />

      <main className="layout">
        <section className="panel intro-panel card-enter">
          <div className="headline-wrap">
            <Calculator size={24} />
            <h1>Fourier-Motzkin LP Solver</h1>
          </div>
          <p>
            Nhập hàm mục tiêu và hệ bất đẳng thức để giải bài toán quy hoạch tuyến tính.
            Kết quả sẽ hiển thị theo từng bước loại biến và thế ngược.
          </p>
        </section>

        <section className="panel form-panel card-enter-delay-1">
          <InputForm onSolve={handleSolve} isLoading={isLoading} />
        </section>

        <section className="panel result-panel card-enter-delay-2">
          {error ? (
            <div className="error-box" role="alert">
              <CircleAlert size={18} />
              <span>{error}</span>
            </div>
          ) : null}
          <ResultDisplay data={result} isLoading={isLoading} />
        </section>
      </main>
    </div>
  );
}

export default App;
