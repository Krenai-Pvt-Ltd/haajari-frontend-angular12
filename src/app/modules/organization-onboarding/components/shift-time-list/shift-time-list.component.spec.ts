import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftTimeListComponent } from './shift-time-list.component';

describe('ShiftTimeComponent', () => {
  let component: ShiftTimeListComponent;
  let fixture: ComponentFixture<ShiftTimeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShiftTimeListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftTimeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
