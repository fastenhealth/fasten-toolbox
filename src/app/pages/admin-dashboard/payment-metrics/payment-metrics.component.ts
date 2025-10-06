import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-metrics',
  templateUrl: './payment-metrics.component.html',
  styleUrls: ['./payment-metrics.component.scss']
})
export class PaymentMetricsComponent {
  upcomingHighlights = [
    'Subscription revenue performance',
    'Outstanding invoices and aging',
    'Usage-based cost breakdowns',
    'Alerts for expiring payment methods',
  ];
}
