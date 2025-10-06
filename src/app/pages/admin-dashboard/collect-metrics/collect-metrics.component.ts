import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

type CollectTimeframe = 'week' | 'month';

interface CollectRecord {
  timeframe: CollectTimeframe;
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
  resources: number;
}

interface StatusTableRow {
  platformType: string;
  totals: { missing: number; rejected: number; successful: number };
  perPeriod: Record<string, { missing: number; rejected: number; successful: number }>;
}

interface ResourcesTableRow {
  platformType: string;
  resources: number;
  successful: number;
  missing: number;
  rejected: number;
}

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_BUCKETS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

const COLLECT_SAMPLE_DATA: CollectRecord[] = buildCollectSampleData();

function buildCollectSampleData(): CollectRecord[] {
  const platformConfigs = [
    {
      orgId: 'org-100',
      apiMode: 'live',
      platformType: 'EHR',
      brandId: 'EpicCare',
      portalId: 'portal-epic',
      endpointId: 'endpoint-epic',
      tefcaRootId: 'root-a',
      baseRequests: { missing: 5, rejected: 2, successful: 90 },
      resourceMultiplier: 12,
    },
    {
      orgId: 'org-200',
      apiMode: 'sandbox',
      platformType: 'EHR',
      brandId: 'CernerOne',
      portalId: 'portal-cerner',
      endpointId: 'endpoint-cerner',
      tefcaRootId: 'root-a',
      baseRequests: { missing: 6, rejected: 5, successful: 70 },
      resourceMultiplier: 9,
    },
    {
      orgId: 'org-300',
      apiMode: 'live',
      platformType: 'Aggregator',
      brandId: 'Particle',
      portalId: 'portal-particle',
      endpointId: 'endpoint-particle',
      tefcaRootId: 'root-b',
      baseRequests: { missing: 4, rejected: 3, successful: 55 },
      resourceMultiplier: 8,
    },
    {
      orgId: 'org-400',
      apiMode: 'live',
      platformType: 'HIE',
      brandId: 'CommonWell',
      portalId: 'portal-commonwell',
      endpointId: 'endpoint-commonwell',
      tefcaRootId: 'root-c',
      baseRequests: { missing: 3, rejected: 2, successful: 62 },
      resourceMultiplier: 10,
    },
  ];

  const records: CollectRecord[] = [];

  WEEK_DAYS.forEach((period, periodIndex) => {
    platformConfigs.forEach((config, platformIndex) => {
      const growthFactor = 1 + periodIndex * 0.08;
      const missing = Math.round(config.baseRequests.missing * growthFactor + platformIndex);
      const rejected = Math.round(config.baseRequests.rejected * growthFactor + (periodIndex % 3));
      const successful = Math.max(
        Math.round(config.baseRequests.successful * growthFactor - platformIndex * 2),
        15
      );

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
        missing,
        rejected,
        successful,
        resources: Math.round((missing + rejected + successful) * config.resourceMultiplier * 0.6),
      });
    });
  });

  MONTH_BUCKETS.forEach((period, periodIndex) => {
    platformConfigs.forEach((config, platformIndex) => {
      const growthFactor = 1.3 + periodIndex * 0.18;
      const missing = Math.round(config.baseRequests.missing * growthFactor + platformIndex * 2);
      const rejected = Math.round(config.baseRequests.rejected * growthFactor + periodIndex);
      const successful = Math.max(
        Math.round(config.baseRequests.successful * growthFactor - platformIndex * 4),
        35
      );

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
        missing,
        rejected,
        successful,
        resources: Math.round((missing + rejected + successful) * config.resourceMultiplier),
      });
    });
  });

  return records;
}

@Component({
  selector: 'app-collect-metrics',
  templateUrl: './collect-metrics.component.html',
  styleUrls: ['./collect-metrics.component.scss']
})
export class CollectMetricsComponent implements OnInit, OnDestroy {
  filtersForm: FormGroup;
  filterOptions: Record<string, string[]> = {};
  statusTableRows: StatusTableRow[] = [];
  resourcesTableRows: ResourcesTableRow[] = [];
  weekDays = WEEK_DAYS;
  monthBuckets = MONTH_BUCKETS;
  timeframe: CollectTimeframe = 'week';
  private subscriptions = new Subscription();

  constructor(private readonly fb: FormBuilder) {
    this.filtersForm = this.fb.group({
      orgId: [''],
      apiMode: [''],
      brandId: [''],
      portalId: [''],
      endpointId: [''],
      tefcaRootId: [''],
    });
  }

  ngOnInit(): void {
    this.buildFilterOptions();
    this.updateTables();
    this.subscriptions.add(
      this.filtersForm.valueChanges.subscribe(() => this.updateTables())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setTimeframe(timeframe: CollectTimeframe): void {
    if (this.timeframe === timeframe) {
      return;
    }
    this.timeframe = timeframe;
    this.updateTables();
  }

  clearFilters(): void {
    this.filtersForm.reset({
      orgId: '',
      apiMode: '',
      brandId: '',
      portalId: '',
      endpointId: '',
      tefcaRootId: '',
    });
  }

  private buildFilterOptions(): void {
    const fields: Array<keyof CollectRecord> = [
      'orgId',
      'apiMode',
      'brandId',
      'portalId',
      'endpointId',
      'tefcaRootId',
    ];

    fields.forEach((field) => {
      const uniqueValues = Array.from(
        new Set(COLLECT_SAMPLE_DATA.map((record) => record[field] as string))
      ).sort();
      this.filterOptions[field] = uniqueValues;
    });
  }

  private updateTables(): void {
    const filters = this.filtersForm.value;

    const filteredRecords = COLLECT_SAMPLE_DATA.filter((record) => {
      if (filters.orgId && record.orgId !== filters.orgId) {
        return false;
      }
      if (filters.apiMode && record.apiMode !== filters.apiMode) {
        return false;
      }
      if (filters.brandId && record.brandId !== filters.brandId) {
        return false;
      }
      if (filters.portalId && record.portalId !== filters.portalId) {
        return false;
      }
      if (filters.endpointId && record.endpointId !== filters.endpointId) {
        return false;
      }
      if (filters.tefcaRootId && record.tefcaRootId !== filters.tefcaRootId) {
        return false;
      }
      return true;
    });

    this.statusTableRows = this.buildStatusRows(filteredRecords);
    this.resourcesTableRows = this.buildResourceRows(filteredRecords, this.timeframe);
  }

  private buildStatusRows(records: CollectRecord[]): StatusTableRow[] {
    const weekRecords = records.filter((record) => record.timeframe === 'week');
    const platformMap = new Map<
      string,
      {
        totals: { missing: number; rejected: number; successful: number };
        perPeriod: Record<string, { missing: number; rejected: number; successful: number }>;
      }
    >();

    weekRecords.forEach((record) => {
      if (!platformMap.has(record.platformType)) {
        const perPeriod: Record<string, { missing: number; rejected: number; successful: number }> = {};
        WEEK_DAYS.forEach((day) => {
          perPeriod[day] = { missing: 0, rejected: 0, successful: 0 };
        });
        platformMap.set(record.platformType, {
          totals: { missing: 0, rejected: 0, successful: 0 },
          perPeriod,
        });
      }

      const platformEntry = platformMap.get(record.platformType)!;
      platformEntry.totals.missing += record.missing;
      platformEntry.totals.rejected += record.rejected;
      platformEntry.totals.successful += record.successful;

      if (!platformEntry.perPeriod[record.period]) {
        platformEntry.perPeriod[record.period] = { missing: 0, rejected: 0, successful: 0 };
      }

      const perDay = platformEntry.perPeriod[record.period];
      perDay.missing += record.missing;
      perDay.rejected += record.rejected;
      perDay.successful += record.successful;
    });

    return Array.from(platformMap.entries())
      .map(([platformType, values]) => ({ platformType, ...values }))
      .sort((a, b) => (b.totals.missing + b.totals.rejected + b.totals.successful) - (a.totals.missing + a.totals.rejected + a.totals.successful));
  }

  private buildResourceRows(records: CollectRecord[], timeframe: CollectTimeframe): ResourcesTableRow[] {
    const scopedRecords = records.filter((record) => record.timeframe === timeframe);
    const platformMap = new Map<string, ResourcesTableRow>();

    scopedRecords.forEach((record) => {
      const current = platformMap.get(record.platformType) ?? {
        platformType: record.platformType,
        resources: 0,
        successful: 0,
        missing: 0,
        rejected: 0,
      };

      current.resources += record.resources;
      current.successful += record.successful;
      current.missing += record.missing;
      current.rejected += record.rejected;

      platformMap.set(record.platformType, current);
    });

    return Array.from(platformMap.values()).sort((a, b) => b.resources - a.resources);
  }
}
