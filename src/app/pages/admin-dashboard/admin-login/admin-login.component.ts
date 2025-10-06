import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {ToolboxService} from "../../../services/toolbox.service";
// import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
declare const google: any;

//Admin handler - https://stackoverflow.com/questions/65439066/using-google-one-tap-in-angular

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  returnUrl = '/admin';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private toolboxService: ToolboxService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    //read the redirect url from the query parameters (if any)
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';


    this.initializeGoogleSignIn();
  }

  initializeGoogleSignIn() {
    google.accounts.id.initialize({
      client_id: '768959453419-np80q982qje7irrfuq7a300rdurb9vsd.apps.googleusercontent.com',
      auto_select: true,
      cancel_on_tap_outside: false,
      callback: (response: any) => this.handleCredentialResponse(response)
    });

    google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      { theme: 'outline', size: 'large' }  // customization attributes
    );

    google.accounts.id.prompt((notification: any) => {
      console.log('Google prompt event triggered...');

      if (notification.getDismissedReason() === 'credential_returned') {
        this.ngZone.run(() => {
          this.router.navigate(['myapp/somewhere'], { replaceUrl: true });
          console.log('Welcome back!');
        });
      }
    }); // also display the One Tap dialog
  }

  handleCredentialResponse(response: any) {
    // response.credential is the JWT token
    console.log('Encoded JWT ID token: ' + response.credential);

    // You can decode the JWT token here or send it to your backend for verification
    // For demonstration, we'll just log it

    // If using NgZone, ensure any UI updates are run inside Angular's zone
    this.ngZone.run(() => {
      this.toolboxService.storeAdminToken(response.credential);
      // Update your application state here, e.g., store user info, navigate, etc.
      this.redirectToDashboard()
    });
  }

  private redirectToDashboard(): void {
    void this.router.navigateByUrl(this.returnUrl || '/admin');
  }
}
