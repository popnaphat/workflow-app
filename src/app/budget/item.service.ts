//item.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CreateItem, EditIem, Item, ItemStatus } from './models/item';
import { Observable } from 'rxjs';
import { ENV_CONFIG } from '../env.config';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  private envConfig = inject(ENV_CONFIG);
  readonly URL = `${this.envConfig.apiUrl}/items`;
  private httpClient = inject(HttpClient)

  constructor() { }

  list(page?: number, limit?: number): Observable<Item[]> {
    let url = this.URL;
    if (page && limit) {
      url += `?page=${page}&limit=${limit}`;
    }
    return this.httpClient.get<Item[]>(url);
  }
  getByTitle(title: string, page?: number, limit?: number): Observable<Item[]> {
    let url = `${this.URL}/title/${title}`;
    if (page && limit) {
      url += `?page=${page}&limit=${limit}`;
    }
    return this.httpClient.get<Item[]>(url);
  }
  
  get(id: number) {
    return this.httpClient.get<Item>(`${this.URL}/${id}`)
  }
  
  add(item: CreateItem) {
    return this.httpClient.post<Item>(this.URL, item );
  }
  
  edit(id: number, item: EditIem) {
    return this.httpClient.patch<Item>(`${this.URL}/edit/${id}`, item);
  }

  delete(id: number) {
    return this.httpClient.delete<void>(`${this.URL}/${id}`);
  }
  // TODO: temp update by front-end
  approve(id: number) {
    return this.httpClient.patch<Item>(`${this.URL}/${id}/${ItemStatus.APPROVED}`,'');
  }

  reject(id: number) {
    return this.httpClient.patch<Item>(`${this.URL}/${id}/${ItemStatus.REJECTED}`,'');
  }
  
}
