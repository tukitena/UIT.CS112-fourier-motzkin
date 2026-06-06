# Bộ testcase cho Fourier-Motzkin Solver

File `api_testcases.json` gồm 20 testcase để kiểm thử API `POST /api/solve`.

## Phạm vi và giả định

- Số biến quyết định: từ 1 đến 4.
- Dạng bài toán: `max` hoặc `min`.
- Hệ số và vế phải: số nguyên hoặc phân số hợp lệ, ví dụ `2`, `-3`, `1/2`.
- Ràng buộc hợp lệ: `<=` hoặc `>=`.
- Frontend sẽ chuyển ô rỗng thành `"0"` trước khi gửi lên backend.
- Backend trả về một trong ba trạng thái: `optimal`, `infeasible`, `unbounded`.

## Nhóm testcase hợp lệ

| ID | Mục tiêu bao phủ | Kết quả mong đợi |
| --- | --- | --- |
| TC01 | Max 2 biến, ràng buộc `<=`, điều kiện không âm | `optimal`, `z* = 12`, `(x1, x2) = (4, 0)` |
| TC02 | Min 2 biến, ràng buộc `>=` | `optimal`, `z* = 5`, `(x1, x2) = (0, 5)` |
| TC03 | Hệ số phân số | `optimal`, `z* = 4/3`, `(x1, x2) = (2, 1)` |
| TC04 | Hệ số âm trong hàm mục tiêu | `optimal`, `z* = 6`, `(x1, x2) = (0, 3)` |
| TC05 | Hệ vô nghiệm do mâu thuẫn cận trên/cận dưới | `infeasible` |
| TC06 | Max không bị chặn trên | `unbounded` |
| TC07 | Min không bị chặn dưới | `unbounded` |
| TC08 | Ràng buộc dạng bằng mô phỏng bằng hai bất đẳng thức | `optimal`, `z* = 3`, `(x1, x2) = (1, 2)` |
| TC09 | Hàm mục tiêu có tất cả hệ số bằng 0 | `optimal`, `z* = 0`, `(x1, x2) = (0, 0)` |
| TC10 | Ràng buộc dư thừa | `optimal`, `z* = 4`, `(x1, x2) = (0, 4)` |
| TC11 | Số biến tối đa bằng 4 | `optimal`, `z* = 40`, `(x1, x2, x3, x4) = (0, 0, 0, 10)` |
| TC12 | Min với hệ số âm | `optimal`, `z* = -2`, `(x1, x2) = (2, 0)` |
| TC13 | Trộn cả `<=` và `>=` trong cùng bài toán | `optimal`, `z* = 9`, `(x1, x2) = (4, 1)` |

## Nhóm testcase không hợp lệ

| ID | Lỗi đầu vào | Kết quả mong đợi |
| --- | --- | --- |
| TC14 | `numVariables = 0` | HTTP `422` |
| TC15 | `numVariables = 5` | HTTP `422` |
| TC16 | `objectiveType` khác `max/min` | HTTP `422` |
| TC17 | `operator` khác `<=/>=` | HTTP `422` |
| TC18 | Số hệ số hàm mục tiêu không bằng `numVariables` | HTTP `400` |
| TC19 | Số hệ số ràng buộc không bằng `numVariables` | HTTP `400` |
| TC20 | Phân số không hợp lệ | HTTP `400` |

## Cách đánh giá đúng/sai

Với testcase hợp lệ, kết quả đúng khi:

- HTTP status là `200`.
- `solution.status` trùng với expected.
- Nếu `status = optimal`, `solution.objectiveValue` và các giá trị trong `solution.solution` trùng expected.
- Nếu `status = infeasible` hoặc `unbounded`, `objectiveValue` và `solution` là `null`.

Với testcase không hợp lệ, kết quả đúng khi HTTP status trùng expected. Nếu testcase có `detail` hoặc `detailContains`, nội dung lỗi phải trùng hoặc chứa chuỗi mong đợi.

## Cách chạy thủ công qua API

1. Chạy backend:

```bash
cd backend
uvicorn app.main:app --reload
```

2. Gọi từng `request` trong `api_testcases.json` đến:

```text
POST http://localhost:8000/api/solve
Content-Type: application/json
```

3. Đối chiếu response với trường `expected` của testcase tương ứng.
