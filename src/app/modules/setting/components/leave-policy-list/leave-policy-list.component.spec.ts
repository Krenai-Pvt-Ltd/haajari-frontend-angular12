import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavePolicyListComponent } from './leave-policy-list.component';

describe('LeavePolicyListComponent', () => {
  let component: LeavePolicyListComponent;
  let fixture: ComponentFixture<LeavePolicyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeavePolicyListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeavePolicyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
