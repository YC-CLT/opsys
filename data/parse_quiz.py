#!/usr/bin/env python3
"""
题库 JSON 解析与验证工具
用法：
  python parse_quiz.py              # 读取并校验题库，打印统计
  python parse_quiz.py --sample 3   # 随机抽 3 题样本
  python parse_quiz.py --level 1    # 按关卡筛选
"""

import json
import sys
import random
from pathlib import Path
from typing import Any

BANK_PATH = Path(__file__).parent / "quiz-bank.json"

# ---------------------------------------------------------------------------
# schema 校验规则
# ---------------------------------------------------------------------------

VALID_TYPES = {"choice", "judge", "match"}
VALID_DIFFICULTIES = {"basic", "intermediate", "discriminate"}


def validate_question(q: dict, idx: int) -> list[str]:
    errors: list[str] = []
    prefix = f"Q{q.get('id', idx)}"

    if q.get("type") not in VALID_TYPES:
        errors.append(f"{prefix}: 非法 type={q.get('type')}")
    if q.get("difficulty") not in VALID_DIFFICULTIES:
        errors.append(f"{prefix}: 非法 difficulty={q.get('difficulty')}")
    if not isinstance(q.get("levelId"), int) or q["levelId"] < 1:
        errors.append(f"{prefix}: levelId 必须为正整数")

    content = q.get("content", {})
    if not content.get("stem"):
        errors.append(f"{prefix}: 缺少 stem")
    if not q.get("explanation"):
        errors.append(f"{prefix}: 缺少 explanation")

    t = q["type"]
    if t == "choice":
        if not isinstance(content.get("options"), list) or len(content["options"]) != 4:
            errors.append(f"{prefix}: choice 必须有 4 个 options")
        if q.get("answer") not in ("A", "B", "C", "D"):
            errors.append(f"{prefix}: choice 的 answer 必须为 A/B/C/D")
    elif t == "judge":
        if not isinstance(q.get("answer"), bool):
            errors.append(f"{prefix}: judge 的 answer 必须为 bool")
    elif t == "match":
        pairs = content.get("pairs", [])
        if not isinstance(pairs, list) or len(pairs) < 2:
            errors.append(f"{prefix}: match 的 pairs 至少需要 2 对")
        answer = q.get("answer", {})
        if not isinstance(answer, dict):
            errors.append(f"{prefix}: match 的 answer 必须为 dict")
        if set(answer.keys()) != {p["left"] for p in pairs}:
            errors.append(f"{prefix}: match 的 answer key 与 pairs left 不一致")

    return errors


# ---------------------------------------------------------------------------
# 工具函数（供外部调用 / 前端参考）
# ---------------------------------------------------------------------------

def load_bank(path: Path = BANK_PATH) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_bank(bank: dict) -> list[str]:
    all_errors: list[str] = []
    if bank.get("version") != "1.0":
        all_errors.append("version 不是 1.0")
    questions = bank.get("questions", [])
    if not questions:
        all_errors.append("questions 为空")
    ids_seen: set[str] = set()
    for i, q in enumerate(questions):
        qid = q.get("id", "")
        if qid in ids_seen:
            all_errors.append(f"重复 ID: {qid}")
        ids_seen.add(qid)
        all_errors.extend(validate_question(q, i))
    return all_errors


def filter_by_level(bank: dict, level_id: int) -> list[dict]:
    return [q for q in bank["questions"] if q["levelId"] == level_id]


def filter_by_type(bank: dict, qtype: str) -> list[dict]:
    return [q for q in bank["questions"] if q["type"] == qtype]


def sample_questions(bank: dict, n: int, level_id: int | None = None) -> list[dict]:
    pool = filter_by_level(bank, level_id) if level_id else bank["questions"]
    return random.sample(pool, min(n, len(pool)))


def stats(bank: dict) -> dict:
    qs = bank["questions"]
    return {
        "total": len(qs),
        "by_type": {t: len(filter_by_type(bank, t)) for t in VALID_TYPES},
        "by_difficulty": {d: len([q for q in qs if q["difficulty"] == d]) for d in VALID_DIFFICULTIES},
        "by_level": {lv: len(filter_by_level(bank, lv)) for lv in sorted({q["levelId"] for q in qs})},
    }


def to_markdown(bank: dict) -> str:
    """将 JSON 题库反向输出为 Markdown（便于人工审阅）"""
    lines: list[str] = []
    lines.append(f"# {bank['chapter']} 题库\n")
    for q in bank["questions"]:
        emoji = {"basic": "🟢", "intermediate": "🔵", "discriminate": "🟠"}
        diff = emoji.get(q["difficulty"], "")
        lines.append(f"### {q['id']} · {diff} 关卡{q['levelId']}")
        lines.append(f"**题目**：{q['content']['stem']}\n")

        if q["type"] == "choice":
            for letter, opt in zip("ABCD", q["content"]["options"]):
                marker = " **(✓)**" if letter == q["answer"] else ""
                lines.append(f"- {letter}. {opt}{marker}")
        elif q["type"] == "judge":
            lines.append(f"**答案**：{'✓ 正确' if q['answer'] else '✗ 错误'}")
        elif q["type"] == "match":
            lines.append("| 左侧 | 右侧 |")
            lines.append("|------|------|")
            answer = q["answer"]
            for p in q["content"]["pairs"]:
                lines.append(f"| {p['left']} | {p['right']} |")

        lines.append(f"\n**讲解**：{q['explanation']}")
        lines.append("\n---\n")
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    bank = load_bank()

    if "--sample" in sys.argv:
        idx = sys.argv.index("--sample")
        n = int(sys.argv[idx + 1]) if idx + 1 < len(sys.argv) else 1
        level = None
        if "--level" in sys.argv:
            li = sys.argv.index("--level")
            level = int(sys.argv[li + 1])
        sampled = sample_questions(bank, n, level)
        print(json.dumps(sampled, ensure_ascii=False, indent=2))

    elif "--level" in sys.argv:
        idx = sys.argv.index("--level")
        level = int(sys.argv[idx + 1])
        qs = filter_by_level(bank, level)
        print(f"关卡 {level}: {len(qs)} 题")
        for q in qs:
            print(f"  {q['id']} [{q['difficulty']}] {q['type']}: {q['content']['stem'][:40]}...")

    elif "--md" in sys.argv:
        print(to_markdown(bank))

    else:
        errors = validate_bank(bank)
        if errors:
            print("❌ 校验失败:")
            for e in errors:
                print(f"  - {e}")
            sys.exit(1)
        print("✅ 校验通过")
        s = stats(bank)
        print(f"共 {s['total']} 题")
        print(f"  按题型: {s['by_type']}")
        print(f"  按难度: {s['by_difficulty']}")
        print(f"  按关卡: {s['by_level']}")