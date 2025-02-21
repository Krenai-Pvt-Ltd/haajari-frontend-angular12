import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExistPolicyComponent } from './exist-policy.component';

describe('ExistPolicyComponent', () => {
  let component: ExistPolicyComponent;
  let fixture: ComponentFixture<ExistPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExistPolicyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExistPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
