#!/usr/bin/env python3
"""Parse a tool access log into per-tool per-day visit counts (CSV) and a bar chart."""

import argparse
import csv
import os
import re
from collections import defaultdict
from datetime import datetime

import matplotlib.pyplot as plt

LINE_RE = re.compile(r"^\[(?P<ts>[^\]]+)\]\s*-\s*(?P<tool>.+?)\s*$")


def parse(path):
    counts = defaultdict(int)  # (date, tool) -> count
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            m = LINE_RE.match(line)
            if not m:
                continue
            day = datetime.fromisoformat(m["ts"]).date().isoformat()
            counts[(day, m["tool"])] += 1
    return counts


def write_csv(counts, path):
    days = sorted({d for d, _ in counts})
    totals = defaultdict(int)
    for (_, tool), c in counts.items():
        totals[tool] += c
    tools = sorted(totals, key=lambda t: (-totals[t], t))
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["date"] + tools)
        for day in days:
            w.writerow([day] + [counts.get((day, t), 0) for t in tools])
    return days, tools


def write_totals_csv(counts, tools, path):
    totals = defaultdict(int)
    for (_, tool), c in counts.items():
        totals[tool] += c
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["tool", "visits"])
        for tool in tools:
            w.writerow([tool, totals[tool]])


def plot(counts, days, tools, path):
    days = days[-10:]
    height = max(5, 0.35 * len(tools) + 1.5)
    fig, ax = plt.subplots(figsize=(max(8, len(days) * 1.2), height))
    x = range(len(days))
    bottom = [0] * len(days)
    for tool in tools:
        vals = [counts.get((d, tool), 0) for d in days]
        ax.bar(x, vals, bottom=bottom, label=tool)
        bottom = [b + v for b, v in zip(bottom, vals)]
    ax.set_xticks(list(x))
    ax.set_xticklabels(days, rotation=45, ha="right")
    ax.set_xlabel("Date")
    ax.set_ylabel("Visits")
    ax.set_title("Visits per tool per day (last 10 days)")
    ax.legend(title="Tool", bbox_to_anchor=(1.02, 1), loc="upper left")
    fig.tight_layout()
    fig.savefig(path, dpi=150)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("logfile")
    p.add_argument("--csv", default=None)
    p.add_argument("--totals-csv", default=None)
    p.add_argument("--chart", default=None)
    args = p.parse_args()

    stem = os.path.splitext(os.path.basename(args.logfile))[0]
    csv_path = args.csv or f"{stem}.csv"
    totals_path = args.totals_csv or f"{stem}-totals.csv"
    chart_path = args.chart or f"{stem}.png"

    counts = parse(args.logfile)
    days, tools = write_csv(counts, csv_path)
    write_totals_csv(counts, tools, totals_path)
    plot(counts, days, tools, chart_path)
    print(f"Wrote {csv_path}, {totals_path} and {chart_path}")


if __name__ == "__main__":
    main()