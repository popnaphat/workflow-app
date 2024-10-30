// auth.service.ts
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Observable, tap } from 'rxjs';
import { ENV_CONFIG } from '../env.config';
import { LoggedInUser, Tokens, UserProfile, Role } from './models/logged-in-user';
//import { Tokens } from './models/tokens';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private envConfig = inject(ENV_CONFIG);
  readonly URL = `${this.envConfig.apiUrl}/auth/login`;
  readonly TOKENS = 'TOKENS';
  httpClient = inject(HttpClient);
  router = inject(Router);

  loggedInUser: LoggedInUser | null = null;
  private isKeycloakLogin = false;  // เพิ่มตัวแปรนี้เพื่อระบุว่าใช้ Keycloak หรือไม่

  // add
  constructor() {
    const tokensInStorage = sessionStorage.getItem(this.TOKENS);
    if (tokensInStorage) {
      this.setTokens(JSON.parse(tokensInStorage) as Tokens);
    }
  }
  register(userData: { username: string; password: string; role: Role }): Observable<any> {
    //console.log(userData)
    return this.httpClient.post(`${this.envConfig.apiUrl}/users`, userData);
  }

  login(credential: {
    username: string;
    password: string;
  }): Observable<Tokens> {
    this.isKeycloakLogin = false; // เมื่อใช้ระบบภายใน ให้ตั้งเป็น false
    return this.httpClient
      .post<Tokens>(this.URL, credential)
      .pipe(tap((newToken) => this.setTokens(newToken)));
  }

  setTokens(newToken: Tokens) {
    const userProfile = jwtDecode<UserProfile>(newToken.access_token);
    this.loggedInUser = { tokens: newToken, userProfile };
    sessionStorage.setItem(this.TOKENS, JSON.stringify(newToken)); // add
  }

  logout(): void {
    const keycloakLogoutUrl = `http://localhost:8080/realms/pop/protocol/openid-connect/logout?client_id=budget-app&redirect_uri=http://localhost:4200/auth/login`;

    // ลบ token ใน local storage
    this.loggedInUser = null;
    sessionStorage.removeItem(this.TOKENS);

    // ตรวจสอบว่าผู้ใช้ล็อกอินผ่าน Keycloak หรือไม่
    if (this.isKeycloakLogin) {
      window.location.href = keycloakLogoutUrl; // logout ผ่าน Keycloak
    } else {
      this.router.navigate(['/auth/login']); // logout ผ่านระบบภายใน
    }
  }

  refreshToken(): Observable<{ access_token: string }> {
    console.log(AuthService.name);  
    return this.httpClient.post<{ access_token: string }>(
      `${this.envConfig.apiUrl}/auth/refresh`,
      null,
    );
  }

  getLoginOauth2RedirectUrl() {
    return this.httpClient.get<{ redirectUrl: string }>(     //redirectUrl = url หน้า login 3rd party oAuth Keycloak
      `${this.envConfig.apiUrl}/auth/login-oauth2-redirect-url`  
    );
  }

  loginOauth2(code: string) {
    //console.log(code)
    return this.httpClient
      .post<any>(`${this.envConfig.apiUrl}/auth/login-oauth2`, { code })
      .pipe(tap((newToken) => this.setTokens(newToken)));
  }
}
