import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Key } from 'src/app/constant/key';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css'],
})
export class ProjectComponent implements OnInit {
  constructor(private eRef: ElementRef) {}

  ngOnInit(): void {
    window.scroll(0, 0);
  }

  // todo:string[] = ["Get to work", "Pick up groceries", "Go home", "Fall asleep"];

  // done:string[] = ["Get up", "Brush teeth", "Take a shower", "Check e-mail", "Walk dog"];

  // inpro:string[] = ["Get up", "Brush teeth", "Take a shower", "Check e-mail", "Walk dog"];

  // drop(event: any) {
  //   console.log("event==========",event);
  //   // if (event.previousContainer === event.container) {
  //     moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  //   // } else {
  //   //   transferArrayItem(
  //   //     event.previousContainer.data,
  //   //     event.container.data,
  //   //     event.previousIndex,
  //   //     event.currentIndex,
  //   //   );
  //   // }
  // }

  BOARD = Key.BOARD;
  LIST = Key.LIST;
  dataFormat = Key.BOARD;

  changeDateFormat(dataFormat: number) {
    this.dataFormat = dataFormat;
  }

  changeDataFormat(dataFormat: number) {
    this.dataFormat = dataFormat;
  }

  backlog = ['6', '5', '7', '8'];
  done = ['9', '10', '11', '12', '13', '14'];
  inprogress = ['1', '2', '3', '4'];
  testing = ['15', '16', '17'];
  todo = ['18', '19'];

  drop(event: CdkDragDrop<string[]>) {
    // console.log('event=-======', event);
    if (event.previousContainer == event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
  menuToggle: boolean = false;
  menuToggleFunction() {
    this.menuToggle = !this.menuToggle;
  }

  noAssigneeFlag: boolean = false;
  hideInputInfoFlag: boolean = true;
  noAssignee() {
    this.noAssigneeFlag = true;
  }

  hideInputInfo() {
    this.noAssigneeFlag = false;
    this.hideInputInfoFlag = false;
  }

  // @ViewChild('inputBox') inputBox!: ElementRef;

  // @HostListener('document:click', ['$event'])
  // clickOutside(event: any): void {
  //   if (!this.inputBox.nativeElement.contains(event.target)) {
  //     this.outsideClick();
  //   }
  // }

  // outsideClick(): void {
  //   this.noAssigneeFlag=false;
  //   console.log('Clicked outside the input box');
  // }

  date = null;
  onChange(result: Date): void {
    console.log('onChange: ', result);
  }

  dueDateFlag: boolean = false;
  dueDate() {
    this.dueDateFlag = true;
  }

  addProjectFlag: boolean = false;
  addProject() {
    this.addProjectFlag = true;
  }

  addDependenciesFlag: boolean = false;
  addDependencies() {
    this.addDependenciesFlag = true;
  }

  addNewtaskFlag: boolean = false;
  addNewtask() {
    this.addNewtaskFlag = true;
  }

  addNewmemberFlag: boolean = false;
  addNewmember() {
    if (this.addNewmemberFlag == true) {
      this.addNewmemberFlag = false;
    } else {
      this.addNewmemberFlag = true;
    }
  }

  isOpenInput: boolean = false;
  openInput() {
    this.isOpenInput = true;
  }

  isAsigneeInput: boolean = false;
  asigneeInput() {
    this.isAsigneeInput = true;
  }

  isDueInput: boolean = false;
  duedateInput() {
    this.isDueInput = true;
  }

  isPriortyInput: boolean = false;
  priortyInput() {
    this.isPriortyInput = true;
  }

  isStatusInput: boolean = false;
  statusInput() {
    this.isStatusInput = true;
  }

  addAnotherRow: boolean = false;
  addRow() {
    this.addAnotherRow = true;
  }

  isAddInput: boolean = false;
  addfildInput() {
    this.isAddInput = true;
  }
}
