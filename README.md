# 🚀 Hướng Dẫn Deploy (Triển Khai) GiaDinh EcoPulse

Ứng dụng **GiaDinh EcoPulse** được xây dựng dưới dạng **Single Page Application (SPA)** tĩnh, tiêu thụ dữ liệu trực tiếp từ API công khai của ThingSpeak qua giao thức HTTPS. Do đó, bạn không cần duy trì bất kỳ máy chủ backend nào và có thể triển khai lên internet **hoàn toàn miễn phí 100%**.

---

## Cách 1: Triển Khai Lên GitHub Pages (Khuyến Nghị - Tự Động & Miễn Phí)

Đây là phương pháp tốt nhất khi dự án được quản lý trên GitHub. Khi bạn đẩy code (`git push`), GitHub Actions sẽ tự động build và publish trang web.

### Các bước thực hiện:

1. **Khởi tạo git và push code lên GitHub repo**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: GiaDinh EcoPulse"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
   git push -u origin main
   ```

2. **Kích hoạt GitHub Pages trong Settings**:
   - Truy cập repo của bạn trên GitHub: `https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>/settings/pages`
   - Tại mục **Build and deployment > Source**, chọn: **GitHub Actions**.
   - Dự án đã tích hợp sẵn workflow tại [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Ngay sau khi push, GitHub Actions sẽ tự động kích hoạt tiến trình build và cấp cho bạn đường link truy cập công khai có dạng:
     `https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/`

---

## Cách 2: Triển Khai Lên Vercel (1 Cú Click / Nhanh Nhất)

Vercel cung cấp CDN toàn cầu tốc độ cực cao và tự động kích hoạt HTTPS.

### Cách A: Qua Giao Diện Web
1. Đăng nhập [vercel.com](https://vercel.com).
2. Nhấn **Add New... > Project** và import repository GitHub của bạn.
3. Vercel sẽ tự động phát hiện cấu hình **Vite**:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Nhấn **Deploy**. Sau ~30 giây, trang web sẽ có domain `.vercel.app`.

### Cách B: Qua Dòng Lệnh (CLI)
```bash
npx vercel
# Làm theo hướng dẫn đăng nhập và chọn Yes cho các cài đặt mặc định
```

---

## Cách 3: Triển Khai Lên Netlify

### Cách A: Kéo & Thả (Drag and Drop - Không Cần Cài Đặt Gì)
1. Chạy lệnh build trên máy tính của bạn:
   ```bash
   npm run build
   ```
2. Đăng nhập [app.netlify.com](https://app.netlify.com).
3. Vào mục **Sites**, kéo thả cả thư mục `dist/` vừa tạo vào trình duyệt. Netlify sẽ cấp ngay một đường link trực tuyến trong vòng vài giây.

### Cách B: Qua CLI
```bash
npx netlify deploy --prod --dir=dist
```

---

## Cách 4: Chạy Bằng Docker / Tự Host Trên VPS (Nginx)

Nếu bạn có máy chủ riêng (VPS Ubuntu/Debian) hoặc muốn chạy dưới dạng container:

1. **Build Docker Image**:
   ```bash
   docker build -t giadinh-ecopulse:latest .
   ```

2. **Chạy Container**:
   ```bash
   docker run -d -p 8080:80 --name ecopulse giadinh-ecopulse:latest
   ```
   Bây giờ bạn có thể truy cập `http://localhost:8080` hoặc cấu hình Reverse Proxy domain trỏ về cổng 8080.

---

## Kiểm Tra Tại Local (Xem Thử Trước Khi Deploy)

- **Chạy môi trường phát triển (Dev Server)**:
  ```bash
  npm run dev
  ```
- **Build và xem thử bản đóng gói (Production Preview)**:
  ```bash
  npm run build
  npm run preview
  ```
