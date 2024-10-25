export enum ItemStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export type CreateItem = Omit<Item, 'id'>;

export type EditIem = CreateItem

export interface Item {
  id: number;
  title: string;
  amount: number;
  quantity: number;
  contactMobileNo: string;
  status: ItemStatus;
}
