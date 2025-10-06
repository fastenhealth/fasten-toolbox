import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentMetricsComponent } from './consent-metrics.component';

describe('ConsentMetricsComponent', () => {
  let component: ConsentMetricsComponent;
  let fixture: ComponentFixture<ConsentMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsentMetricsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsentMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
