from __future__ import annotations

import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {"node_modules", ".next", ".git"}
FILES = sorted(
    p for p in ROOT.rglob("*.md")
    if not any(part in EXCLUDED for part in p.parts)
)

def clean(text: str) -> str:
    text = re.sub(r"```.*?```", " ", text, flags=re.S)
    text = re.sub(r"!\[[^]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[[^]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"[#>*`_~-]", " ", text.lower())
    return re.sub(r"\s+", " ", text).strip()

def shingles(text: str, n: int = 5) -> set[str]:
    words = clean(text).split()
    return {" ".join(words[i:i+n]) for i in range(max(0, len(words)-n+1))}

records = []
for path in FILES:
    text = path.read_text(encoding="utf-8", errors="replace")
    headings = [line.strip() for line in text.splitlines() if re.match(r"^#{1,6}\s", line)]
    records.append({
        "path": str(path.relative_to(ROOT)),
        "bytes": path.stat().st_size,
        "lines": len(text.splitlines()),
        "sha256": hashlib.sha256(text.encode()).hexdigest(),
        "headings": headings,
        "text": text,
        "shingles": shingles(text),
    })

out = []
out.append(f"# Markdown audit\n\nFiles: {len(records)}\n")
out.append("## Inventory\n")
for r in records:
    out.append(f"### `{r['path']}`\n- Size: {r['bytes']} bytes; lines: {r['lines']}; SHA-256: `{r['sha256']}`")
    if r["headings"]:
        out.append("- Headings:")
        out.extend(f"  - {h}" for h in r["headings"][:80])
    else:
        out.append("- Headings: none")
    out.append("")

out.append("## Exact duplicates\n")
by_hash = {}
for r in records:
    by_hash.setdefault(r["sha256"], []).append(r["path"])
exact = [paths for paths in by_hash.values() if len(paths) > 1]
if exact:
    out.extend("- " + ", ".join(f"`{p}`" for p in paths) for paths in exact)
else:
    out.append("No exact duplicate files.")

out.append("\n## High-overlap pairs\n")
pairs = []
for i, a in enumerate(records):
    for b in records[i+1:]:
        if not a["shingles"] or not b["shingles"]:
            continue
        union = len(a["shingles"] | b["shingles"])
        inter = len(a["shingles"] & b["shingles"])
        score = inter / union if union else 0
        if score >= 0.08:
            pairs.append((score, a["path"], b["path"], inter))
for score, a, b, inter in sorted(pairs, reverse=True)[:100]:
    out.append(f"- {score:.1%} overlap ({inter} shared shingles): `{a}` ↔ `{b}`")
if not pairs:
    out.append("No high-overlap pairs above threshold.")

out.append("\n## File excerpts for synthesis\n")
for r in records:
    text = r["text"].strip()
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
    excerpt = "\n\n".join(paragraphs[:4])[:2500]
    out.append(f"### SOURCE: `{r['path']}`\n{excerpt}\n")

(ROOT / "docs" / "MARKDOWN_AUDIT_RAW.md").write_text("\n".join(out), encoding="utf-8")
print(f"Wrote {ROOT / 'docs' / 'MARKDOWN_AUDIT_RAW.md'} with {len(records)} files")
