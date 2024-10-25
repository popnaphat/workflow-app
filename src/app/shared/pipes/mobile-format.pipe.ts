// mobile-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mobileFormat',
  standalone: true
})
export class MobileFormatPipe implements PipeTransform {

  transform(value: string): string {
    const m1 = value.slice(0, 3)
    const m2 = value.slice(3, 6)
    const m3 = value.slice(6)
    return `${m1}-${m2}-${m3}`
  }

}
