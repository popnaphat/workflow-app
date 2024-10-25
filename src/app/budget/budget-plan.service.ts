// budget-plan.service.ts
import { computed, Injectable, signal } from '@angular/core';
import { BudgetPlan } from './models/budget-plan';

const YEAR_BUDGETS = [
  {
    year: 2023,
    total: 200000
  },
  {
    year: 2024,
    total: 100000
  },
  {
    year: 2025,
    total: 500000
  }
];

@Injectable({
  providedIn: 'root'
})
export class BudgetPlanService {
  readonly DEFAULT_AVAILABLE_PERCENT = 10;

  budgetPlanState = signal<BudgetPlan>({
    year: 0,
    total: 0,
    available: 0,
    used: 0
  });

  balanceState = computed(() => {
    return this.budgetPlanState().available - this.budgetPlanState().used
  });

  constructor() {
    const year = new Date().getFullYear();
    const yearBudget = YEAR_BUDGETS.find((v) => v.year === year);
    this.budgetPlanState.update(v => ({ ...v, ...yearBudget }))
  }

  updateAvailable(percent: number) {
    this.budgetPlanState.update(v => {
      const available = v.total - (v.total * percent) / 100;
      return { ...v, available };
    })
  }

  updateUsed(used: number) {
    this.budgetPlanState.update(v => ({ ...v, used }))
  }
}
