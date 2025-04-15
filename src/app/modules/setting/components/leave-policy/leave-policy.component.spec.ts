import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeavePolicyComponent } from './leave-policy.component';

describe('LeavePolicyComponent', () => {
  let component: LeavePolicyComponent;
  let fixture: ComponentFixture<LeavePolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeavePolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeavePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
