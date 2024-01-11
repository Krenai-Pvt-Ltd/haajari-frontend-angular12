import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Key } from 'src/app/constant/key';
import { HelperService } from 'src/app/services/helper.service';


@Component({
  selector: 'app-dynamic',
  templateUrl: './dynamic.component.html',
  styleUrls: ['./dynamic.component.css']
})
export class DynamicComponent implements OnInit {

  readonly key = Key;
  _router : any;
  constructor(private router: Router,
    private _helperService:HelperService){
    this._router = router;
  }

  ngOnInit(): void {
    
  }

}
