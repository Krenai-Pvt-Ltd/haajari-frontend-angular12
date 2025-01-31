import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingSuccessfulComponent } from './onboarding-successful.component';

describe('OnboardingSuccessfulComponent', () => {
  let component: OnboardingSuccessfulComponent;
  let fixture: ComponentFixture<OnboardingSuccessfulComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingSuccessfulComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingSuccessfulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
  
});
