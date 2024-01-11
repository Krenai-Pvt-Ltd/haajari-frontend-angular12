import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelerySettingComponent } from './selery-setting.component';

describe('SelerySettingComponent', () => {
  let component: SelerySettingComponent;
  let fixture: ComponentFixture<SelerySettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelerySettingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelerySettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
