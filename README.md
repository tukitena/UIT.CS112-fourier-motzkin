# Fourier-Motzkin Solver

Ứng dụng web giải bài toán quy hoạch tuyến tính bằng phương pháp khử biến Fourier-Motzkin. Dự án gồm backend FastAPI để chuẩn hóa, giải và trả về các bước tính toán; frontend React/Vite để nhập bài toán và hiển thị kết quả bằng LaTeX.

## Tính năng chính

- Nhập bài toán dạng `max` hoặc `min`.
- Hỗ trợ từ 1 đến 4 biến quyết định.
- Nhập hệ ràng buộc với toán tử `<=` hoặc `>=`.
- Hỗ trợ hệ số nguyên và phân số, ví dụ `2`, `-3`, `1/2`, `-5/4`.
- Chuẩn hóa bài toán về hệ bất phương trình.
- Khử biến bằng Fourier-Motzkin elimination.
- Phát hiện các trạng thái:
  - `optimal`: tìm được nghiệm tối ưu.
  - `infeasible`: bài toán không khả thi.
  - `unbounded`: bài toán không bị chặn.
- Thế ngược để tìm nghiệm tương ứng khi bài toán có nghiệm tối ưu.
- Hiển thị quá trình giải, chặn trên/chặn dưới và kết quả bằng KaTeX.

## Công nghệ sử dụng

### Backend

- Python
- FastAPI
- Pydantic
- `fractions.Fraction` để xử lý chính xác số nguyên và phân số.

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- KaTeX / react-katex

## Cấu trúc thư mục

```text
fourier-motzkin-solver/
├── backend/
│   └── app/
│       ├── main.py                  # FastAPI app và API /api/solve
│       ├── schemas.py               # Schema request/response
│       ├── formatter.py             # Format kết quả sang LaTeX
│       └── core/
│           ├── parser.py            # Parse số nguyên/phân số
│           ├── standardizer.py      # Chuẩn hóa bài toán
│           ├── fourier_motzkin.py   # Thuật toán khử Fourier-Motzkin
│           ├── optimizer.py         # Điều phối quá trình giải
│           └── back_substitution.py # Thế ngược tìm nghiệm
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── api/
│       │   ├── axiosClient.js
│       │   └── solverApi.js
│       └── components/
│           ├── ProblemForm.jsx      # Form nhập bài toán
│           └── ResultPanel.jsx      # Hiển thị kết quả
└── README.md
```

## Cài đặt và chạy dự án

### 1. Chạy backend

Từ thư mục gốc của dự án:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install fastapi uvicorn pydantic
uvicorn app.main:app --reload
```

Backend mặc định chạy tại:

```text
http://localhost:8000
```

Kiểm tra nhanh:

```text
GET http://localhost:8000/
```

Kết quả mong đợi:

```json
{
  "message": "Fourier-Motzkin API is running smoothly!"
}
```

### 2. Chạy frontend

Mở terminal khác, từ thư mục gốc của dự án:

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại địa chỉ Vite hiển thị trên terminal, thường là:

```text
http://localhost:5173
```

Frontend đang gọi backend tại:

```js
http://localhost:8000
```

Địa chỉ này được cấu hình trong `frontend/src/api/axiosClient.js`.

## API

### `POST /api/solve`

Giải một bài toán quy hoạch tuyến tính.

#### Request body

```json
{
  "objectiveType": "max",
  "numVariables": 2,
  "objectiveCoeffs": ["3", "2"],
  "constraints": [
    {
      "coeffs": ["1", "1"],
      "operator": "<=",
      "rhs": "4"
    },
    {
      "coeffs": ["1", "0"],
      "operator": ">=",
      "rhs": "0"
    },
    {
      "coeffs": ["0", "1"],
      "operator": ">=",
      "rhs": "0"
    }
  ]
}
```

#### Ý nghĩa các trường

| Trường | Ý nghĩa |
| --- | --- |
| `objectiveType` | Loại bài toán: `max` hoặc `min` |
| `numVariables` | Số biến, từ 1 đến 4 |
| `objectiveCoeffs` | Hệ số hàm mục tiêu |
| `constraints` | Danh sách ràng buộc |
| `coeffs` | Hệ số của một ràng buộc |
| `operator` | Toán tử ràng buộc: `<=` hoặc `>=` |
| `rhs` | Vế phải của ràng buộc |

#### Response body

API trả về:

- `normalizedProblem`: bài toán sau khi chuẩn hóa ở dạng LaTeX.
- `steps`: các bước khử biến Fourier-Motzkin.
- `solution`: trạng thái, giá trị tối ưu, nghiệm và các bước thế ngược.

Ví dụ cấu trúc response:

```json
{
  "normalizedProblem": {
    "objectiveLatex": "z - 3x_{1} - 2x_{2} = 0",
    "constraintsLatex": []
  },
  "steps": [],
  "solution": {
    "status": "optimal",
    "objectiveValue": "12",
    "objectiveValueLatex": "z^* = 12",
    "solution": {
      "x1": "4",
      "x2": "0"
    },
    "backSub": [],
    "message": "Tìm được nghiệm tối ưu thành công."
  }
}
```

## Luồng xử lý backend

1. `parser.py` chuyển chuỗi đầu vào thành `Fraction`.
2. `standardizer.py` thêm biến `z`, chuẩn hóa hàm mục tiêu và đổi mọi ràng buộc về dạng `<=`.
3. `optimizer.py` lần lượt khử các biến `x_n, x_{n-1}, ..., x_1`.
4. `fourier_motzkin.py` ghép các bất phương trình có hệ số dương và âm để loại biến đang xét.
5. `optimizer.py` kiểm tra hệ sau khử để xác định `optimal`, `infeasible` hoặc `unbounded`.
6. `back_substitution.py` thế ngược từ `z*` để chọn giá trị cho các biến.
7. `formatter.py` chuyển bài toán, các bước và kết quả sang LaTeX cho frontend.

## Ghi chú sử dụng

- Nếu ô nhập để trống ở frontend, giá trị sẽ được hiểu là `0`.
- Backend chỉ nhận hệ số ở dạng số nguyên hoặc phân số hợp lệ.
- Số biến tối đa hiện tại là 4 vì schema backend giới hạn `numVariables <= 4`.
- Khi đổi port backend, cần cập nhật `URL` trong `frontend/src/api/axiosClient.js`.

## Lệnh hữu ích

Trong thư mục `frontend`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Trong thư mục `backend`:

```bash
uvicorn app.main:app --reload
```
