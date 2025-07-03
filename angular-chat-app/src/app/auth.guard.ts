import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ChatStateService } from './services/chat-state.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private chatState: ChatStateService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.chatState.connected$.pipe(
      take(1),
      map(connected => {
        if (!connected) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }
}