import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';

type ConsentTimeframe = 'week' | 'month';

interface ConsentRecord {
  timeframe: ConsentTimeframe;
  period: string;
  orgId: string;
  apiMode: string;
  platformType: string;
  brandId: string;
  portalId: string;
  endpointId: string;
  tefcaRootId: string;
  missing: number;
  rejected: number;
  successful: number;
}

interface TreemapBlock {
  platformType: string;
  brandId: string;
  left: number;
  top: number;
  width: number;
  height: number;
  missing: number;
  rejected: number;
  successful: number;
  background: string;
}

const WEEK_PERIODS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_PERIODS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

const CONSENT_SAMPLE_DATA: ConsentRecord[] = buildConsentSampleData();

function buildConsentSampleData(): ConsentRecord[] {
  const platformConfigs = [
    {
      orgId: 'org-100',
      apiMode: 'live',
      platformType: 'EHR',
      brandId: 'EpicCare',
      portalId: 'portal-epic',
      endpointId: 'endpoint-epic',
      tefcaRootId: 'root-a',
      baseMissing: 4,
      baseRejected: 3,
      baseSuccessful: 92,
    },
    {
      orgId: 'org-200',
      apiMode: 'sandbox',
      platformType: 'EHR',
      brandId: 'CernerOne',
      portalId: 'portal-cerner',
      endpointId: 'endpoint-cerner',
      tefcaRootId: 'root-a',
      baseMissing: 6,
      baseRejected: 4,
      baseSuccessful: 78,
    },
    {
      orgId: 'org-100',
      apiMode: 'live',
      platformType: 'Aggregator',
      brandId: 'Particle',
      portalId: 'portal-particle',
      endpointId: 'endpoint-particle',
      tefcaRootId: 'root-b',
      baseMissing: 3,
      baseRejected: 2,
      baseSuccessful: 65,
    },
    {
      orgId: 'org-300',
      apiMode: 'live',
      platformType: 'HIE',
      brandId: 'CommonWell',
      portalId: 'portal-commonwell',
      endpointId: 'endpoint-commonwell',
      tefcaRootId: 'root-c',
      baseMissing: 5,
      baseRejected: 3,
      baseSuccessful: 88,
    },
  ];

  const records: ConsentRecord[] = [];

  WEEK_PERIODS.forEach((period, periodIndex) => {
    platformConfigs.forEach((config, platformIndex) => {
      const multiplier = 1 + periodIndex * 0.12;
      records.push({
        timeframe: 'week',
        period,
        orgId: config.orgId,
        apiMode: config.apiMode,
        platformType: config.platformType,
        brandId: config.brandId,
        portalId: config.portalId,
        endpointId: config.endpointId,
        tefcaRootId: config.tefcaRootId,
        missing: Math.round(config.baseMissing * multiplier + platformIndex),
        rejected: Math.round(config.baseRejected * multiplier + (periodIndex % 3)),
        successful: Math.max(
          Math.round(config.baseSuccessful * multiplier - platformIndex * 2),
          10
        ),
      });
    });
  });

  MONTH_PERIODS.forEach((period, periodIndex) => {
    platformConfigs.forEach((config, platformIndex) => {
      const multiplier = 1.4 + periodIndex * 0.25;
      records.push({
        timeframe: 'month',
        period,
        orgId: config.orgId,
        apiMode: config.apiMode,
        platformType: config.platformType,
        brandId: config.brandId,
        portalId: config.portalId,
        endpointId: config.endpointId,
        tefcaRootId: config.tefcaRootId,
        missing: Math.round(config.baseMissing * multiplier + platformIndex * 1.5),
        rejected: Math.round(config.baseRejected * multiplier + periodIndex),
        successful: Math.max(
          Math.round(config.baseSuccessful * multiplier - platformIndex * 3),
          20
        ),
      });
    });
  });

  return records;
}

@Component({
  selector: 'app-consent-metrics',
  templateUrl: './consent-metrics.component.html',
  styleUrls: ['./consent-metrics.component.scss']
})
export class ConsentMetricsComponent implements OnInit, OnDestroy {
  filtersForm: FormGroup;
  barChartLabels: Label[] = [];
  barChartData: ChartDataSets[] = [];
  barChartOptions: ChartOptions = {};
  treemapBlocks: TreemapBlock[] = [];
  timeframeOptions: ConsentTimeframe[] = ['week', 'month'];
  filterOptions: Record<string, string[]> = {};
  private subscriptions = new Subscription();

  constructor(private readonly fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      orgId: [''],
      apiMode: [''],
      platformType: [''],
      brandId: [''],
      portalId: [''],
      endpointId: [''],
      tefcaRootId: [''],
      timeframe: ['week'],
    });

    this.barChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        position: 'bottom',
      },
      tooltips: {
        mode: 'index',
        callbacks: {
          label: (tooltipItem, data) => {
            const dataset = data.datasets?.[tooltipItem.datasetIndex ?? 0];
            const label = dataset?.label ? `${dataset.label}: ` : '';
            const rawValue = Number(tooltipItem.yLabel || 0);
            return `${label}${Math.abs(rawValue)}`;
          },
        },
      },
      scales: {
        xAxes: [
          {
            stacked: true,
            gridLines: { display: false },
          },
        ],
        yAxes: [
          {
            stacked: true,
            ticks: {
              callback: (value: string | number) => {
                const numeric = typeof value === 'string' ? Number(value) : value;
                return Math.abs(numeric as number);
              },
            },
          },
        ],
      },
    };
  }

  ngOnInit(): void {
    this.buildFilterOptions();
    this.updateVisualisations();
    this.subscriptions.add(
      this.filtersForm.valueChanges.subscribe(() => this.updateVisualisations())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setTimeframe(timeframe: ConsentTimeframe): void {
    if (this.filtersForm.value.timeframe === timeframe) {
      return;
    }
    this.filtersForm.patchValue({ timeframe });
  }

  clearFilters(): void {
    this.filtersForm.reset({
      orgId: '',
      apiMode: '',
      platformType: '',
      brandId: '',
      portalId: '',
      endpointId: '',
      tefcaRootId: '',
      timeframe: this.currentTimeframe,
    });
  }

  get currentTimeframe(): ConsentTimeframe {
    return this.filtersForm.value.timeframe;
  }

  private buildFilterOptions(): void {
    const fieldNames: Array<keyof ConsentRecord> = [
      'orgId',
      'apiMode',
      'platformType',
      'brandId',
      'portalId',
      'endpointId',
      'tefcaRootId',
    ];

    fieldNames.forEach((field) => {
      const uniqueValues = Array.from(
        new Set(CONSENT_SAMPLE_DATA.map((record) => record[field] as string))
      ).sort();
      this.filterOptions[field] = uniqueValues;
    });
  }

  private updateVisualisations(): void {
    const timeframe = this.currentTimeframe;
    const filtered = this.applyFilters(timeframe);
    this.configureBarChart(filtered, timeframe);
    this.configureTreemap(filtered);
  }

  private applyFilters(timeframe: ConsentTimeframe): ConsentRecord[] {
    const {
      orgId,
      apiMode,
      platformType,
      brandId,
      portalId,
      endpointId,
      tefcaRootId,
    } = this.filtersForm.value;

    return CONSENT_SAMPLE_DATA.filter((record) => {
      if (record.timeframe !== timeframe) {
        return false;
      }
      if (orgId && record.orgId !== orgId) {
        return false;
      }
      if (apiMode && record.apiMode !== apiMode) {
        return false;
      }
      if (platformType && record.platformType !== platformType) {
        return false;
      }
      if (brandId && record.brandId !== brandId) {
        return false;
      }
      if (portalId && record.portalId !== portalId) {
        return false;
      }
      if (endpointId && record.endpointId !== endpointId) {
        return false;
      }
      if (tefcaRootId && record.tefcaRootId !== tefcaRootId) {
        return false;
      }
      return true;
    });
  }

  private configureBarChart(records: ConsentRecord[], timeframe: ConsentTimeframe): void {
    const periodOrder = timeframe === 'week' ? WEEK_PERIODS : MONTH_PERIODS;
    const periodMap = new Map<string, { missing: number; rejected: number; successful: number }>();

    records.forEach((record) => {
      if (!periodMap.has(record.period)) {
        periodMap.set(record.period, { missing: 0, rejected: 0, successful: 0 });
      }
      const totals = periodMap.get(record.period)!;
      totals.missing += record.missing;
      totals.rejected += record.rejected;
      totals.successful += record.successful;
    });

    const labels = periodOrder.filter((period) => periodMap.has(period));
    if (!labels.length) {
      this.barChartLabels = [];
      this.barChartData = [];
      return;
    }

    const missingData = labels.map((label) => -periodMap.get(label)!.missing);
    const rejectedData = labels.map((label) => -periodMap.get(label)!.rejected);
    const successfulData = labels.map((label) => periodMap.get(label)!.successful);

    this.barChartLabels = labels;
    this.barChartData = [
      {
        label: 'Missing',
        data: missingData,
        backgroundColor: '#f59e0b',
      },
      {
        label: 'Rejected',
        data: rejectedData,
        backgroundColor: '#dc2626',
      },
      {
        label: 'Successful',
        data: successfulData,
        backgroundColor: '#16a34a',
      },
    ];
  }

  private configureTreemap(records: ConsentRecord[]): void {
    const platformMap = new Map<
      string,
      {
        total: number;
        missing: number;
        rejected: number;
        successful: number;
        brands: Map<
          string,
          { total: number; missing: number; rejected: number; successful: number }
        >;
      }
    >();

    records.forEach((record) => {
      const platform = platformMap.get(record.platformType) ?? {
        total: 0,
        missing: 0,
        rejected: 0,
        successful: 0,
        brands: new Map(),
      };

      platform.total += record.missing + record.rejected + record.successful;
      platform.missing += record.missing;
      platform.rejected += record.rejected;
      platform.successful += record.successful;

      const brand = platform.brands.get(record.brandId) ?? {
        total: 0,
        missing: 0,
        rejected: 0,
        successful: 0,
      };

      brand.total += record.missing + record.rejected + record.successful;
      brand.missing += record.missing;
      brand.rejected += record.rejected;
      brand.successful += record.successful;

      platform.brands.set(record.brandId, brand);
      platformMap.set(record.platformType, platform);
    });

    const platforms = Array.from(platformMap.entries())
      .map(([platformType, details]) => ({ platformType, ...details }))
      .sort((a, b) => b.total - a.total);

    const totalAll = platforms.reduce((sum, platform) => sum + platform.total, 0);

    if (!totalAll) {
      this.treemapBlocks = [];
      return;
    }

    const blocks: TreemapBlock[] = [];
    let currentX = 0;

    platforms.forEach((platform, platformIndex) => {
      const width = platformIndex === platforms.length - 1
        ? 100 - currentX
        : (platform.total / totalAll) * 100;
      const brands = Array.from(platform.brands.entries())
        .map(([brandId, details]) => ({ brandId, ...details }))
        .sort((a, b) => b.total - a.total);

      let currentY = 0;

      brands.forEach((brand, brandIndex) => {
        const height = brandIndex === brands.length - 1
          ? 100 - currentY
          : platform.total
            ? (brand.total / platform.total) * 100
            : 0;

        if (!width || !height) {
          return;
        }

        blocks.push({
          platformType: platform.platformType,
          brandId: brand.brandId,
          left: currentX,
          top: currentY,
          width,
          height,
          missing: brand.missing,
          rejected: brand.rejected,
          successful: brand.successful,
          background: this.computeTreemapColor(brand.successful, brand.missing + brand.rejected),
        });

        currentY += height;
      });

      currentX += width;
    });

    this.treemapBlocks = blocks;
  }

  private computeTreemapColor(successful: number, unsuccessful: number): string {
    const total = successful + unsuccessful;
    if (!total) {
      return '#9ca3af';
    }
    const successRatio = successful / total;
    const red = Math.round(220 - successRatio * 120);
    const green = Math.round(70 + successRatio * 120);
    const blue = Math.round(90 + successRatio * 60);
    return `rgb(${red}, ${green}, ${blue})`;
  }
}
