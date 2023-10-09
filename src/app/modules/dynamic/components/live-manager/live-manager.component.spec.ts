import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveManagerComponent } from './live-manager.component';

describe('LiveManagerComponent', () => {
  let component: LiveManagerComponent;
  let fixture: ComponentFixture<LiveManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiveManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
