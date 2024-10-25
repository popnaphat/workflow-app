import { Routes } from '@angular/router';
import { ItemEntryComponent } from './pages/item-entry/item-entry.component';
import { ItemFormComponent } from './pages/item-form/item-form.component';
import { ItemApprovalComponent } from './pages/item-approval/item-approval.component';
import { rolesGuard } from '../auth/guards/roles.guard';
import { Role } from '../auth/models/logged-in-user';
import { canDeactivateGuard } from '../auth/guards/can-deactivate.guard';

export const routes: Routes = [
  { path: 'item-entry', component: ItemEntryComponent, title: 'Entry' },
  { path: 'item-entry/add', component: ItemFormComponent, title: 'Add' , canDeactivate: [canDeactivateGuard]},
  { path: 'item-entry/edit/:id', component: ItemFormComponent, title: 'Edit' , canDeactivate: [canDeactivateGuard]},
  {
    path: 'item-approval',
    component: ItemApprovalComponent,
    title: 'Approval',
    canActivate: [rolesGuard([Role.ADMIN, Role.MANAGER])],
  },
];

export default routes;
