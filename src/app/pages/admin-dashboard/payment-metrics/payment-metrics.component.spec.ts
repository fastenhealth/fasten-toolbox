import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMetricsComponent } from './payment-metrics.component';

describe('PaymentMetricsComponent', () => {
  let component: PaymentMetricsComponent;
  let fixture: ComponentFixture<PaymentMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentMetricsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
