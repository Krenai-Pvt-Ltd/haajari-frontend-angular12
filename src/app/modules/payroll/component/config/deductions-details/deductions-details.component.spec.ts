import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeductionsDetailsComponent } from './deductions-details.component';

describe('DeductionsDetailsComponent', () => {
  let component: DeductionsDetailsComponent;
  let fixture: ComponentFixture<DeductionsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeductionsDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeductionsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
