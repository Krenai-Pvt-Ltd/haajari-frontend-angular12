import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingWhatsAppSlackComponent } from './onboarding-whats-app-slack.component';

describe('OnboardingWhatsAppSlackComponent', () => {
  let component: OnboardingWhatsAppSlackComponent;
  let fixture: ComponentFixture<OnboardingWhatsAppSlackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingWhatsAppSlackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingWhatsAppSlackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
