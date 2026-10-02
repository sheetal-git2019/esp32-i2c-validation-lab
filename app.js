(function () {
  'use strict';

  var scenario = document.getElementById('scenario');
  var rate = document.getElementById('clock-rate');
  var rateLabel = document.getElementById('rate-label');
  var runButton = document.getElementById('run-test');
  var resetButton = document.getElementById('reset-test');
  var observedTime = document.getElementById('observed-time');
  var observedContext = document.getElementById('observed-context');
  var verdict = document.getElementById('verdict');
  var verdictContext = document.getElementById('verdict-context');
  var traceTitle = document.getElementById('trace-title');
  var scenarioBadge = document.getElementById('scenario-badge');
  var traceDetail = document.getElementById('trace-detail');
  var sclPath = document.getElementById('scl-path');
  var sdaPath = document.getElementById('sda-path');
  var traceLabels = document.getElementById('trace-labels');
  var testMessage = document.getElementById('test-message');

  function pointsToPath(points) {
    return points.map(function (point, index) {
      return (index === 0 ? 'M ' : ' L ') + point[0] + ' ' + point[1];
    }).join('');
  }

  function i2cTracePath(bits, high, low) {
    var xStart = 112;
    var width = 805;
    var bitWidth = width / bits.length;
    var points = [[xStart, high]];

    bits.forEach(function (bit, index) {
      var x = xStart + index * bitWidth;
      var end = x + bitWidth;
      var y = bit ? high : low;
      points.push([x, y], [end, y]);
    });

    return pointsToPath(points);
  }

  function nominalTrace() {
    var clock = [];
    var data = [];
    var index;

    for (index = 0; index < 72; index += 1) {
      clock.push(index % 2);
      data.push(index % 9 === 8 ? 0 : (index * 11 + 5) % 2);
    }

    data[0] = 1;
    data[1] = 0;

    return {
      scl: i2cTracePath(clock, 78, 124),
      sda: i2cTracePath(data, 160, 205)
    };
  }

  function stuckLowTrace() {
    var nominal = nominalTrace();
    return {
      scl: nominal.scl,
      sda: 'M 112 205 L 917 205'
    };
  }

  function updateLabels(items) {
    traceLabels.replaceChildren();
    items.forEach(function (item) {
      var label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', item.x);
      label.setAttribute('y', '27');
      label.textContent = item.label;
      traceLabels.appendChild(label);
    });
  }

  function setResult(isPass, message) {
    verdict.textContent = isPass ? 'PASS' : 'FAIL';
    verdict.className = isPass ? 'pass' : 'fail';
    verdictContext.textContent = isPass ? 'all acceptance criteria met' : 'fault reproduced and logged';
    testMessage.textContent = message;
    testMessage.className = isPass ? 'test-message pass' : 'test-message fail';
  }

  function runTest() {
    var selected = scenario.value;
    var clockRate = Number(rate.value);
    var trace = selected === 'sda-low' ? stuckLowTrace() : nominalTrace();
    var boundaryTime = Math.round((1920 / clockRate) * 10) / 10;

    rateLabel.textContent = clockRate + ' kHz';
    sclPath.setAttribute('d', trace.scl);
    sdaPath.setAttribute('d', trace.sda);

    if (selected === 'nominal') {
      var nominalTime = Math.max(4.8, boundaryTime);
      observedTime.textContent = nominalTime.toFixed(1) + ' ms';
      observedContext.textContent = '3 data bytes returned';
      traceTitle.textContent = nominalTime <= 10 ? 'Nominal register read' : 'Timing boundary result';
      scenarioBadge.textContent = nominalTime <= 10 ? 'Nominal' : 'Timing violation';
      traceDetail.textContent = 'START → 0x76(W) → 0xF7 → repeated START → 0x76(R) → 3 data bytes → STOP';
      updateLabels([
        { x: 119, label: 'START' },
        { x: 257, label: '0x76(W)' },
        { x: 439, label: '0xF7' },
        { x: 558, label: '0x76(R)' },
        { x: 717, label: 'data + ACK' },
        { x: 868, label: 'STOP' }
      ]);

      if (nominalTime <= 10) {
        setResult(true, 'PASS — 3-byte pressure read completed in ' + nominalTime.toFixed(1) + ' ms; requirement met.');
      } else {
        setResult(false, 'FAIL — completion time ' + nominalTime.toFixed(1) + ' ms exceeds the 10 ms requirement.');
      }
    } else if (selected === 'wrong-address') {
      observedTime.textContent = '0.9 ms';
      observedContext.textContent = 'address phase only';
      traceTitle.textContent = 'Address NACK reproduced';
      scenarioBadge.textContent = 'Expected fault';
      traceDetail.textContent = 'Firmware sends 0x77; the BME280 model is configured at 0x76 and does not acknowledge the address.';
      updateLabels([
        { x: 119, label: 'START' },
        { x: 310, label: '0x77(W)' },
        { x: 512, label: 'NACK' },
        { x: 830, label: 'STOP' }
      ]);
      setResult(false, 'EXPECTED FAULT — address byte 0x77 is NACKed. Root-cause candidate: incorrect firmware address constant.');
    } else if (selected === 'sda-low') {
      observedTime.textContent = '25.0 ms';
      observedContext.textContent = 'timeout, recovery invoked';
      traceTitle.textContent = 'Bus-stuck condition reproduced';
      scenarioBadge.textContent = 'Expected fault';
      traceDetail.textContent = 'SDA remains low before transaction start. The controller cannot create a valid START condition and times out.';
      updateLabels([
        { x: 146, label: 'SDA low before START' },
        { x: 714, label: 'timeout' }
      ]);
      setResult(false, 'EXPECTED FAULT — SDA is stuck low. Inspect pull-ups, bus ownership, wiring, or recovery behavior.');
    } else {
      observedTime.textContent = boundaryTime.toFixed(1) + ' ms';
      observedContext.textContent = '3 data bytes returned';
      traceTitle.textContent = 'Clock-rate boundary test';
      scenarioBadge.textContent = 'Boundary test';
      traceDetail.textContent = 'A valid transaction is modeled at reduced bus speed; the timing criterion is evaluated independently.';
      updateLabels([
        { x: 119, label: 'START' },
        { x: 274, label: 'address + ACK' },
        { x: 470, label: 'register' },
        { x: 663, label: 'data' },
        { x: 868, label: 'STOP' }
      ]);
      if (boundaryTime <= 10) {
        setResult(true, 'PASS — ' + clockRate + ' kHz completes in ' + boundaryTime.toFixed(1) + ' ms and meets the timing requirement.');
      } else {
        setResult(false, 'EXPECTED TIMING VIOLATION — ' + clockRate + ' kHz completes in ' + boundaryTime.toFixed(1) + ' ms, above the 10 ms requirement.');
      }
    }
  }

  function restoreNominal() {
    scenario.value = 'nominal';
    rate.value = '400';
    runTest();
  }

  rate.addEventListener('input', function () {
    rateLabel.textContent = rate.value + ' kHz';
  });
  scenario.addEventListener('change', runTest);
  runButton.addEventListener('click', runTest);
  resetButton.addEventListener('click', restoreNominal);
  runTest();
}());
