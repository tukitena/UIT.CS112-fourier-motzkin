import React, { useState } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

export default function ProblemForm({ onSubmit, isLoading }) {
  // Backend giới hạn numVariables từ 1 đến 4
  const [numVars, setNumVars] = useState(3); 
  const [objType, setObjType] = useState('max');
  
  // Khởi tạo mảng rỗng, nếu người dùng không nhập thì ngầm hiểu là 0
  const [objCoeffs, setObjCoeffs] = useState(Array(3).fill(''));
  const [constraints, setConstraints] = useState([
    { coeffs: Array(3).fill(''), operator: '>=', rhs: '' }
  ]);

  // Cập nhật số lượng biến (tự động resize mảng)
  const handleNumVarsChange = (e) => {
    let newNum = parseInt(e.target.value) || 1;
    if (newNum < 1) newNum = 1;
    if (newNum > 4) newNum = 4; // Giới hạn tối đa 4 biến
    
    setNumVars(newNum);
    setObjCoeffs(prev => Array.from({ length: newNum }, (_, i) => prev[i] || ''));
    setConstraints(prev => prev.map(c => ({
      ...c,
      coeffs: Array.from({ length: newNum }, (_, i) => c.coeffs[i] || '')
    })));
  };

  const handleObjCoeffChange = (index, value) => {
    const newCoeffs = [...objCoeffs];
    newCoeffs[index] = value;
    setObjCoeffs(newCoeffs);
  };

  const handleConstraintChange = (constIndex, field, value, coeffIndex = null) => {
    const newConstraints = [...constraints];
    if (field === 'coeffs') {
      newConstraints[constIndex].coeffs[coeffIndex] = value;
    } else {
      newConstraints[constIndex][field] = value;
    }
    setConstraints(newConstraints);
  };

  const addConstraint = () => {
    setConstraints([
      ...constraints,
      { coeffs: Array(numVars).fill(''), operator: '>=', rhs: '' }
    ]);
  };

  const removeConstraint = (index) => {
    setConstraints(constraints.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Định dạng lại dữ liệu: thay thế chuỗi rỗng bằng '0' trước khi gửi
    const payload = {
      objectiveType: objType,
      numVariables: numVars,
      objectiveCoeffs: objCoeffs.map(c => c.trim() === '' ? '0' : c),
      constraints: constraints.map(c => ({
        coeffs: c.coeffs.map(coeff => coeff.trim() === '' ? '0' : coeff),
        operator: c.operator,
        rhs: c.rhs.trim() === '' ? '0' : c.rhs
      }))
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg space-y-8">
      
      {/* Header & Chọn số biến */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt bài toán</h2>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <label className="font-medium text-gray-700">Số lượng biến:</label>
          <input 
            type="number" 
            min="1" max="4" 
            value={numVars}
            onChange={handleNumVarsChange}
            className="w-16 border border-gray-300 p-2 rounded-md text-center focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Hàm mục tiêu (Z) */}
      <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-4 flex items-center">
          Hàm mục tiêu <InlineMath math="(z)" />
        </h3>
        <div className="flex items-center flex-wrap gap-3">
          {/* Dropdown / Scroller chọn Max/Min */}
          <select 
            value={objType}
            onChange={(e) => setObjType(e.target.value)}
            className="border border-gray-300 p-2 rounded-md bg-white font-bold text-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none cursor-pointer"
          >
            <option value="max">Maximize</option>
            <option value="min">Minimize</option>
          </select>
          
          <span className="font-bold text-xl mx-2">=</span>
          
          {objCoeffs.map((coeff, i) => (
            <div key={i} className="flex items-center space-x-2">
              <input 
                type="text" 
                value={coeff}
                onChange={(e) => handleObjCoeffChange(i, e.target.value)}
                placeholder="0" 
                className="w-16 border border-gray-300 p-2 rounded-md text-center focus:ring-2 focus:ring-blue-400 placeholder-gray-400" 
              />
              <span className="text-lg">
                <InlineMath math={`x_{${i + 1}}`} />
              </span>
              {i < numVars - 1 && <span className="font-bold text-gray-500 mx-1">+</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Hệ ràng buộc */}
      <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-700 mb-4">Hệ ràng buộc (Constraints)</h3>
        
        <div className="space-y-4">
          {constraints.map((constraint, constIndex) => (
            <div key={constIndex} className="flex items-center flex-wrap gap-2 bg-white p-3 rounded-md border shadow-sm">
              
              {/* Vòng lặp render các biến trong 1 ràng buộc */}
              {constraint.coeffs.map((coeff, coeffIndex) => (
                <div key={coeffIndex} className="flex items-center space-x-2">
                  <input 
                    type="text" 
                    value={coeff}
                    onChange={(e) => handleConstraintChange(constIndex, 'coeffs', e.target.value, coeffIndex)}
                    placeholder="0" 
                    className="w-16 border border-gray-300 p-2 rounded-md text-center focus:ring-2 focus:ring-green-400 placeholder-gray-400" 
                  />
                  <span className="text-lg">
                    <InlineMath math={`x_{${coeffIndex + 1}}`} />
                  </span>
                  {coeffIndex < numVars - 1 && <span className="font-bold text-gray-500 mx-1">+</span>}
                </div>
              ))}
              
              {/* Operator (Mặc định là >=) */}
              <select 
                value={constraint.operator}
                onChange={(e) => handleConstraintChange(constIndex, 'operator', e.target.value)}
                className="border border-gray-300 p-2 rounded-md bg-white font-bold ml-2 focus:ring-2 focus:ring-green-400"
              >
                <option value=">=">&ge;</option>
                <option value="<=">&le;</option>
              </select>

              {/* Right Hand Side (RHS) */}
              <input 
                type="text" 
                value={constraint.rhs}
                onChange={(e) => handleConstraintChange(constIndex, 'rhs', e.target.value)}
                placeholder="0" 
                className="w-20 border border-gray-300 p-2 rounded-md text-center ml-2 focus:ring-2 focus:ring-green-400 placeholder-gray-400" 
              />

              {/* Nút xóa ràng buộc */}
              {constraints.length > 1 && (
                <button 
                  type="button"
                  onClick={() => removeConstraint(constIndex)}
                  className="ml-auto text-red-500 hover:text-red-700 px-2 py-1 font-bold rounded"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        
        <button 
          type="button"
          onClick={addConstraint}
          className="mt-4 text-sm px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition-colors"
        >
          + Thêm ràng buộc
        </button>
      </div>

      <button 
        type="submit" 
        disabled={isLoading}
        className={`w-full py-4 text-white font-bold rounded-lg shadow-md transition-colors text-lg
          ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
      >
        {isLoading ? 'Đang giải...' : 'Giải bài toán'}
      </button>

    </form>
  );
}