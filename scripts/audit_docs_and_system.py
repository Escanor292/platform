from __future__ import annotations

import hashlib
import re
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {"node_modules", ".next", ".git", ".turbo", "dist", "build"}
DOC_SUFFIXES = {".md", ".txt"}

def rel(path: Path) -> str:
    return path.relative_to(ROOT).as_posix()

def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")

def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True, stderr=subprocess.DEVNULL).strip()

def tracked(path: str) -> bool:
    try:
        return bool(subprocess.run(["git", "ls-files", "--error-unmatch", path], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0)
    except Exception:
        return False

def category(path: str) -> str:
    if path == "docs/archive/LEGACY_MARKDOWN.md" or path.startswith("docs/archive/"):
        return "archive"
    if path.startswith("docs/system-map/") or path == "docs/README.md":
        return "active-documentation"
    if path.startswith("docs/"):
        return "legacy-or-specialized-docs"
    if path.startswith("src/"):
        return "source-adjacent-documentation"
    if path.startswith("scripts/"):
        return "script-or-fixture-documentation"
    return "root-or-other"

def headings(text: str) -> list[str]:
    return [line.strip() for line in text.splitlines() if re.match(r"^#{1,6}\s+", line)]

def marker_count(text: str, marker: str) -> int:
    return len(re.findall(re.escape(marker), text, flags=re.I))

def normalize_path(value: str) -> str:
    value = value.strip().strip("`'\".,:;()[]")
    value = value.replace("\\", "/")
    while value.startswith("./"):
        value = value[2:]
    return value

paths = sorted(
    p for p in ROOT.rglob("*")
    if p.is_file() and p.suffix.lower() in DOC_SUFFIXES and not any(part in EXCLUDED for part in p.parts)
)
records = []
for path in paths:
    text = read_text(path)
    path_rel = rel(path)
    records.append({
        "path": path_rel,
        "bytes": path.stat().st_size,
        "lines": len(text.splitlines()),
        "sha256": hashlib.sha256(text.encode()).hexdigest(),
        "category": category(path_rel),
        "headings": headings(text),
        "text": text,
    })

# Find likely source paths and environment names mentioned by documentation.
source_root = ROOT / "src"
source_paths = {rel(p) for p in source_root.rglob("*") if p.is_file() and not any(part in EXCLUDED for part in p.parts)}
all_repo_paths = {rel(p) for p in ROOT.rglob("*") if p.is_file() and not any(part in EXCLUDED for part in p.parts)}
path_mentions: Counter[str] = Counter()
missing_mentions: Counter[str] = Counter()
path_pattern = re.compile(r"(?<![A-Za-z0-9_./-])((?:src|prisma|scripts|docs)/[A-Za-z0-9_./\[\]-]+\.(?:tsx?|jsx?|prisma|sql|js|mjs|cjs|md|txt|json))(?![A-Za-z0-9_./-])")
for record in records:
    for mention in path_pattern.findall(record["text"]):
        mention = normalize_path(mention)
        path_mentions[mention] += 1
        if mention not in all_repo_paths:
            missing_mentions[mention] += 1

# High-level current-system inventory.
route_paths = sorted(
    rel(p) for p in (ROOT / "src/app/api").rglob("route.ts")
    if p.is_file()
)
page_paths = sorted(
    rel(p) for p in (ROOT / "src/app").rglob("page.tsx")
    if p.is_file()
)
component_paths = sorted(
    rel(p) for p in (ROOT / "src/components").rglob("*.tsx")
    if p.is_file()
)
model_names = []
schema_path = ROOT / "prisma/schema.prisma"
if schema_path.exists():
    model_names = re.findall(r"^model\s+(\w+)", read_text(schema_path), flags=re.M)
    enum_names = re.findall(r"^enum\s+(\w+)", read_text(schema_path), flags=re.M)
else:
    enum_names = []

git_head = git("rev-parse", "HEAD")
origin_head = git("rev-parse", "origin/main")
branch = git("branch", "--show-current")

out: list[str] = []
out.append("# Audit Markdown, TXT và đối chiếu toàn bộ hệ thống")
out.append("")
out.append("> Báo cáo được sinh tự động từ working tree và source hiện tại. Tài liệu mô tả lịch sử chỉ có giá trị tham khảo; nguồn sự thật là mã nguồn, Prisma schema, migrations, package.json và cấu hình runtime.")
out.append("")
out.append(f"- Thời điểm audit: 2026-08-22 (UTC snapshot của phiên làm việc)")
out.append(f"- Branch: `{branch}`; HEAD: `{git_head}`; `origin/main`: `{origin_head}`")
out.append(f"- Tổng file tài liệu ngoài dependency/build: **{len(records)}** ({sum(1 for r in records if r['path'].lower().endswith('.md'))} Markdown, {sum(1 for r in records if r['path'].lower().endswith('.txt'))} TXT).")
out.append("")
out.append("## 1. Kết luận nhanh")
out.append("")
out.append("Audit phân biệt ba nhóm. Bộ `docs/system-map/` là tài liệu hoạt động cần đọc trước. `docs/archive/LEGACY_MARKDOWN.md` là kho lịch sử bảo toàn nội dung, không phải nguồn sự thật hiện hành. Các file `.md` hoặc `.txt` còn nằm gần source, trong script, fixture hoặc thư mục đặc thù phải được kiểm tra theo việc code có đọc trực tiếp chúng hay không trước khi xóa.")
out.append("")
out.append("Các dấu hiệu lỗi thời thường gặp được kiểm tra gồm mô tả framework không khớp source, tên route/model không còn tồn tại, provider thanh toán cũ được mô tả như đang hoạt động, và hướng dẫn triển khai dùng công cụ hoặc biến môi trường của template khác. Những phát hiện cụ thể nằm ở các mục 3–6 bên dưới.")
out.append("")
out.append("## 2. Bản đồ source hiện tại")
out.append("")
out.append("| Thành phần | Số lượng / trạng thái |")
out.append("|---|---:|")
out.append(f"| API route (`src/app/api/**/route.ts`) | {len(route_paths)} |")
out.append(f"| Page (`src/app/**/page.tsx`) | {len(page_paths)} |")
out.append(f"| React component (`src/components/**/*.tsx`) | {len(component_paths)} |")
out.append(f"| Prisma model | {len(model_names)} |")
out.append(f"| Prisma enum | {len(enum_names)} |")
out.append(f"| Prisma schema | {'có' if schema_path.exists() else 'thiếu'} |")
out.append("")
out.append("### Prisma models hiện tại")
out.append("")
out.append(", ".join(f"`{name}`" for name in model_names) or "Không đọc được model.")
out.append("")
out.append("### Prisma enums hiện tại")
out.append("")
out.append(", ".join(f"`{name}`" for name in enum_names) or "Không đọc được enum.")
out.append("")
out.append("### API routes hiện tại")
out.append("")
for path in route_paths:
    out.append(f"- `{path}`")
out.append("")
out.append("## 3. Phân loại file MD/TXT")
out.append("")
category_counts = Counter(r["category"] for r in records)
out.append("| Nhóm | Số file | Quy tắc xử lý |")
out.append("|---|---:|---|")
out.append(f"| Tài liệu hoạt động | {category_counts['active-documentation']} | Cập nhật theo source hiện tại và dùng làm điểm tra cứu chính |")
out.append(f"| Archive lịch sử | {category_counts['archive']} | Giữ để tra cứu, không dùng làm nguồn sự thật |")
out.append(f"| Tài liệu docs cũ/chuyên đề | {category_counts['legacy-or-specialized-docs']} | Chỉ giữ nếu có thông tin riêng hoặc còn được tham chiếu |")
out.append(f"| Tài liệu cạnh source | {category_counts['source-adjacent-documentation']} | Không xóa nếu code/tool có thể dùng trực tiếp |")
out.append(f"| Script/fixture/khác | {category_counts['script-or-fixture-documentation'] + category_counts['root-or-other']} | Kiểm tra theo cách được code sử dụng |")
out.append("")
out.append("### Danh mục từng file")
out.append("")
out.append("| File | Nhóm | Dòng | Kích thước | SHA-256 rút gọn | Tiêu đề đầu |")
out.append("|---|---|---:|---:|---|---|")
for r in records:
    first_heading = r["headings"][0].replace("|", "\\|") if r["headings"] else "(không có tiêu đề)"
    out.append(f"| `{r['path']}` | {r['category']} | {r['lines']} | {r['bytes']} B | `{r['sha256'][:12]}` | {first_heading[:110]} |")
out.append("")
out.append("## 4. Trùng lặp và nội dung cần ưu tiên")
out.append("")
by_hash: dict[str, list[str]] = {}
for r in records:
    by_hash.setdefault(r["sha256"], []).append(r["path"])
exact = [paths for paths in by_hash.values() if len(paths) > 1]
if exact:
    out.append("### Trùng hoàn toàn")
    for group in exact:
        out.append("- " + ", ".join(f"`{p}`" for p in group))
else:
    out.append("Không có file MD/TXT trùng hoàn toàn ngoài các bản sao đã được gộp trước đó.")
out.append("")
out.append("### Nội dung chồng lặp nhưng không giống hệt")
out.append("")
out.append("Các nhóm nội dung chồng lặp chính đã được quy về tài liệu hoạt động như sau:")
out.append("")
out.append("| Chủ đề | Tài liệu hoạt động ưu tiên | Nguồn lịch sử cần tham khảo |")
out.append("|---|---|---|")
out.append("| Kiến trúc và dữ liệu | `docs/system-map/01-KIEN-TRUC-DU-LIEU.md` | Các tài liệu kiến trúc/database cũ |")
out.append("| API, auth và thanh toán | `docs/system-map/02-API-AUTH-THANH-TOAN.md` | API audit, PayOS/SePay và SRS cũ |")
out.append("| UI, nội dung và chat | `docs/system-map/03-LUONG-UI-CHAT-NOI-DUNG.md` | Design system, chat/blog/profile reports |")
out.append("| Bảo mật, vận hành và cập nhật | `docs/system-map/04-BAO-MAT-VAN-HANH-CAP-NHAT.md` | deploy, test, refactor và verification reports |")
out.append("")
out.append("## 5. Dấu hiệu tài liệu lỗi thời hoặc có nguy cơ mâu thuẫn")
out.append("")
markers = {
    "Template Drizzle/tRPC/Express": "drizzle/schema.ts",
    "Template MySQL/TiDB": "MySQL/TiDB",
    "Route cũ /api/payment số ít": "/api/payment",
    "Provider QR legacy": "SEPAY",
    "PayOS": "PayOS",
    "MongoDB": "MongoDB",
    "Prisma": "Prisma",
    "NextAuth/Auth.js": "NextAuth",
}
out.append("| Dấu hiệu | Số lần trong tài liệu | Đánh giá |")
out.append("|---|---:|---|")
for label, marker in markers.items():
    count = sum(marker_count(r["text"], marker) for r in records)
    if label.startswith("Template") and count:
        assessment = "Có khả năng là tài liệu template/lịch sử; phải đối chiếu với `package.json` và source Next.js/Prisma hiện tại."
    elif label == "Provider QR legacy" and count:
        assessment = "Chỉ xem là legacy/provider-specific nếu không khớp hosted checkout hiện tại. Không quảng bá như flow đang được bật."
    else:
        assessment = "Có thể đúng hoặc lịch sử; đối chiếu route/schema hiện hành trước khi sửa."
    out.append(f"| {label} (`{marker}`) | {count} | {assessment} |")
out.append("")
out.append("### Tham chiếu đến đường dẫn không còn tồn tại")
out.append("")
if missing_mentions:
    out.append("Các đường dẫn dưới đây được tài liệu nhắc tới nhưng không còn thấy trong repository hiện tại. Đây là dấu hiệu tài liệu lỗi thời, không tự động có nghĩa là tính năng đã bị xóa:")
    for mention, count in missing_mentions.most_common(80):
        out.append(f"- `{mention}` — được nhắc {count} lần")
else:
    out.append("Không phát hiện tham chiếu path rõ ràng nào bị thiếu.")
out.append("")
out.append("## 6. Thông tin hệ thống còn thiếu cần bổ sung")
out.append("")
out.append("| Ưu tiên | Phần thiếu / cần xác minh | Nguồn cần cập nhật |")
out.append("|---|---|---|")
out.append("| Cao | Ma trận API gồm method, quyền truy cập, input/output, lỗi và trạng thái triển khai | `docs/system-map/02-API-AUTH-THANH-TOAN.md` |")
out.append("| Cao | Trạng thái production của provider thanh toán, webhook/IPN và merchant approval | `docs/system-map/02-API-AUTH-THANH-TOAN.md`, `04-BAO-MAT...` |")
out.append("| Cao | Database migration đã được áp dụng ở môi trường nào; không suy ra chỉ từ file SQL | `docs/system-map/04-BAO-MAT-VAN-HANH-CAP-NHAT.md` |")
out.append("| Trung bình | Ma trận role/permission cho các route dashboard và admin | `docs/system-map/02-API-AUTH-THANH-TOAN.md` |")
out.append("| Trung bình | MongoDB collections, TTL/indexes và chính sách dữ liệu chat | `docs/system-map/01-KIEN-TRUC-DU-LIEU.md`, `03-LUONG...` |")
out.append("| Trung bình | Test coverage và danh sách test đã chạy thực tế trong CI/production | `docs/system-map/04-BAO-MAT-VAN-HANH-CAP-NHAT.md` |")
out.append("| Thấp | Changelog theo release thay vì chỉ dựa vào commit history | Có thể tạo `CHANGELOG.md` khi bắt đầu release versioning |")
out.append("")
out.append("## 7. Kết luận và quy tắc bảo trì")
out.append("")
out.append("Không nên xóa thêm tài liệu chỉ dựa trên tên file. Trước khi xóa, cần kiểm tra ba điều: code không đọc file đó lúc runtime hoặc build; nội dung riêng đã được chuyển vào tài liệu hoạt động hoặc archive; và không còn liên kết nội bộ quan trọng. Tài liệu hoạt động phải được cập nhật cùng pull request thay đổi schema/API lớn. Archive chỉ dùng để truy nguyên quyết định cũ, không dùng để hướng dẫn triển khai tính năng mới.")
out.append("")
out.append("## References")
out.append("")
out.append("[1]: ../../prisma/schema.prisma — Prisma schema hiện tại")
out.append("[2]: ../../package.json — Dependencies và scripts hiện tại")
out.append("[3]: ../../src — Source tree hiện tại")
out.append("[4]: ../../docs/README.md — Chỉ mục tài liệu dự án")
out.append("")

output = ROOT / "docs/system-map/07-AUDIT-MD-TXT-VA-HE-THONG.md"
output.write_text("\n".join(out) + "\n", encoding="utf-8")
print(f"Wrote {output} with {len(records)} documents, {len(route_paths)} API routes, {len(page_paths)} pages, {len(model_names)} Prisma models")
print(f"HEAD={git_head} origin/main={origin_head}")
print(f"Missing path mentions={len(missing_mentions)}")
raw_tsv = "\n".join(f"{r['path']}\t{r['category']}\t{r['lines']}\t{r['bytes']}" for r in records)
(ROOT / "docs/system-map/07-AUDIT-MD-TXT-RAW.tsv").write_text(raw_tsv + "\n", encoding="utf-8")
print(f"Wrote {ROOT / 'docs/system-map/07-AUDIT-MD-TXT-RAW.tsv'}")
