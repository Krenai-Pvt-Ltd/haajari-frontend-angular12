import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingSettingComponent } from './onboarding-setting.component';

describe('OnboardingSettingComponent', () => {
  let component: OnboardingSettingComponent;
  let fixture: ComponentFixture<OnboardingSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OnboardingSettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
