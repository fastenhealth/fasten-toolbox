import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectMetricsComponent } from './collect-metrics.component';

describe('CollectMetricsComponent', () => {
  let component: CollectMetricsComponent;
  let fixture: ComponentFixture<CollectMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectMetricsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
