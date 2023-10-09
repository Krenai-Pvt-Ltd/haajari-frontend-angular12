import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToSlackComponent } from './add-to-slack.component';

describe('AddToSlackComponent', () => {
  let component: AddToSlackComponent;
  let fixture: ComponentFixture<AddToSlackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddToSlackComponent]
    });
    fixture = TestBed.createComponent(AddToSlackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
