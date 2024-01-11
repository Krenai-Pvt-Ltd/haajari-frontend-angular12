import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotifactionTostComponent } from './notifaction-toast.component';

describe('NotifactionTostComponent', () => {
  let component: NotifactionTostComponent;
  let fixture: ComponentFixture<NotifactionTostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotifactionTostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotifactionTostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => { 
    expect(component).toBeTruthy();
  });
});
