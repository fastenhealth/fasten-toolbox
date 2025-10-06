import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { AdminLoginComponent } from './admin-login.component';
import {ToolboxService} from "../../../services/toolbox.service";

describe('AdminLoginComponent', () => {
  let component: AdminLoginComponent;
  let fixture: ComponentFixture<AdminLoginComponent>;
  const sessionSubject = new Subject<null>();
  const adminAuthServiceStub = {
    session$: sessionSubject.asObservable(),
    startGoogleWorkspaceLogin: jasmine.createSpy('startGoogleWorkspaceLogin'),
    establishSession: jasmine.createSpy('establishSession'),
  } as Partial<ToolboxService> as ToolboxService;

  const activatedRouteStub = {
    queryParamMap: of(convertToParamMap({})),
  } as Partial<ActivatedRoute> as ActivatedRoute;

  const routerStub = {
    navigateByUrl: jasmine.createSpy('navigateByUrl'),
  } as Partial<Router> as Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminLoginComponent ],
      imports: [FormsModule],
      providers: [
        { provide: ToolboxService, useValue: adminAuthServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdminLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
