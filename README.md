# Cổng tra cứu điểm học phần

Web app tra cứu điểm học phần cho sinh viên và quản lý điểm cho giảng viên.
React + Vite (SPA) ở frontend, Netlify Functions + Netlify Blobs ở backend —
deploy thẳng lên Netlify, không cần database riêng.

## Tính năng

**Sinh viên** — đăng nhập bằng `Mã sinh viên` / `Ngày sinh (YYYYMMDD)`:
- Xem 5 đầu điểm thành phần: TN (25%), SQL (25%), Chuyên cần (10%), TBKT (20%),
  BTTL (20%).
- Xem GPA (hệ 10, tính sẵn trong file — chỉ hiển thị), quy đổi sang **điểm chữ
  (F → A+)** và điểm hệ 4 theo thang PTIT.
- Xem trạng thái đủ điều kiện / cấm thi.

**Giảng viên** — đăng nhập bằng tài khoản quản lý (mặc định `VKH100880`):
- Upload file Excel để cập nhật toàn bộ điểm sinh viên.
- Dashboard thống kê: GPA trung bình, số SV đủ điều kiện, biểu đồ phân bố GPA và
  phân bố điểm chữ.
- Bảng tra cứu điểm toàn bộ SV (tìm kiếm theo mã/tên, lọc theo lớp).

## Chạy cục bộ

```bash
npm install
npm run dev        # cần Netlify CLI (netlify dev) để chạy cả functions
# hoặc chỉ frontend (API sẽ 404):
npm run dev:vite
```

> `npm run dev` dùng `netlify dev` để phục vụ cả SPA lẫn Functions + Blobs cục
> bộ. Cài Netlify CLI một lần: `npm i -g netlify-cli`.

Các lệnh khác:

```bash
npm run build      # tsc -b && vite build  → dist/
npm run typecheck  # kiểm tra kiểu (app + functions)
npm run preview    # xem thử bản build
```

## Biến môi trường

Đặt trong Netlify (Site settings → Environment variables), xem `.env.example`:

| Biến              | Mặc định     | Ý nghĩa                                  |
| ----------------- | ------------ | ---------------------------------------- |
| `INSTRUCTOR_USER` | `VKH100880`  | Tài khoản giảng viên                     |
| `INSTRUCTOR_PASS` | `VKH100880`  | Mật khẩu giảng viên                      |
| `AUTH_SECRET`     | (dev)        | Khóa ký token phiên — **bắt buộc đặt**   |

## Deploy lên Netlify

1. Đẩy repo lên GitHub, "Add new site → Import" trên Netlify (cấu hình build đã
   có sẵn trong `netlify.toml`).
2. Đặt `AUTH_SECRET` (và tùy chọn đổi `INSTRUCTOR_USER/PASS`).
3. Deploy. App chạy ngay với dữ liệu điểm gốc đã đóng gói sẵn
   (`netlify/functions/_data/seed.json`); giảng viên upload Excel để cập nhật.

## Định dạng file Excel khi upload

Trình đọc dò dòng tiêu đề chứa cột **`Mã sinh viên`** rồi ánh xạ các cột theo
tên (không phân biệt hoa/thường, dấu): `STT, Ca thi, Mã sinh viên, Họ và tên,
Điểm TN, Điểm SQL, Điểm tổng kết, Ngày sinh, Lớp hành chính, Lớp học phần, Trạng
thái thi, Chuyên cần, Bài tập thảo luận, Trung bình kiểm tra, GPA`. Đúng như file
`Tong_ket_diem_thi.xlsx` gốc.
