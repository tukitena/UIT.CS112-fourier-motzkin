import { useState } from 'react';
import ProblemForm from './components/ProblemForm';
import ResultPanel from './components/ResultPanel'; // Import thêm dòng này
import { solverApi } from './api/solverApi';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSolve = async (problemData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await solverApi.solveProblem(problemData);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-8">
          Fourier-Motzkin Solver
        </h1>

        {/* Input Form */}
        <ProblemForm onSubmit={handleSolve} isLoading={loading} />

        {/* Display Error */}
        {error && (
          <div className="max-w-3xl mx-auto mt-6 p-4 bg-red-100 text-red-700 rounded-lg shadow">
            <strong>Lỗi: </strong> {error}
          </div>
        )}

        {/* Display Result */}
        {/* Truyền toàn bộ object result vào ResultPanel để xử lý hiển thị LaTeX */}
        {result && (
          <div className="mt-8">
            <ResultPanel result={result} />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;