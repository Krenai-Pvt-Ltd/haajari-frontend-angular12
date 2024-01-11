import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css']
})
export class AuthenticationComponent implements OnInit {

  readonly key = Key;
  _router : any;
  constructor(private router: Router){
    this._router = router;
  }

  ngOnInit(): void {
  }

}
