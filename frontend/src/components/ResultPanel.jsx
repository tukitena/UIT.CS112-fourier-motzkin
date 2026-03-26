import React from 'react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function ResultPanel({ result }) {
  if (!result) return null;

  const { normalizedProblem, steps, solution } = result; //

  // Xác định màu sắc dựa trên trạng thái nghiệm
  const statusColor = 
    solution.status === 'optimal' ? 'bg-green-50 border-green-500 text-green-800' :
    solution.status === 'infeasible' ? 'bg-red-50 border-red-500 text-red-800' :
    'bg-yellow-50 border-yellow-500 text-yellow-800';

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-10 pb-20">
      
      {/* 1. KẾT LUẬN CHÍNH */}
      <div className={`p-6 rounded-xl border-l-4 shadow-md ${statusColor}`}>
        <h2 className="text-2xl font-bold mb-2">Kết quả: {solution.message}</h2>
        
        {solution.status === 'optimal' && (
          <div className="mt-4 bg-white p-4 rounded-lg border border-opacity-50">
            <h3 className="font-semibold mb-2">Giá trị mục tiêu tối ưu:</h3>
            <div className="text-xl overflow-x-auto text-center py-2">
              <BlockMath math={solution.objectiveValueLatex} /> {/* */}
            </div>
            
            <h3 className="font-semibold mt-4 mb-2">Nghiệm của bài toán:</h3>
            <div className="flex flex-wrap gap-6 justify-center text-lg mt-2">
              {solution.solution && Object.entries(solution.solution).map(([key, val]) => (
                <div key={key} className="bg-gray-100 px-4 py-2 rounded-md shadow-sm">
                  {/* Chuyển x1 thành x_{1} để render LaTeX đẹp */}
                  <InlineMath math={`${key.replace(/(\d+)/, '_{$1}')} = ${val}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. BÀI TOÁN DẠNG CHUẨN */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
          Bước 1: Chuyển về dạng chuẩn
        </h2>
        <div className="overflow-x-auto">
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-600">Mục tiêu:</span>
            <InlineMath math={normalizedProblem.objectiveLatex} /> {/* */}
          </div>
          <div className="mt-4">
            <span className="font-semibold text-gray-600">Hệ ràng buộc:</span>
            <div className="mt-2 pl-4 border-l-2 border-gray-300 space-y-2">
              {normalizedProblem.constraintsLatex.map((eq, idx) => (
                <div key={idx}><BlockMath math={eq} /></div> //
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CÁC BƯỚC KHỬ FOURIER-MOTZKIN */}
      <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">
          Bước 2: Quá trình khử biến (Fourier-Motzkin Elimination)
        </h2>
        
        {steps.length === 0 ? (
          <p className="text-gray-500 italic">Không có bước khử nào được thực hiện.</p>
        ) : (
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
                  <span className="bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm mr-2">
                    {index + 1}
                  </span>
                  Khử biến <span className="mx-1"><InlineMath math={step.variable} /></span> {/* */}
                </h3>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {/* Chặn dưới */}
                  <div className="bg-white p-3 rounded shadow-sm border border-orange-100">
                    <h4 className="font-semibold text-orange-600 text-sm mb-2">Chặn dưới (Lower Bounds)</h4>
                    {step.lowerBoundsLatex.length > 0 ? ( //
                      step.lowerBoundsLatex.map((lb, i) => <div key={i}><BlockMath math={lb} /></div>)
                    ) : (
                      <span className="text-gray-400 text-sm italic">Không có</span>
                    )}
                  </div>

                  {/* Chặn trên */}
                  <div className="bg-white p-3 rounded shadow-sm border border-indigo-100">
                    <h4 className="font-semibold text-indigo-600 text-sm mb-2">Chặn trên (Upper Bounds)</h4>
                    {step.upperBoundsLatex.length > 0 ? ( //
                      step.upperBoundsLatex.map((ub, i) => <div key={i}><BlockMath math={ub} /></div>)
                    ) : (
                      <span className="text-gray-400 text-sm italic">Không có</span>
                    )}
                  </div>
                </div>

                {/* Hệ sau khi khử */}
                <div className="bg-white p-3 rounded shadow-sm border border-gray-200">
                  <h4 className="font-semibold text-gray-700 text-sm mb-2">Hệ bất phương trình sau khi khử:</h4>
                  {step.eliminatedSystemLatex.length > 0 ? ( //
                    <div className="space-y-1">
                      {step.eliminatedSystemLatex.map((eq, i) => (
                        <div key={i}><BlockMath math={eq} /></div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm italic">Hệ rỗng (đã khử hết)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}