import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-epmployee-finance',
  templateUrl: './epmployee-finance.component.html',
  styleUrls: ['./epmployee-finance.component.css']
})
export class EpmployeeFinanceComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    const svg = document.querySelector('svg');
    const linesGroup = document.getElementById('lines');
    const fractionText = document.querySelector('.fraction');
    const increaseBtn = document.getElementById('increaseBtn');

    const totalLines = 70; // Number of lines
    const radius = 90;
    const center = 100;
    const lineLength = 18;
    const lineWidth = 3;

    let currentValue = 24;
    const maxValue = 30;

    // Create all lines
    for (let i = 0; i < totalLines; i++) {
      const angle = (i * 360 / totalLines) * (Math.PI / 180);
      const x1 = center + (radius - lineLength) * Math.cos(angle);
      const y1 = center + (radius - lineLength) * Math.sin(angle);
      const x2 = center + radius * Math.cos(angle);
      const y2 = center + radius * Math.sin(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1.toString());
      line.setAttribute('y1', y1.toString());
      line.setAttribute('x2', x2.toString());
      line.setAttribute('y2', y2.toString());
      line.setAttribute('stroke-width', lineWidth.toString());
      line.setAttribute('stroke', '#eee');
      line.classList.add('line');
      linesGroup?.appendChild(line);
    }

    function setProgress(value: number) {
      const progress = value / maxValue;
      const activeLines = Math.floor(totalLines * progress);

      const lines = document.querySelectorAll('.line');
      lines.forEach((line, index) => {
        line.setAttribute('stroke', index < activeLines ? '#6b7feb' : '#eee');
      });

      if (fractionText) {
        fractionText.textContent = `${value}/${maxValue}`;
      }

      if (increaseBtn) {
        // increaseBtn.disabled = value >= maxValue;
      }
    }

    function increaseProgress() {
      if (currentValue < maxValue) {
        currentValue = Math.min(currentValue + Math.ceil(maxValue * 0.25), maxValue);
        setProgress(currentValue);
      }
    }

    if (increaseBtn) {
      increaseBtn.addEventListener('click', increaseProgress);
    }

    // Set initial progress
    setProgress(currentValue);



  }

}


