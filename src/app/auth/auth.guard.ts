import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanLoad,
  Route,
  Router
} from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { Store } from '@ngrx/store';
import { UIService } from '../shared/ui.service';
import { tap, map, take } from 'rxjs/operators';
import * as fromRoot from '../app.reducer';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private store: Store<fromRoot.State>,
              private angularFireAuth: AngularFireAuth,
              private router: Router,
              private uiService: UIService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.angularFireAuth.authState.pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          this.uiService.showSnackbar('Please Log In!', null, 3000);
          this.router.navigate(['/login']);
        }
      }));
  }

  canLoad(route: Route) {
    return this.angularFireAuth.authState.pipe(
      take(1),
      map(user => !!user),
      tap(loggedIn => {
        if (!loggedIn) {
          this.uiService.showSnackbar('Please Log In!', null, 3000);
          this.router.navigate(['/login']);
        }
      }));
  }
}
