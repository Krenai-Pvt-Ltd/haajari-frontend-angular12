import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkentryComponent } from './workentry.component';

describe('WorkentryComponent', () => {
  let component: WorkentryComponent;
  let fixture: ComponentFixture<WorkentryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkentryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkentryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
