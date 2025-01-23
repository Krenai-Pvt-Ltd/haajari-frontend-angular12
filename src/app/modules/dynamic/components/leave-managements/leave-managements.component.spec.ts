import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveManagementsComponent } from './leave-managements.component';

describe('LeaveManagementsComponent', () => {
  let component: LeaveManagementsComponent;
  let fixture: ComponentFixture<LeaveManagementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaveManagementsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveManagementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
