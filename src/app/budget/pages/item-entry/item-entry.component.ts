//item-entry.component.ts
import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { MobileFormatPipe } from '../../../shared/pipes/mobile-format.pipe';
import { ItemService } from '../../item.service';
import { Item, ItemStatus } from '../../models/item';
import { BudgetPlanComponent } from '../../components/budget-plan/budget-plan.component';
import { BudgetPlanService } from '../../budget-plan.service';

@Component({
  selector: 'app-item-entry',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MobileFormatPipe,
    DecimalPipe,
    RouterLink,
    BudgetPlanComponent,
    CommonModule,
  ],
  templateUrl: './item-entry.component.html',
  styleUrls: ['./item-entry.component.scss'],
})
export class ItemEntryComponent implements OnInit, OnDestroy {
  private destroy = new Subject<void>();
  
  items: Item[] = [];
  filterItems: Item[] = [];
  filterInput = new FormControl<string>('', { nonNullable: true });
  filterItemsNumber = 0;
  currentPage = 1;
  totalItems = 0;
  limit = 10;
  totalPages = 0;
  
  modalService = inject(BsModalService);
  bsModalRef?: BsModalRef;
  itemService = inject(ItemService);
  budgetPlanService = inject(BudgetPlanService);

  ngOnInit() {
    // เริ่มต้นโดยการโหลดข้อมูลทั้งหมดเพื่อคำนวณ pagination
    this.itemService.list().subscribe(items => {
      this.totalItems = items.length;
      this.totalPages = Math.ceil(this.totalItems / this.limit);
      this.updateBudgetPlan(items);
      
      // หลังจากได้ข้อมูลทั้งหมดแล้ว จึงโหลดข้อมูลหน้าแรก
      this.loadItems(this.currentPage);
      console.log(this.totalItems)
    });
    
    // Setup filter with debounce
    this.filterInput.valueChanges
      .pipe(
        takeUntil(this.destroy),
        debounceTime(300),  //หน่วง 0.3 วิ
        distinctUntilChanged() //emit ค่าใหม่เมื่อค่านั้นแตกต่างจากค่าก่อนหน้า
      )
      .subscribe(keyword => {
        this.currentPage = 1; // Reset to first page on new search
        this.loadFilteredItems(keyword);
      });
  }

  ngOnDestroy() {
    //emit ค่าและ complete Subject เมื่อ component ถูกทำลาย
    this.destroy.next();
    this.destroy.complete();
  }

  loadFilteredItems(keyword: string) {
    if (keyword) {
      // First get total count for pagination
      this.itemService.getByTitle(keyword).subscribe(items => {
        this.filterItemsNumber = items.length;
        this.updatePagination();
        
        // Then get paginated results
        this.itemService
          .getByTitle(keyword, this.currentPage, this.limit)
          .subscribe(items => {
            this.items = items;
            this.filterItems = items;
          });
      });
    } else {
      // If no keyword, load normal paginated items
      this.itemService.list().subscribe(items => {
        this.totalItems = items.length;
        this.totalPages = Math.ceil(this.totalItems / this.limit);
        this.updateBudgetPlan(items);
        this.loadItems(this.currentPage);
      });
    }
  }

  loadItems(page: number) { 
    this.itemService.list(page, this.limit).subscribe(items => {
      this.items = items;
      this.filterItems = items;
      console.log(page)
    });
  }

  updatePagination() {
    this.totalItems = this.filterItemsNumber;
    this.totalPages = Math.ceil(this.totalItems / this.limit);
    console.log(this.totalItems)
  }

  updateBudgetPlan(items: Item[]) {
    const used = items
      .filter((v) => v.status === ItemStatus.APPROVED)
      .map((v) => +v.amount)
      .reduce((p, v) => p + v, 0);
    this.budgetPlanService.updateUsed(used);
  }

  onPageChange(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) {
      return;
    }

    this.currentPage = newPage;
    const keyword = this.filterInput.value;
    
    if (keyword) {
      this.itemService
        .getByTitle(keyword, this.currentPage, this.limit)
        .subscribe(items => {
          this.items = items;
          this.filterItems = items;
        });
    } else {
      this.loadItems(this.currentPage);
    }
  }

  onConfirm(item: Item) {
    const initialState: ModalOptions = {
      initialState: {
        title: `ยืนยันการลบ "${item.title}" ?`,
      },
    };
    this.bsModalRef = this.modalService.show(
      ConfirmModalComponent,
      initialState,
    );
    this.bsModalRef?.onHidden?.subscribe(() => {
      if (this.bsModalRef?.content?.confirmed) {
        this.onDelete(item.id);
      }
    });
  }

  onDelete(id: number) {
    this.itemService
      .delete(id)
      .subscribe(() => {
        this.filterItems = this.filterItems.filter((v) => v.id != id);
        // Refresh the total count and current page
        const keyword = this.filterInput.value;
        if (keyword) {
          this.loadFilteredItems(keyword);
        } else {
          this.loadItems(this.currentPage);
        }
      });
  }

  trackById(index: number, item: Item): number {
    return item.id;
  }
}
