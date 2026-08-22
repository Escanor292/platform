from __future__ import annotations

from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
archive = ROOT / "docs/archive/LEGACY_MARKDOWN.md"
tracked = [
    "docs/README.md",
    "docs/system-map/00-CHI-MUC-HE-THONG.md",
    "docs/system-map/01-KIEN-TRUC-HE-THONG.md",
    "docs/system-map/02-MO-HINH-DU-LIEU.md",
    "docs/system-map/03-API-AUTH-THANH-TOAN.md",
    "docs/system-map/04-LUONG-NGUOI-DUNG.md",
    "docs/system-map/05-BAO-MAT-VAN-HANH.md",
    "docs/system-map/06-KIEM-KE-TAI-LIEU-CAP-NHAT.md",
]

text = archive.read_text(encoding="utf-8")
marker = "## Các Markdown đã được thay thế từ Git history"
if marker not in text:
    additions = ["", "---", "", marker, "", "> Các file dưới đây là bản nguyên văn từ `HEAD` trước khi bộ tài liệu được tinh gọn. Chúng được giữ riêng để bảo toàn cả phần có thể chưa được đưa vào tài liệu hiện hành.", ""]
    for rel in tracked:
        result = subprocess.run(
            ["git", "show", f"HEAD:{rel}"],
            cwd=ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        content = result.stdout.rstrip()
        additions.extend([f"### Nguồn Git: `{rel}`", "", content, "", "---", ""])
    archive.write_text(text.rstrip() + "\n" + "\n".join(additions), encoding="utf-8")
    print(f"Archived {len(tracked)} replaced tracked Markdown files")
else:
    print("Replaced tracked Markdown files are already archived")
