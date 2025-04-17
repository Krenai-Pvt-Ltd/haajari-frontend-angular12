import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OverallAttendanceChartComponent } from './overall-attendance-chart.component';

describe('OverallAttendanceChartComponent', () => {
  let component: OverallAttendanceChartComponent;
  let fixture: ComponentFixture<OverallAttendanceChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OverallAttendanceChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OverallAttendanceChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
