import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInWithSlackComponent } from './sign-in-with-slack.component';

describe('SignInWithSlackComponent', () => {
  let component: SignInWithSlackComponent;
  let fixture: ComponentFixture<SignInWithSlackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SignInWithSlackComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignInWithSlackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
