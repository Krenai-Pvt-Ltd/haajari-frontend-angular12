import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShiftTimeComponent } from './add-shift-time.component';

describe('AddShiftTimeComponent', () => {
  let component: AddShiftTimeComponent;
  let fixture: ComponentFixture<AddShiftTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddShiftTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddShiftTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
