import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-temporary',
  templateUrl: './temporary.component.html',
  styleUrls: ['./temporary.component.css']
})
export class TemporaryComponent implements OnInit {

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
  }

  searchQuery: string = '';
  userList: User[] = [];

  searchUsers() {
    this.dataService.getUserByUserName(this.searchQuery).subscribe(users => {
      this.userList = users;
    });
  }

  selectUser(user: User) {
    this.searchQuery = user.name; // Populate the search input with the user's name
    this.userList = []; // Clear the user dropdown
  }

}
