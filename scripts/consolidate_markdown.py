from __future__ import annotations

from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
SYSTEM_MAP = DOCS / "system-map"
ARCHIVE = DOCS / "archive"
ARCHIVE.mkdir(parents=True, exist_ok=True)

legacy_files = sorted(
    p for p in DOCS.rglob("*.md")
    if p.is_file()
    and SYSTEM_MAP not in p.parents
    and ARCHIVE not in p.parents
    and p.name != "README.md"
)

lines: list[str] = []
lines.append("# Kho lưu trữ Markdown lịch sử")
lines.append("")
lines.append("> Tài liệu này giữ nguyên nội dung các Markdown cũ trước khi tinh gọn bộ tài liệu hoạt động. Không dùng làm nguồn sự thật hiện hành; hãy bắt đầu từ `../system-map/00-CHI-MUC-HE-THONG.md`.")
lines.append("")
lines.append(f"- Ngày tạo: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
lines.append(f"- Số file đã lưu: {len(legacy_files)}")
lines.append("- Quy tắc: mỗi mục dưới đây chứa đường dẫn nguồn và toàn bộ nội dung nguyên văn.")
lines.append("")
lines.append("## Danh mục nguồn")
lines.append("")
for path in legacy_files:
    rel = path.relative_to(ROOT).as_posix()
    count = len(path.read_text(encoding="utf-8", errors="replace").splitlines())
    lines.append(f"- `{rel}` ({count} dòng)")
lines.append("")
lines.append("---")
lines.append("")

for path in legacy_files:
    rel = path.relative_to(ROOT).as_posix()
    content = path.read_text(encoding="utf-8", errors="replace").rstrip()
    lines.append(f"## Nguồn: `{rel}`")
    lines.append("")
    lines.append(content)
    lines.append("")
    lines.append("---")
    lines.append("")

(ARCHIVE / "LEGACY_MARKDOWN.md").write_text("\n".join(lines), encoding="utf-8")

# Xóa các bản Markdown cũ sau khi đã lưu nguyên văn vào archive.
for path in legacy_files:
    path.unlink()

# Xóa các bản system-map cũ; bộ tinh gọn sẽ được tạo lại ở bước tiếp theo.
for path in SYSTEM_MAP.glob("*.md"):
    path.unlink()

print(f"Archived {len(legacy_files)} legacy Markdown files into {ARCHIVE / 'LEGACY_MARKDOWN.md'}")
print(f"Archive lines: {len(lines)}")
