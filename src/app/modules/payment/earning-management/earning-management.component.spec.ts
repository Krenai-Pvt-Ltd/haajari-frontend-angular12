import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningManagementComponent } from './earning-management.component';

describe('EarningManagementComponent', () => {
  let component: EarningManagementComponent;
  let fixture: ComponentFixture<EarningManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EarningManagementComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EarningManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
