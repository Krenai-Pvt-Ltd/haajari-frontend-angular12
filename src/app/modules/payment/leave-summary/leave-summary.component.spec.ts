import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveSummaryComponent } from './leave-summary.component';

describe('LeaveSummaryComponent', () => {
  let component: LeaveSummaryComponent;
  let fixture: ComponentFixture<LeaveSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveSummaryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
