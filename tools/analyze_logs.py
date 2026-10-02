#!/usr/bin/env python3
"""Summarize simulated or captured UART validation logs.

Usage:
    python tools/analyze_logs.py data/simulated_uart_log.csv

The input format is CSV with at least timestamp_s, test_id, read_ms, and status.
Install matplotlib first when a plot is required:
    python -m pip install -r requirements.txt
"""

from __future__ import annotations

import argparse
import csv
from collections import Counter
from pathlib import Path


def read_rows(log_path: Path) -> list[dict[str, str]]:
    with log_path.open(newline="", encoding="utf-8") as log_file:
        rows = list(csv.DictReader(log_file))

    required = {"timestamp_s", "test_id", "read_ms", "status"}
    if not rows or not required.issubset(rows[0]):
        missing = ", ".join(sorted(required - set(rows[0] if rows else [])))
        raise ValueError(f"Log is missing required columns: {missing}")
    return rows


def timing_rows(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    return [row for row in rows if row["read_ms"] and row["read_ms"] != "NA"]


def summarize(rows: list[dict[str, str]]) -> None:
    statuses = Counter(row["status"] for row in rows)
    measurements = timing_rows(rows)
    max_row = max(measurements, key=lambda row: float(row["read_ms"]))

    print("Validation log summary")
    print("----------------------")
    print(f"Total records: {len(rows)}")
    print("Status counts:")
    for status, count in sorted(statuses.items()):
        print(f"  {status}: {count}")
    print(
        "Longest observed operation: "
        f"{max_row['read_ms']} ms "
        f"({max_row['test_id']} / {max_row['scenario']})"
    )


def write_plot(rows: list[dict[str, str]], output_path: Path) -> None:
    try:
        import matplotlib.pyplot as plt
    except ImportError as exc:
        raise SystemExit(
            "Plot not generated: install matplotlib with "
            "'python -m pip install -r requirements.txt'."
        ) from exc

    measurements = timing_rows(rows)
    timestamps = [float(row["timestamp_s"]) for row in measurements]
    durations = [float(row["read_ms"]) for row in measurements]
    colors = [
        "#1c5c43" if row["status"] == "PASS" else "#bd5b27"
        for row in measurements
    ]

    figure, axis = plt.subplots(figsize=(9, 4.8))
    axis.scatter(timestamps, durations, s=70, c=colors, zorder=3)
    axis.axhline(10, color="#a83222", linestyle="--", linewidth=1.4, label="10 ms requirement")
    axis.set_title("I²C transaction duration from UART validation log")
    axis.set_xlabel("Log timestamp (s)")
    axis.set_ylabel("Observed duration (ms)")
    axis.grid(axis="y", alpha=0.25)
    axis.legend(frameon=False)
    figure.tight_layout()
    figure.savefig(output_path, dpi=180)
    print(f"Plot written to: {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Summarize UART validation logs.")
    parser.add_argument("log_file", type=Path, help="CSV log to analyze")
    parser.add_argument(
        "--plot",
        type=Path,
        default=Path("validation_summary.png"),
        help="Output PNG path (default: validation_summary.png)",
    )
    parser.add_argument(
        "--no-plot",
        action="store_true",
        help="Print summary only; do not import matplotlib or create a plot.",
    )
    args = parser.parse_args()

    rows = read_rows(args.log_file)
    summarize(rows)
    if not args.no_plot:
        write_plot(rows, args.plot)


if __name__ == "__main__":
    main()
