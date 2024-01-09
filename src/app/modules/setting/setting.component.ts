import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css']
})
export class SettingComponent implements OnInit {
  readonly key = Key;
  _router : any;
  constructor(private router: Router){
    this._router = router;
  }

  ngOnInit(): void {
    
  }

}
