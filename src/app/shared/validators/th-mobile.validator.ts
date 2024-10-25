import { AbstractControl, ValidationErrors } from "@angular/forms";

export const thMobile = (c: AbstractControl): ValidationErrors | null => {
  return /^(06|08|09)/.test(c.getRawValue()) ? null : { thMobile: true };
};
