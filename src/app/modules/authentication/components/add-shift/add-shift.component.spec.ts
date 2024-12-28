import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShiftComponent } from './add-shift.component';

describe('AddShiftComponent', () => {
  let component: AddShiftComponent;
  let fixture: ComponentFixture<AddShiftComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddShiftComponent]
    });
    fixture = TestBed.createComponent(AddShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
