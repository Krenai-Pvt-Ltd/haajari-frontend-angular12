import { CdkDragDrop, moveItemInArray, transferArrayItem,CdkDrag,CdkDropList } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
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


  backlog = ['6', '5', '7', '8'];
  done=['9', '10', '11','12','13','14'];
  inprogress = ['1', '2','3','4'];
  testing = ['15', '16', '17'];
  todo = ['18','19'];


  drop(event: CdkDragDrop<string[]>) {
    console.log("event=-======",event);
    if (event.previousContainer == event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

}


