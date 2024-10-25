import { FormControl } from "@angular/forms";
import { thMobile } from "./th-mobile.validator";

describe('ThMobile', () => {
  it('is thai', () => {
    const fc = new FormControl('0891234567')
    expect(thMobile(fc)).toBeNull()
  });

  it('is not thai mobile', () => {
    const fc = new FormControl('0291234567')
    expect(thMobile(fc)).toEqual({ thMobile: true })
  });

});
