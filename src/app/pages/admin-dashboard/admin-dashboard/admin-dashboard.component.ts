import { Component } from '@angular/core';
import { Router } from '@angular/router';

interface DashboardLink {
  label: string;
  description: string;
  path: string[];
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  links: DashboardLink[] = [
    {
      label: 'Consent Metrics',
      description: 'Analyze consent funnel health and widget outcomes.',
      path: ['consent'],
    },
    {
      label: 'Collect Metrics',
      description: 'Monitor eHI exports and resource collection throughput.',
      path: ['collect'],
    },
    {
      label: 'Payment Metrics',
      description: 'Billing visibility and financial indicators (coming soon).',
      path: ['payment'],
    },
  ];

  constructor(private readonly router: Router) {}

  isLinkActive(link: DashboardLink): boolean {
    const tree = this.router.createUrlTree(['/admin', ...link.path]);
    return this.router.isActive(tree, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }
}
