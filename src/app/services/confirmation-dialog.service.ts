import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../modules/sharable/confirmation-dialog/confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  constructor(private matDialog : MatDialog) { }

  openConfirmDialog(proceedCallback: () => void, cancelCallback?: () => void) {
    const dialogRef = this.matDialog.open(ConfirmationDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        proceedCallback();
      } else {
        cancelCallback?.();
      }
    });
  }
}

// constructor(private confirmationDialogService: ConfirmationDialogService) {}

//   someMethodThatRequiresConfirmation() {
//     this.confirmationDialogService.openConfirmDialog(
//       () => this.onProceed(), // Method to call on 'Proceed'
//       () => this.onCancel()   // Method to call on 'Cancel' (optional)
//     );
//   }

//   onProceed() {
//     // Logic for when 'Proceed' is clicked
//   }

//   onCancel() {
//     // Logic for when 'Cancel' is clicked (optional)
//   }
