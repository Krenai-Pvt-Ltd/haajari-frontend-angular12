import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingWhatappComponent } from './onboarding-whatapp.component';

describe('OnboardingWhatappComponent', () => {
  let component: OnboardingWhatappComponent;
  let fixture: ComponentFixture<OnboardingWhatappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingWhatappComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingWhatappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
