import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcadmicComponent } from './acadmic.component';

describe('AcadmicComponent', () => {
  let component: AcadmicComponent;
  let fixture: ComponentFixture<AcadmicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcadmicComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcadmicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
