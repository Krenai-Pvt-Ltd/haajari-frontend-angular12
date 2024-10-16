import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewFormComponent } from './preview-form.component';

describe('PreviewFormComponent', () => {
  let component: PreviewFormComponent;
  let fixture: ComponentFixture<PreviewFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
