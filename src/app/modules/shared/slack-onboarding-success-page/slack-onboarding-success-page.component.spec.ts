import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlackOnboardingSuccessPageComponent } from './slack-onboarding-success-page.component';

describe('SlackOnboardingSuccessPageComponent', () => {
  let component: SlackOnboardingSuccessPageComponent;
  let fixture: ComponentFixture<SlackOnboardingSuccessPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlackOnboardingSuccessPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlackOnboardingSuccessPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
