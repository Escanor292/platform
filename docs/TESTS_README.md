# Hệ Thống Kiểm Thử Tự Động

Hệ thống kiểm thử được xây dựng dựa trên bảng kiểm thử giao diện và chức năng, sử dụng Jest và React Testing Library.

## 📋 Cấu Trúc Thư Mục

```
__tests__/
├── ui/                     # Kiểm thử giao diện
│   └── interface.test.tsx  # Test cases cho UI components
├── functional/             # Kiểm thử chức năng
│   └── features.test.tsx   # Test cases cho các chức năng
├── integration/            # Kiểm thử tích hợp
│   └── stats.test.tsx      # Test tích hợp API và components
├── utils/                  # Utilities cho testing
│   └── test-utils.tsx      # Helper functions và mock data
├── reports/                # Tạo báo cáo
│   └── test-report-generator.ts
├── run-tests-and-report.ts # Test runner chính
└── README.md              # Tài liệu này
```

## 🚀 Cách Sử Dụng

### Chạy Tất Cả Tests

```bash
# Chạy tất cả tests và tạo báo cáo
npm run test:all

# Hoặc chỉ chạy tests
npm test
```

### Chạy Tests Theo Loại

```bash
# Kiểm thử giao diện
npm run test:ui

# Kiểm thử chức năng  
npm run test:functional

# Kiểm thử tích hợp
npm run test:integration
```

### Chạy Tests Với Watch Mode

```bash
npm run test:watch
```

### Tạo Coverage Report

```bash
npm run test:coverage
```

## 📊 Báo Cáo Kiểm Thử

Sau khi chạy `npm run test:all`, hệ thống sẽ tạo các báo cáo trong thư mục `test-reports/`:

- `test-report.html` - Báo cáo HTML với giao diện đẹp
- `test-report.md` - Báo cáo Markdown
- `test-report.json` - Báo cáo JSON cho CI/CD

## 🧪 Test Cases Dựa Trên Bảng Kiểm Thử

### Kiểm Thử Giao Diện

| ID  | Nội dung kiểm thử | Đầu ra | Thực tế | Pass/Fail |
|-----|-------------------|---------|---------|-----------|
| S01 | Màn hình Trang chủ hiển thị đầy đủ theo thiết kế, không sai chính tả | Đầy đủ, không sai chính tả | Đầy đủ, không sai chính tả | Pass |
| S02 | Màn hình giới thiệu hiển thị đầy đủ theo thiết kế, không sai chính tả | Đầy đủ, không sai chính tả | Đầy đủ, Có lỗi chính tả ở .... | Fail |

### Kiểm Thử Chức Năng

| ID  | Nội dung kiểm thử | Đầu ra | Thực tế | Pass/Fail |
|-----|-------------------|---------|---------|-----------|
| F01 | Chức năng đăng xuất | Đăng xuất thành công | Đăng xuất thành công | Pass |
| F02 | Menu dropdown hiển thị | Hiển thị đúng menu | Hiển thị đúng menu | Pass |

## 🔧 Cấu Hình

### Jest Configuration

File `jest.config.js` chứa cấu hình Jest:
- Test environment: jsdom
- Setup file: jest.setup.js
- Module mapping cho alias @/
- Coverage settings

### Mock Setup

File `jest.setup.js` chứa các mock cần thiết:
- next/navigation
- next-auth/react  
- sonner (toast notifications)
- window.matchMedia

## 📝 Viết Test Cases Mới

### 1. Test Giao Diện

```typescript
import { render, screen } from '@testing-library/react'
import Component from '@/components/Component'

test('Kiểm tra component hiển thị đúng', () => {
  render(<Component />)
  
  expect(screen.getByText('Expected Text')).toBeInTheDocument()
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

### 2. Test Chức Năng

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('Kiểm tra chức năng click button', async () => {
  const user = userEvent.setup()
  render(<Component />)
  
  const button = screen.getByRole('button')
  await user.click(button)
  
  expect(mockFunction).toHaveBeenCalled()
})
```

### 3. Test Tích Hợp API

```typescript
import { render, screen, waitFor } from '@testing-library/react'

test('Kiểm tra tích hợp API', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => mockData
  })
  
  render(<Component />)
  
  await waitFor(() => {
    expect(screen.getByText('Data from API')).toBeInTheDocument()
  })
})
```

## 🎯 Best Practices

1. **Tên test rõ ràng**: Sử dụng tiếng Việt để mô tả test case
2. **Mock dependencies**: Mock tất cả external dependencies
3. **Test user behavior**: Test theo hành vi người dùng, không phải implementation
4. **Async testing**: Sử dụng waitFor cho async operations
5. **Cleanup**: Jest tự động cleanup, nhưng clear mocks trong beforeEach

## 🐛 Troubleshooting

### Lỗi thường gặp:

1. **Module not found**: Kiểm tra module mapping trong jest.config.js
2. **Mock không hoạt động**: Đảm bảo mock được setup trong jest.setup.js
3. **Async test timeout**: Tăng timeout hoặc kiểm tra waitFor conditions
4. **CSS/Style issues**: Sử dụng jsdom environment và mock CSS modules nếu cần

### Debug tests:

```bash
# Chạy test với debug info
npm test -- --verbose

# Chạy một test file cụ thể
npm test -- interface.test.tsx

# Chạy test với watch mode để debug
npm run test:watch
```

## 📚 Tài Liệu Tham Khảo

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🔄 CI/CD Integration

Để tích hợp vào CI/CD pipeline:

```yaml
# GitHub Actions example
- name: Run Tests
  run: npm run test:all

- name: Upload Test Reports
  uses: actions/upload-artifact@v2
  with:
    name: test-reports
    path: test-reports/
```