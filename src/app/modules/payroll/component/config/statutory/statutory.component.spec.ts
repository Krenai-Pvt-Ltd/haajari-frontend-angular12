import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatutoryComponent } from './statutory.component';

describe('StatutoryComponent', () => {
  let component: StatutoryComponent;
  let fixture: ComponentFixture<StatutoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatutoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatutoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
