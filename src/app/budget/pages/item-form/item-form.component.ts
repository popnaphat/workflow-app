import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe, Location } from '@angular/common';
import { thMobile } from '../../../shared/validators/th-mobile.validator';
import { ItemService } from '../../item.service';
import { ItemStatus } from '../../models/item';
import { CanComponentDeactivate } from '../../../auth/guards/can-deactivate.guard';
import { Observable } from 'rxjs';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [ReactiveFormsModule, JsonPipe],
  templateUrl: './item-form.component.html',
  styleUrl: './item-form.component.scss'
})
export class ItemFormComponent implements OnInit, CanComponentDeactivate {

  @Input()
  id: number | null = null;

  // injects
  location = inject(Location);
  fb = inject(NonNullableFormBuilder)
  itemService = inject(ItemService)
  router = inject(Router);

  // formControls
  title = this.fb.control<string>('', { validators: Validators.required });
  contactMobileNo = this.fb.control<string>('', { validators: [Validators.required, thMobile] });
  amount = this.fb.control<number>(0, { validators: [Validators.required, Validators.min(0.5)] });
  quantity = this.fb.control<number>(0, { validators: [Validators.required, Validators.min(1)] });

  // formGroup
  fg = this.fb.group({
    title: this.title,
    contactMobileNo: this.contactMobileNo,
    quantity: this.quantity,
    amount: this.amount
  })
   // add 
  modalService = inject(BsModalService)
  bsModalRef?: BsModalRef;
  isEditMode: boolean = false;

  ngOnInit() {
    console.log('id', this.id)
    if (this.id) {
      this.isEditMode = true;
      this.itemService.get(this.id).subscribe(v => this.fg.patchValue({
        ...v,
        amount: +v.amount // Convert price to number
      }))
    }
  }


  onBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    const item = { ...this.fg.getRawValue(), status: ItemStatus.PENDING };
    console.log(item);
    
    if (this.id) {
      this.itemService.edit(this.id, item).subscribe(() => {
        this.fg.markAsPristine();  // fg.dirty is false after edit
        this.router.navigate([`/budget/item-entry/`]);
      });
    } else {
      this.itemService.add(item).subscribe(() => {
        this.fg.markAsPristine();  // fg.dirty is false after add
        this.router.navigate([`/budget/item-entry/`]);
      });
    }
  }
  
  
  canDeactivate(): boolean | Observable<boolean> {

    // check is dirty-form
    const isFormDirty = this.fg.dirty
    console.log('isFormDirty', isFormDirty)
    if (!isFormDirty) {
      return true;
    }

    // init comfirm modal
    const initialState: ModalOptions = {
      initialState: {
        title: `Confirm to leave" ?`
      }
    };
    this.bsModalRef = this.modalService.show(ConfirmModalComponent, initialState);

    return new Observable<boolean>((observer) => {
      this.bsModalRef?.onHidden?.subscribe(() => {
        observer.next(this.bsModalRef?.content?.confirmed);
        observer.complete()
      })  
    })
  }
}
