import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonToDoStepsComponent } from './common-to-do-steps.component';

describe('CommonToDoStepsComponent', () => {
  let component: CommonToDoStepsComponent;
  let fixture: ComponentFixture<CommonToDoStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonToDoStepsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonToDoStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
