import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySettingComponent } from './company-setting.component';

describe('CompanySettingComponent', () => {
  let component: CompanySettingComponent;
  let fixture: ComponentFixture<CompanySettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanySettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
