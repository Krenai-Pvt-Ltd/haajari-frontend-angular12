import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatRuleComponent } from './creat-rule.component';

describe('CreatRuleComponent', () => {
  let component: CreatRuleComponent;
  let fixture: ComponentFixture<CreatRuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatRuleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatRuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
