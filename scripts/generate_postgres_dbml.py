#!/usr/bin/env python3
"""Generate a DBML snapshot from the repository's Prisma schema.

The Prisma schema remains the source of truth. This script intentionally emits a
readable snapshot for documentation and does not attempt to introspect a live DB.
"""
from __future__ import annotations

import argparse
import re
from dataclasses import dataclass, field
from pathlib import Path


SCALAR_TYPES = {
    "String": "text",
    "Int": "int",
    "BigInt": "bigint",
    "Float": "double",
    "Decimal": "decimal",
    "Boolean": "boolean",
    "DateTime": "timestamp",
    "Json": "jsonb",
    "Bytes": "bytea",
}


@dataclass
class Column:
    name: str
    prisma_type: str
    attrs: str
    db_type: str
    options: list[str] = field(default_factory=list)


@dataclass
class Table:
    name: str
    columns: list[Column] = field(default_factory=list)
    indexes: list[tuple[str, str, str]] = field(default_factory=list)
    relations: list[tuple[list[str], str, list[str], str | None]] = field(default_factory=list)


def split_bracket_values(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


def attr_value(attrs: str, name: str) -> str | None:
    marker = f"@{name}("
    start = attrs.find(marker)
    if start < 0:
        return None
    index = start + len(marker)
    depth = 1
    while index < len(attrs) and depth:
        if attrs[index] == "(":
            depth += 1
        elif attrs[index] == ")":
            depth -= 1
        index += 1
    return attrs[start + len(marker): index - 1] if depth == 0 else None


def db_type(prisma_type: str, attrs: str) -> str:
    base = prisma_type.removesuffix("[]").removesuffix("?")
    if base in SCALAR_TYPES:
        result = SCALAR_TYPES[base]
    else:
        result = base
    varchar = re.search(r"@db\.VarChar\((\d+)\)", attrs)
    if varchar:
        result = f"varchar({varchar.group(1)})"
    elif "@db.Text" in attrs:
        result = "text"
    elif base in SCALAR_TYPES and prisma_type.endswith("[]"):
        result += "[]"
    return result


def default_value(attrs: str) -> str | None:
    value = attr_value(attrs, "default")
    if value is None:
        return None
    value = value.strip()
    if value.startswith('"') or value in {"true", "false", "[]"} or re.match(r"^-?\d+(?:\.\d+)?$", value):
        return value
    if value.startswith("dbgenerated("):
        return value
    return value


def parse_schema(text: str) -> tuple[list[Table], list[tuple[str, list[str]]]]:
    lines = text.splitlines()
    model_names = [m.group(1) for line in lines if (m := re.match(r"model\s+(\w+)\s*\{", line))]
    model_set = set(model_names)
    tables: list[Table] = []
    enums: list[tuple[str, list[str]]] = []
    current: Table | None = None
    current_enum: tuple[str, list[str]] | None = None

    for raw in lines:
        line = raw.strip()
        if not line or line.startswith("//") or line.startswith("///"):
            continue
        model_match = re.match(r"model\s+(\w+)\s*\{", line)
        enum_match = re.match(r"enum\s+(\w+)\s*\{", line)
        if model_match:
            current = Table(model_match.group(1))
            tables.append(current)
            current_enum = None
            continue
        if enum_match:
            current = None
            current_enum = (enum_match.group(1), [])
            enums.append(current_enum)
            continue
        if line == "}":
            current = None
            current_enum = None
            continue
        if current_enum is not None:
            if re.match(r"^\w+", line):
                current_enum[1].append(line.split()[0])
            continue
        if current is None:
            continue
        if line.startswith("@@"):
            unique_match = re.match(r"@@unique\(\[([^]]+)\]\)(?:\s+@map\(\"([^\"]+)\"\))?", line)
            index_match = re.match(r"@@index\(\[([^]]+)\]\)(?:\s+@map\(\"([^\"]+)\"\))?", line)
            id_match = re.match(r"@@id\(\[([^]]+)\]\)", line)
            if unique_match:
                current.indexes.append(("unique", ", ".join(split_bracket_values(unique_match.group(1))), unique_match.group(2) or ""))
            elif index_match:
                current.indexes.append(("index", ", ".join(split_bracket_values(index_match.group(1))), index_match.group(2) or ""))
            elif id_match:
                current.indexes.append(("pk", ", ".join(split_bracket_values(id_match.group(1))), ""))
            continue
        field_match = re.match(r"^(\w+)\s+([\w\[\]?]+)(?:\s+(.*))?$", line)
        if not field_match:
            continue
        name, prisma_type, attrs = field_match.group(1), field_match.group(2), field_match.group(3) or ""
        base = prisma_type.removesuffix("[]").removesuffix("?")
        is_relation = base in model_set
        relation = attr_value(attrs, "relation")
        if is_relation:
            if relation:
                fields_match = re.search(r"fields:\s*\[([^]]+)\]", relation)
                refs_match = re.search(r"references:\s*\[([^]]+)\]", relation)
                delete_match = re.search(r"onDelete:\s*(\w+)", relation)
                if fields_match and refs_match:
                    current.relations.append((split_bracket_values(fields_match.group(1)), base, split_bracket_values(refs_match.group(1)), delete_match.group(1) if delete_match else None))
            continue
        options: list[str] = []
        if "@id" in attrs:
            options.append("pk")
        if "@unique" in attrs:
            options.append("unique")
        default = default_value(attrs)
        if default is not None:
            options.append(f"default: {default}")
        current.columns.append(Column(name, prisma_type, attrs, db_type(prisma_type, attrs), options))

    return tables, enums


def quote_identifier(name: str) -> str:
    return f'"{name}"' if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", name) else name


def render(tables: list[Table], enums: list[tuple[str, list[str]]], schema_path: str) -> str:
    out: list[str] = [
        "// GENERATED DOCUMENTATION SNAPSHOT — PostgreSQL/Prisma",
        f"// Source: {schema_path}",
        "// Prisma schema is the source of truth; regenerate with:",
        "//   python3 scripts/generate_postgres_dbml.py",
        "// This file documents the current application model and is not a migration.",
        "",
    ]
    for enum_name, values in enums:
        out.append(f"Enum {enum_name} {{")
        for value in values:
            out.append(f"  {value}")
        out.extend(["}", ""])

    for table in tables:
        out.append(f"Table {table.name} {{")
        for col in table.columns:
            options = f" [{', '.join(col.options)}]" if col.options else ""
            out.append(f"  {col.name} {col.db_type}{options}")
        out.extend(["}", ""])

    for table in tables:
        for fields, target, refs, on_delete in table.relations:
            for source, target_field in zip(fields, refs):
                suffix = f" [delete: {on_delete.lower()}]" if on_delete else ""
                out.append(f"Ref: {table.name}.{source} > {target}.{target_field}{suffix}")
    out.append("")

    for table in tables:
        for kind, fields, mapped_name in table.indexes:
            if kind == "pk":
                out.append(f"// Composite primary key: {table.name}({fields})")
            elif kind == "unique":
                name = f", name: {mapped_name}" if mapped_name else ""
                out.append(f"// Composite unique: {table.name}({fields}{name})")
            else:
                name = f", name: {mapped_name}" if mapped_name else ""
                out.append(f"// Index: {table.name}({fields}{name})")
    out.extend([
        "",
        "// Composite @@id/@@unique/@@index declarations are retained as comments",
        "// because DBML column-level [pk]/[unique] cannot faithfully express them.",
        "",
    ])
    return "\n".join(out)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--schema", default="prisma/schema.prisma")
    parser.add_argument("--output", default="docs/DATABASE_SCHEMA_DBML.txt")
    args = parser.parse_args()
    schema = Path(args.schema)
    tables, enums = parse_schema(schema.read_text(encoding="utf-8"))
    Path(args.output).write_text(render(tables, enums, str(schema)), encoding="utf-8")
    print(f"generated {args.output}: {len(tables)} tables, {len(enums)} enums")


if __name__ == "__main__":
    main()
