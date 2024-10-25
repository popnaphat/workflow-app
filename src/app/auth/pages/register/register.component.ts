import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { AuthService } from '../../auth.service';
import { Role } from '../../models/logged-in-user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [JsonPipe, ReactiveFormsModule, AlertModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  // router
  router = inject(Router);

  /// auth.service
  authService = inject(AuthService);

  // init form
  fb = inject(NonNullableFormBuilder);
  username = this.fb.control('', { validators: [Validators.required, Validators.minLength(4)] });
  password = this.fb.control('', { validators: [Validators.required, Validators.minLength(6)] });
  role = this.fb.control<Role>(Role.USER, { validators: [Validators.required] });  // ค่าเริ่มต้นเป็น USER

  fg = this.fb.group({
    username: this.username,
    password: this.password,
    role: this.role
  });

  // error
  error = false;
  message: string | null = null;

  onRegister(): void {
    this.authService.register(this.fg.getRawValue()).subscribe({
      next: () => {
        // เมื่อลงทะเบียนสำเร็จ ไปที่หน้า login
        this.router.navigate(['/auth/login']);
      },
      error: (errorResponse) => {
        this.error = true;
        this.message = errorResponse.error?.message || 'Registration failed.';
      }
    });
  }
}
