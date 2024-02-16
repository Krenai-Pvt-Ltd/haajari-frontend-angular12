import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidaySettingComponent } from './holiday-setting.component';

describe('HolidaySettingComponent', () => {
  let component: HolidaySettingComponent;
  let fixture: ComponentFixture<HolidaySettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HolidaySettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HolidaySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
