# Validation report: simulated ESP32 I²C sensor interface

## Executive summary

The simulated interface met the nominal functional and timing requirement at 400 kHz. Fault-injection scenarios verified that the validation harness exposes an address NACK, a bus-stuck timeout, and a clock-rate timing violation. This report documents simulated results only.

## Requirement-to-result traceability

| Requirement | Test | Result | Evidence |
| --- | --- | --- | --- |
| REQ-I2C-001 | TC-01 | Pass: three bytes received from modeled address `0x76` | Simulated waveform and UART fixture |
| REQ-I2C-002 | TC-01 | Pass: 4.8 ms modeled completion time | Simulator and CSV timing record |
| REQ-I2C-003 | TC-02 | Pass: NACK detected for `0x77` | Simulated waveform and UART fixture |
| REQ-I2C-004 | TC-03 | Pass: timeout/recovery reported when SDA is low | Simulated waveform and UART fixture |
| REQ-I2C-005 | TC-04 | Pass: 19.2 ms at 100 kHz reported as timing violation | UART fixture |

## Defect record

**Defect ID:** DEF-I2C-001

**Title:** Sensor initialization fails due to incorrect configured address

**Severity:** High — prevents sensor communication

**Reproduction:** Run TC-02 with the controller configured for `0x77`, while the peripheral model uses `0x76`.

**Observed behavior:** Address byte is followed by NACK; no register or data phase follows.

**Root cause:** Firmware configuration used the BME280 alternate address despite the modeled address-select state corresponding to `0x76`.

**Fix:** Change the address constant to `0x76`.
**Regression:** TC-05 completes a three-byte read in 4.8 ms and passes.

## Conclusion

The exercise demonstrates a repeatable validation workflow: write a measurable requirement, derive normal/negative/boundary tests, inspect protocol evidence, reproduce a defect, identify its root cause, apply a correction, and retain a regression test.

## Hardware follow-on

When physical hardware is available, this report should be updated with the board revision, firmware commit, actual I²C address, logic-analyzer sample rate, screenshots/exports, measured timing, power conditions, and a photograph of the test setup.
