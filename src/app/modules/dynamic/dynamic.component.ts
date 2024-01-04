import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';


@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.css']
})
export class DynamicComponent implements OnInit {

  readonly key = Key;
  _router : any;
  constructor(private router: Router){
    this._router = router;
  }

  ngOnInit(): void {
    
  }

}
