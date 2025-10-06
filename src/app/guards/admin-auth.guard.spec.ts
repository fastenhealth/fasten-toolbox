import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AdminAuthGuard } from './admin-auth.guard';
import {ToolboxService} from "../services/toolbox.service";

describe('AdminAuthGuard', () => {
  let guard: AdminAuthGuard;
  const toolboxServiceStub = {
    readAdminToken(): string | null {
      return "valid-token";
    },
  } as Partial<ToolboxService> as ToolboxService;

  const routerStub = {
    createUrlTree: jasmine.createSpy('createUrlTree'),
  } as Partial<Router> as Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: ToolboxService, useValue: toolboxServiceStub },
        { provide: Router, useValue: routerStub },
      ],
    });
    guard = TestBed.inject(AdminAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
