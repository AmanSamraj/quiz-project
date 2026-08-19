"""Extract a structured JSON seed bank from the supplied Web Development PDF.

Usage: python server/scripts/import_pdf_mcqs.py 1000_Web_Development_MCQs.pdf
"""
from pypdf import PdfReader
import json, re, sys

lines = []
for page in PdfReader(sys.argv[1]).pages:
    lines.extend((page.extract_text() or "").splitlines())
items, category, i = [], "Web Development", 0
while i < len(lines):
    line = lines[i].strip()
    if line and not re.match(r"^(\d+\.|[ABCD]\. |Answer:|Explanation:|Web Development MCQs|Page \d+)", line) and i + 1 < len(lines) and re.match(r"^\d+\.\s+", lines[i + 1].strip()):
        category = line
    if not re.match(r"^\d+\.\s+", line): i += 1; continue
    text = re.sub(r"^\d+\.\s+", "", line); i += 1
    while i < len(lines) and not lines[i].strip().startswith("A. "): text += " " + lines[i].strip(); i += 1
    options = []
    for letter in "ABCD":
        if i >= len(lines) or not lines[i].strip().startswith(letter + ". "): options = []; break
        options.append(lines[i].strip()[3:]); i += 1
    if not options or i >= len(lines) or not lines[i].strip().startswith("Answer:"): continue
    answer = re.search(r"Answer:\s*([ABCD])", lines[i]).group(1); i += 1
    explanation = ""
    if i < len(lines) and lines[i].strip().startswith("Explanation:"): explanation = lines[i].strip()[12:].strip(); i += 1
    while i < len(lines) and not re.match(r"^\d+\.\s+", lines[i].strip()):
        if lines[i].strip() and not lines[i].strip().startswith("Web Development MCQs"): explanation += " " + lines[i].strip()
        i += 1
    items.append({"questionText": text.strip(), "options": options, "answer": answer, "explanation": explanation.strip(), "category": category})
with open("server/data/web-development-mcqs.json", "w", encoding="utf8") as out: json.dump(items, out, ensure_ascii=False, indent=2)
print(f"Extracted {len(items)} fully structured questions.")
