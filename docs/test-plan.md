# I²C interface validation test plan

## Scope

This plan validates a simulated ESP32 controller model communicating with a BME280-class I²C peripheral. It is a portfolio demonstration of validation methodology. The test evidence is simulated and must not be represented as bench measurement.

## Requirements

| ID | Requirement | Verification method |
| --- | --- | --- |
| REQ-I2C-001 | The controller shall issue a three-byte register read to a peripheral at address `0x76`. | Functional test and decoded simulated transaction |
| REQ-I2C-002 | A valid register read shall complete in 10 ms or less at the 400 kHz target setting. | Timed simulated transaction and UART log review |
| REQ-I2C-003 | The controller shall identify an address-phase NACK and report it in the validation log. | Negative test with address `0x77` |
| REQ-I2C-004 | The controller shall detect a bus-stuck condition and invoke its timeout/recovery behavior. | Negative test with SDA held low |
| REQ-I2C-005 | A reduced clock rate that exceeds the timing criterion shall be flagged as a timing violation. | Boundary test at 100 kHz |

## Test cases

| ID | Type | Setup and stimulus | Pass criterion |
| --- | --- | --- | --- |
| TC-01 | Functional | `0x76`, 400 kHz, read register `0xF7` | 3 data bytes, ACK after address/register/data phases, duration ≤ 10 ms |
| TC-02 | Negative | Request `0x77` while peripheral is modeled at `0x76` | Address NACK appears in the trace and `status=NACK` appears in log |
| TC-03 | Negative | Force SDA low before the START condition | Timeout appears and recovery action is logged |
| TC-04 | Boundary | Set bus frequency to 100 kHz | Valid transfer is recorded but duration > 10 ms is reported as a timing violation |
| TC-05 | Regression | Restore `0x76`, 400 kHz following TC-02 | Nominal transfer passes after configuration correction |

## Evidence to retain

- Browser simulator screenshot showing each key scenario.
- `data/simulated_uart_log.csv` and generated timing plot.
- A completed validation report with requirement and test-case references.
- When hardware becomes available: actual serial log, logic-analyzer capture, board photo, firmware revision, and environmental/power setup.

## Known limitations

The simulation cannot validate rise times, pull-up sizing, noise margin, actual peripheral silicon behavior, board routing, power integrity, or real-time performance. Those require hardware instrumentation.
