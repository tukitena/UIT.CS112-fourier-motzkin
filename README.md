# Fourier-Motzkin Solver

Ứng dụng web giải bài toán quy hoạch tuyến tính bằng phương pháp khử biến Fourier-Motzkin. Repo gồm backend FastAPI để chuẩn hóa, giải và trả về các bước tính toán; frontend React/Vite để nhập bài toán và hiển thị kết quả bằng LaTeX.

## Tính năng

- Nhập bài toán `max` hoặc `min`.
- Hỗ trợ từ 1 đến 4 biến quyết định.
- Hỗ trợ ràng buộc dạng `<=` và `>=`.
- Hỗ trợ hệ số nguyên và phân số, ví dụ `2`, `-3`, `1/2`, `-5/4`.
- Tự hiểu ô nhập trống trên frontend là `0`.
- Chuẩn hóa bài toán về hệ bất phương trình trước khi giải.
- Khử biến bằng Fourier-Motzkin elimination.
- Trả về một trong ba trạng thái: `optimal`, `infeasible`, `unbounded`.
- Thế ngược để tìm nghiệm khi bài toán có nghiệm tối ưu.
- Hiển thị bài toán chuẩn hóa, từng bước khử, chặn trên/chặn dưới, kết quả và bước thế ngược bằng KaTeX.

## Công nghệ

Backend:

- Python
- FastAPI
- Pydantic
- `fractions.Fraction` để xử lý chính xác số nguyên và phân số

Frontend:

- React 19
- Vite 8
- Tailwind CSS 4 qua `@tailwindcss/vite`
- Axios
- KaTeX / react-katex
- lucide-react

## Cấu trúc thư mục

```text
fourier-motzkin-solver/
├── backend/
│   └── app/
│       ├── main.py                  # FastAPI app, CORS, / và /api/solve
│       ├── schemas.py               # Schema request/response bằng Pydantic
│       ├── formatter.py             # Format bài toán, bước giải và kết quả sang LaTeX
│       └── core/
│           ├── parser.py            # Parse số nguyên/phân số
│           ├── standardizer.py      # Chuẩn hóa bài toán
│           ├── fourier_motzkin.py   # Thuật toán khử Fourier-Motzkin
│           ├── optimizer.py         # Điều phối quá trình giải
│           └── back_substitution.py # Thế ngược tìm nghiệm
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/
│       │   ├── axiosClient.js       # Base URL backend
│       │   └── solverApi.js         # Gọi POST /api/solve
│       └── components/
│           ├── ProblemForm.jsx      # Form nhập bài toán
│           └── ResultPanel.jsx      # Hiển thị kết quả và các bước giải
├── testcases/
│   ├── README.md
│   ├── api_testcases.json
│   └── testcase.txt
└── README.md
```

## Cài đặt và chạy

### 1. Backend

Từ thư mục gốc:

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

Response mong đợi:

```json
{
  "message": "Fourier-Motzkin API is running smoothly!"
}
```

### 2. Frontend

Mở terminal khác, từ thư mục gốc:

```bash
cd frontend
npm install
npm run dev
```

Vite sẽ in URL frontend trên terminal, thường là:

```text
http://localhost:5173
```

Frontend gọi backend tại:

```text
http://localhost:8000
```

URL này được cấu hình trong `frontend/src/api/axiosClient.js`.

## API

### `POST /api/solve`

Giải một bài toán quy hoạch tuyến tính.

Request body:

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

Các trường chính:

| Trường | Ý nghĩa |
| --- | --- |
| `objectiveType` | Loại bài toán: `max` hoặc `min` |
| `numVariables` | Số biến quyết định, từ 1 đến 4 |
| `objectiveCoeffs` | Hệ số hàm mục tiêu, số lượng phải bằng `numVariables` |
| `constraints` | Danh sách ràng buộc |
| `coeffs` | Hệ số của một ràng buộc, số lượng phải bằng `numVariables` |
| `operator` | Toán tử ràng buộc: `<=` hoặc `>=` |
| `rhs` | Vế phải của ràng buộc |

Response body gồm:

- `normalizedProblem`: bài toán sau khi chuẩn hóa ở dạng LaTeX.
- `steps`: các bước khử biến Fourier-Motzkin, gồm chặn dưới, chặn trên và hệ sau khi khử.
- `solution`: trạng thái nghiệm, giá trị tối ưu, nghiệm, bước thế ngược và thông báo.

Ví dụ response rút gọn:

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
2. `standardizer.py` thêm biến `z`, chuẩn hóa hàm mục tiêu và đổi ràng buộc về dạng `<=`.
3. `optimizer.py` khử lần lượt các biến bằng Fourier-Motzkin.
4. `fourier_motzkin.py` ghép các bất phương trình có hệ số trái dấu để loại biến đang xét.
5. `optimizer.py` xác định trạng thái `optimal`, `infeasible` hoặc `unbounded`.
6. `back_substitution.py` thế ngược từ `z*` để chọn nghiệm tương ứng.
7. `formatter.py` chuyển dữ liệu trung gian và kết quả sang LaTeX cho frontend.

## Testcase

Thư mục `testcases/` chứa bộ testcase API:

- `testcases/api_testcases.json`: 20 testcase bao phủ bài toán hợp lệ, lỗi validate và lỗi parse phân số.
- `testcases/README.md`: mô tả phạm vi, expected result và cách kiểm thử thủ công.
- `testcases/testcase.txt`: ghi chú testcase dạng text.

Chạy backend rồi gửi từng `request` trong `api_testcases.json` đến:

```text
POST http://localhost:8000/api/solve
Content-Type: application/json
```

Đối chiếu response với trường `expected` của testcase tương ứng.

## Lệnh hữu ích

Frontend, chạy trong `frontend/`:

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

Backend, chạy trong `backend/`:

```bash
uvicorn app.main:app --reload
```

## Lưu ý

- Backend hiện chưa có file `requirements.txt`; cài thủ công các package cần thiết như phần hướng dẫn backend.
- Backend chỉ nhận số nguyên hoặc phân số hợp lệ cho hệ số và vế phải.
- Schema backend giới hạn `numVariables` trong khoảng `1..4`.
- Ràng buộc dạng bằng `=` chưa phải toán tử trực tiếp; có thể mô phỏng bằng hai ràng buộc `<=` và `>=`.
- Khi đổi port hoặc host backend, cập nhật `URL` trong `frontend/src/api/axiosClient.js`.
