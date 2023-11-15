import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlackAuthComponent } from './slack-auth.component';

describe('SlackAuthComponent', () => {
  let component: SlackAuthComponent;
  let fixture: ComponentFixture<SlackAuthComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SlackAuthComponent]
    });
    fixture = TestBed.createComponent(SlackAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
