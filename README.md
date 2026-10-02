# ESP32 I²C Bring-Up, Fault Injection, and Validation

A polished, simulation-based portfolio project for embedded test, hardware validation, and early-career post-silicon validation applications.

> Important: This repository contains **simulated** I²C traces, UART logs, and timing data. It demonstrates a validation workflow; it does not claim physical bench measurements or hardware qualification.

## What it demonstrates

- Requirement-to-test traceability
- Functional, negative, boundary, and regression testing
- I²C transaction interpretation and fault injection
- Defect reproduction, root-cause analysis, and regression closure
- Python-based UART log analysis and timing visualization
- Clear validation documentation suitable for a portfolio

## Live demo

This project is a dependency-free static site. Open `index.html` locally or deploy it to Vercel.

The interactive demo includes:

- A simulated nominal I²C read at address `0x76`
- Wrong-address NACK injection
- SDA-stuck-low injection
- A clock-rate boundary test
- An explicitly labeled simulated logic-analyzer waveform

## Repository layout

```text
.
├── app.js                         # Interactive fault-injection demo
├── data/simulated_uart_log.csv    # Generated UART-log fixture
├── docs/test-plan.md              # Requirements and test cases
├── docs/validation-report.md      # Results and defect closure
├── index.html                     # Portfolio website
├── styles.css                     # Responsive visual design
├── tools/analyze_logs.py          # CSV summary and timing plot
├── tools/requirements.txt          # Optional plotting dependency
└── vercel.json                    # Static Vercel configuration
```

## Run locally

No Node.js installation is required. Open `index.html` in a browser.

For a lightweight local server, if Python is available:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Analyze the log fixture

Print a validation summary with no additional dependency:

```bash
python tools/analyze_logs.py data/simulated_uart_log.csv --no-plot
```

To generate `validation_summary.png`:

```bash
python -m pip install -r tools/requirements.txt
python tools/analyze_logs.py data/simulated_uart_log.csv
```

## Deploy to Vercel later

1. Create a GitHub repository and push this project.
2. In Vercel, select **Add New → Project** and import that GitHub repository.
3. Keep the framework preset as **Other**; there is no build command or output directory.
4. Deploy. Vercel serves `index.html` as the static site.
5. Replace the placeholder GitHub link in `index.html` with your actual repository URL.

## Interview-ready framing

Use wording such as:

> “I built a simulation-based I²C validation lab to demonstrate my approach to requirements traceability, protocol fault injection, negative testing, debug evidence, and regression closure. I explicitly separated simulated evidence from physical measurements and documented the hardware follow-on needed for bench validation.”

Avoid calling the traces physical logic-analyzer captures until you collect real captures from a board.

## Hardware upgrade path

With an ESP32, BME280, breadboard, and low-cost logic analyzer, replace the simulated evidence with:

1. Firmware source and build instructions.
2. Actual UART logs captured from the board.
3. Logic-analyzer screenshots/exports showing SCL/SDA.
4. A board photo and wiring diagram.
5. Updated timing measurements and report conclusion.
