// login.component.ts
import { JsonPipe, CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AuthService } from '../../auth.service';
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [JsonPipe, ReactiveFormsModule, AlertModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export  class LoginComponent implements OnInit {
  @Input()   //listen keycloak response and assign in 'code' variable 
  code = ''; //keycloak ส่ง accessToken, refreshToken แต่structureจะไม่เหมือนloginปกติ
  // router
  route = inject(ActivatedRoute);
  router = inject(Router);

  /// auth.service
  authService = inject(AuthService);

  // init form
  fb = inject(NonNullableFormBuilder);
  username = this.fb.control('');
  password = this.fb.control('');

  fg = this.fb.group({
    username: this.username,
    password: this.password
  });

  // error
  error?: any;
  isLoading = false;

  ngOnInit() {
    if (this.code) {
      console.log(this.code)
      this.authService
        .loginOauth2(this.code)
        .subscribe(() => this.router.navigate(['/']));
    }
  }

  onLogin() {
    this.isLoading = true;
    this.authService.login(this.fg.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        Swal.fire({ // แสดง SweetAlert2 เมื่อล็อกอินสำเร็จ
          title: 'Success!',
          text: 'Login successful.',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate([returnUrl]);
        });
      },
      error: (error) => {
        this.error = error;
        Swal.fire({ // แสดง SweetAlert2 เมื่อล็อกอินล้มเหลว
          title: 'Error!',
          text: 'Login failed. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        }).then(() => {
          this.isLoading = false;
        });
      },
      complete: () => {
        this.isLoading = false; // ตั้งค่า isLoading เป็น false เมื่อเสร็จสิ้น
      }
    });
  }
}
