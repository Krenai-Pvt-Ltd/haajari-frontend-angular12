import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalOpen = new BehaviorSubject<boolean>(false);
  openModal(): void {
    this.modalOpen.next(true);
  }
  closeModal(): void {
    this.modalOpen.next(false);
  }
  getModalState(): Observable<boolean> {
    return this.modalOpen.asObservable();
  }
}