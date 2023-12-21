import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlackDataLoaderComponent } from './slack-data-loader.component';

describe('SlackDataLoaderComponent', () => {
  let component: SlackDataLoaderComponent;
  let fixture: ComponentFixture<SlackDataLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlackDataLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SlackDataLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
