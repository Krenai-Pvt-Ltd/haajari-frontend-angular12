import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-earning-details',
  templateUrl: './earning-details.component.html',
  styleUrls: ['./earning-details.component.css']
})
export class EarningDetailsComponent implements OnInit {

  @Input() earningId!: any;
  activeTab:any;

  constructor(
    private activateRoute : ActivatedRoute,
    private router : Router
  ) {
    if (this.activateRoute.snapshot.queryParamMap.has('earningId')) {
      this.earningId = this.activateRoute.snapshot.queryParamMap.get('earningId');
    }
    if (this.activateRoute.snapshot.queryParamMap.has('tab')) {
      this.activeTab = this.activateRoute.snapshot.queryParamMap.get('tab');
    }
    console.log(this.earningId);
  }

  ngOnInit(): void {
  }


  routeBack(tabName:string){
    this.router.navigate(['/payroll/configuration'], {
      queryParams: { tab : tabName}
    });
  }
}
