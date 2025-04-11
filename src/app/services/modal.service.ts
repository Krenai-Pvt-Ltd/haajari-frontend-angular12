import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ExitModalComponent } from '../modules/common/exit-modal/exit-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private modalService: NgbModal) { }

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


  openInitiateExitModal(uuid:string, userType: string) {
    const modalRef =this.modalService.open(ExitModalComponent, {
      ariaLabelledBy: 'initiateExitModalLabel',
      size: 'sm', // Available options: 'sm' (small), 'lg' (large), 'xl' (extra-large)
      backdrop: 'static', // Prevents modal from closing when clicking outside
      keyboard: false // Prevents closing on pressing "Escape"
    });
    modalRef.componentInstance.closeModal.subscribe(() => {
      modalRef.close();  // Close the modal when the close event is emitted
    });
    modalRef.componentInstance.data = {
      uuid: uuid,
      userType: userType
    };

    return modalRef.result;
  }
}
