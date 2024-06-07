import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlackInstallationSuccessfullComponent } from './slack-installation-successfull.component';

describe('SlackInstallationSuccessfullComponent', () => {
  let component: SlackInstallationSuccessfullComponent;
  let fixture: ComponentFixture<SlackInstallationSuccessfullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlackInstallationSuccessfullComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlackInstallationSuccessfullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
