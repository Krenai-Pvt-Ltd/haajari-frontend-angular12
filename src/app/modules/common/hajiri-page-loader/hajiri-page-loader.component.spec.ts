import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HajiriPageLoaderComponent } from './hajiri-page-loader.component';

describe('HajiriPageLoaderComponent', () => {
  let component: HajiriPageLoaderComponent;
  let fixture: ComponentFixture<HajiriPageLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HajiriPageLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HajiriPageLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
