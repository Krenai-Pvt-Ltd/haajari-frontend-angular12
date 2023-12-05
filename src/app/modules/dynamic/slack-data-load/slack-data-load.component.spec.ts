import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlackDataLoadComponent } from './slack-data-load.component';

describe('SlackDataLoadComponent', () => {
  let component: SlackDataLoadComponent;
  let fixture: ComponentFixture<SlackDataLoadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlackDataLoadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlackDataLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
