import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-temporary',
  templateUrl: './temporary.component.html',
  styleUrls: ['./temporary.component.css']
})
export class TemporaryComponent {

  //constructor(private dataService: DataService) {
  //   this.Settings = {
  //     singleSelection: false,
  //     text: 'Select Module',
  //     enableSearchFilter: true,
  //     selectAllText: 'Select All',
  //     unSelectAllText: 'UnSelect All',
  //   };
  //  }

  //  Settings: { singleSelection: boolean; text: string; enableSearchFilter: boolean; selectAllText: string; unSelectAllText: string; };

  // searchQuery: string = '';
  // userList: User[] = [];

  // searchUsers() {
  //   this.dataService.getUserByUserName(this.searchQuery).subscribe(users => {
  //     this.userList = users;
  //   });
  // }

  // selectUser(user: User) {
  //   this.searchQuery = user.name; // Populate the search input with the user's name
  //   this.userList = []; // Clear the user dropdown
  // }




  Settings: {
    singleSelection: boolean;
    text: string;
    enableSearchFilter: boolean;
    selectAllText: string;
    unSelectAllText: string;
  };

  searchQuery: string = '';
  userList: User[] = [];
  selectedUsers: User[] = [];

  constructor(private dataService: DataService) {
    this.Settings = {
      singleSelection: false,
      text: 'Select Module',
      enableSearchFilter: true,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
    };
  }

  searchUsers() {
    this.dataService.getUserByUserName(this.searchQuery).subscribe((users) => {
      this.userList = users;
    });
  }

  toggleUserSelection(user: User) {
    const index = this.selectedUsers.indexOf(user);
    if (index === -1) {
      this.selectedUsers.push(user); // Add the selected user to the selectedUsers array
    } else {
      this.selectedUsers.splice(index, 1); // Remove the user from the selectedUsers array
    }
  }

  removeSelectedUser(user: User) {
    const index = this.selectedUsers.indexOf(user);
    if (index !== -1) {
      this.selectedUsers.splice(index, 1); // Remove the user from the selectedUsers array
    }
  }




// Richa
//   itemList:any= [];
//   selectedItems:any = [];
//   settings = {};


//   ngOnInit() {


//     this.itemList = [
//       {"id":1,"itemName":"India","name":"IN"},
//                           {"id":2,"itemName":"Singapore","name":"SN"},
//                           {"id":3,"itemName":"Australia","name":"AU"},
//                           {"id":4,"itemName":"Canada","name":"CA"},
//                           {"id":5,"itemName":"South Korea","name":"SK"},    
//                           {"id":6,"itemName":"Brazil","name":"BR"}    
//     ];

//     this.selectedItems = [
//       {"id":1,"itemName":"India","name":"IN"},
//                           {"id":2,"itemName":"Singapore","name":"SN"},
//                           {"id":3,"itemName":"Australia","name":"AU"},
//                           {"id":4,"itemName":"Canada","name":"CA"}];
//     this.settings = {
//       singleSelection: false,
//       text: "Select Countries",
//       selectAllText: 'Select All',
//       unSelectAllText: 'UnSelect All',
//       enableSearchFilter: true,
//       badgeShowLimit: 3,
//       searchBy: ['itemName'],
//       searchPlaceholderText: 'Search by name' 
//     };
//   }
//   onItemSelect(item: any) {
//     console.log(item);
//     console.log(this.selectedItems);
//   }
//   OnItemDeSelect(item: any) {
//     console.log(item);
//     console.log(this.selectedItems);
//   }
//   onSelectAll(items: any) {
//     console.log(items);
//   }
//   onDeSelectAll(items: any) {
//     console.log(items);
//   }


}
