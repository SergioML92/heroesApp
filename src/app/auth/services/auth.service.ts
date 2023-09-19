import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environments } from 'src/environments/environments';
import { User } from '../interfaces/user.interface';
import { Observable, catchError, map, tap, of } from 'rxjs';

@Injectable({providedIn: 'root'})
export class AuthService {

  private baseUrl: string = environments.baseUrl
  private user?: User;

  constructor(private http: HttpClient) { }

  get currentUser(): User|undefined {

    if (!this.user) return undefined;

    // Creamos una copia profunda
    return structuredClone(this.user);
    //return {...this.user};
  }

  login(user: string, password: string): Observable<User> {

    // http.post('login', { email, password });

    return this.http.get<User>(`${ this.baseUrl }/users/1`)
      .pipe(
        tap( user => this.user = user ),
        tap( user => localStorage.setItem('token', user.id.toString()) ),
      );
  }

  checkAuthentication(): Observable<boolean> {

    if ( !localStorage.getItem('token')) return of(false);

    const token = localStorage.getItem('token');

    return this.http.get<User>(`${this.baseUrl}/users/1`)
      .pipe(
        tap( user => this.user = user),
        map( user => !!user ),
        catchError( err => of(false))
      )
    ;
  }

  logout() {
    this.user = undefined;
    localStorage.clear();
  }
}

