import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddShiftPlaceholderComponent } from './add-shift-placeholder.component';

describe('AddShiftPlaceholderComponent', () => {
  let component: AddShiftPlaceholderComponent;
  let fixture: ComponentFixture<AddShiftPlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddShiftPlaceholderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddShiftPlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
