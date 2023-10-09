import { Component, OnInit, ViewChild } from '@angular/core';
import { Savel } from 'src/app/models/savel';
import { Organization } from 'src/app/models/users';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
      this.getLeaves();
  }

  name: string = "";
  state: string = 'Select State';
  country: string = 'Select Country';
  organizationPic: File | null = null;
  flagOrganization= false;
  flagShiftTimings= false;
  flagQuestions = false;
  flagLeave= false;

  states: string[] = []; 

  countries = [
    {
      name: 'India',
      states: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
    },  
    {
      name: 'Australia',
      states: ['New South Wales', 'Victoria', 'Queensland']
    },
    {
      name: 'Canada',
      states: ['Ontario', 'Quebec', 'British Columbia']
    },
    {
      name: 'United States',
      states: ['California', 'New York', 'Texas']
    },
    {
      name: 'Germany',
      states: ['Bavaria', 'North Rhine-Westphalia', 'Baden-Württemberg']
    },
    {
      name: 'Brazil',
      states: ['São Paulo', 'Rio de Janeiro', 'Minas Gerais']
    },
    {
      name: 'China',
      states: ['Guangdong', 'Shandong', 'Zhejiang']
    },
    {
      name: 'Russia',
      states: ['Moscow', 'Saint Petersburg', 'Sverdlovsk']
    },
    {
      name: 'South Africa',
      states: ['Gauteng', 'KwaZulu-Natal', 'Western Cape']
    },
    {
      name: 'Argentina',
      states: ['Buenos Aires', 'Córdoba', 'Santa Fe']
    },
    {
      name: 'France',
      states: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d']
    },
    {
      name: 'Japan',
      states: ['Tokyo', 'Osaka', 'Kanagawa']
    },
    {
      name: 'Mexico',
      states: ['Mexico City', 'Jalisco', 'Nuevo León']
    },
    {
      name: 'Spain',
      states: ['Madrid', 'Catalonia', 'Andalusia']
    },
    {
      name: 'Italy',
      states: ['Lombardy', 'Lazio', 'Veneto']
    },
    {
      name: 'United Kingdom',
      states: ['England', 'Scotland', 'Wales']
    },
    {
      name: 'Saudi Arabia',
      states: ['Riyadh', 'Makkah', 'Eastern Province']
    },
    {
      name: 'Egypt',
      states: ['Cairo', 'Giza', 'Alexandria']
    },
    {
      name: 'Thailand',
      states: ['Bangkok', 'Phuket', 'Chiang Mai']
    },
    {
      name: 'Nigeria',
      states: ['Lagos', 'Kano', 'Abuja']
    },  
  ];
  
  updateStates() {
    const selectedCountry = this.countries.find(c => c.name === this.country);
    if (selectedCountry) {
      this.states = selectedCountry.states;
    } else {
      this.states = [];
    }
    this.state = 'Select State'; 
  }
 
  
  resetForm2() {
    this.name= '';
    this.state = '';
    this.country = '';
    this.organizationPic = null;
  }
 // @ViewChild('myForm', {static: false}) myForm:any= NgForm;

  register() {
    this.dataService.registerOnboardingDetails(this.name, this.state, this.country, this.organizationPic, this.flagOrganization, this.flagShiftTimings, this.flagQuestions, this.flagLeave).subscribe((resultData: any) => {
      console.log(resultData);
      alert("Organization Registered successfully");
      this.resetForm2();
      // const res=document.getElementById("collapseOne") as HTMLElement | null;
      // if(res){
      //   res!.style.display="none";
      // }
      //this.resetForm1();
      //window.location.reload();
    });
  }

  loginArray: {
    inTime: string,
    outTime: string,
    startLunch: string,
    endLunch: string,
    workingHour: string,
    totalHour: string,
    // flagShiftTimings: any,
  } = {
    inTime: "",
    outTime: "",
    startLunch: "",
    endLunch: "",
    workingHour: "",
    totalHour: "",
    // flagShiftTimings: true,
  };
  
  calculateHours() {
    const inTimeParts = this.loginArray.inTime.split(':');
    const outTimeParts = this.loginArray.outTime.split(':');
    const startLunchParts = this.loginArray.startLunch.split(':');
    const endLunchParts = this.loginArray.endLunch.split(':');
  
    const inHours = parseInt(inTimeParts[0]);
    const inMinutes = parseInt(inTimeParts[1]);
    const outHours = parseInt(outTimeParts[0]);
    const outMinutes = parseInt(outTimeParts[1]);
    const startLunchHours = parseInt(startLunchParts[0]);
    const startLunchMinutes = parseInt(startLunchParts[1]);
    const endLunchHours = parseInt(endLunchParts[0]);
    const endLunchMinutes = parseInt(endLunchParts[1]);
  
    let inTime = inHours * 60 + inMinutes;
    let outTime = outHours * 60 + outMinutes;
    let startLunchTime = startLunchHours * 60 + startLunchMinutes;
    let endLunchTime = endLunchHours * 60 + endLunchMinutes;
  
    if (outTime < inTime) {
      outTime += 24 * 60; // Add 24 hours to outTime to account for the next day
    }
  
    const workingMinutes = (outTime - inTime) - (endLunchTime - startLunchTime);
    const totalMinutes = (outTime - inTime);
  
    const workingHours = Math.floor(workingMinutes / 60);
    const workingMinutesRemainder = workingMinutes % 60;
    console.log(workingMinutesRemainder);
  
    const totalHours = Math.floor(totalMinutes / 60);
    const totalMinutesRemainder = totalMinutes % 60;
    console.log(totalMinutesRemainder);
  
    this.loginArray.workingHour = `${workingHours}:${workingMinutesRemainder}`;
    this.loginArray.totalHour = `${totalHours}:${totalMinutesRemainder}`;
  }
  
  addShift() {
    this.calculateHours();
    console.log(this.loginArray);
    const result2=document.getElementById("abc") as HTMLElement | null;
     if(result2){
       result2.style.display="none";
     }
    alert("Shift Time updated");

    const result=document.getElementById("xyz") as HTMLElement | null;
     if(result){
      result.style.display="block";
     }
    //  const result3=document.getElementById("shifttime") as HTMLElement | null;
    //  if(result3){
    //   result3.style.display="none";
    //  }

     
    
  }
  

  leaveData = {
    leaveType: '',
    leaveEntitled: '',
    leaveStatus: ''
  };

  resetForm() {
    this.leaveData = {
      leaveType: '',
      leaveEntitled: '',
      leaveStatus: ''
    };
  }

  onSubmit() {
    this.dataService.saveLeave(this.leaveData).subscribe(
      (response) => {
        console.log(response);
        alert("Leave saved successfully");
        this.savel.push(response);
        this.resetForm();
        
       // window.location.reload();
       //this.leaveData = {};

      },
      (error) => {
        console.error(error);
        alert("Error saving leave");
      }
    );
  }

  savel: Savel[] = [];

  getLeaves() {
    this.dataService.getLeave().subscribe(data => {
      this.savel = data;
      console.log(this.savel);
    }, (error) => {
      console.log(error);
    })
  }

  updateLeaveStatus(sav: Savel) {
    this.dataService.updateLeaveStatus(sav).subscribe(() => {
      console.log(`Leave status updated for ${sav.leaveType}`);
      alert("Leave status updated");
    
    }, (error) => {
      console.log(error);
    });
  }




  // org: Organization[] = [];

  // updateOrganizationFlag(organization: Organization) {
  //   this.dataService.updateOrganizationFlag(organization).subscribe(() => {
  //     console.log(`flag updated for ${this.org.fla}`);
    
  //   }, (error) => {
  //     console.log(error);
  //   });
  // }


  currentDate = new Date();

  activeModel:number=0;
  setActive(activeNumber:number){
    this.activeModel = activeNumber;
    console.log(this.activeModel);
  }

  resetForm3() {
    this.loginArray = {
      inTime: "",
      outTime: "",
      startLunch: "",
      endLunch: "",
      workingHour: "",
      totalHour: "",
    };
  }
  onSaveShiftTimings() {
    this.dataService.saveShiftTimings(this.loginArray).subscribe(
      (response) => {
        console.log(response);
        alert("Leave saved successfully");
        this.resetForm3();
        const result4=document.getElementById("xyz") as HTMLElement | null;
        if(result4){
          result4.style.display="none";
         }

         const result5=document.getElementById("def") as HTMLElement | null;
        if(result5){
          result5.style.display="block";
         }
      },
      (error) => {
        console.error(error);
        alert("Error saving leave");
      }
    );
  }

  onBtnClick(){
    // Navigate to /products page
    this.router.navigate(['/dynamic/addtoslack']);
  }

  // setAct:any=this.setActive;

  // setActive2(){
  //   if(this.setAct%2==0){
  //      this.settracingicon='active';
  //   }else{
  //      this.
  //   }

  // }

}
