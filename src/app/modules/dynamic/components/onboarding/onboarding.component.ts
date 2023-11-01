import {
  Component,
  OnInit,
  Output,
  ViewChild,
  EventEmitter,
  ElementRef,
} from "@angular/core";
import { Savel } from "src/app/models/savel";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  NgForm,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { DataService } from "src/app/services/data.service";
import { Organization } from "src/app/models/organization";
import { ShiftTimings } from "src/app/models/shifttimings";
import { DailyQuestionsCheckout } from "src/app/models/daily-questions-check-out";
import { DailyNotes } from "src/app/models/daily-notes";
import { DailyQuestionsCheckIn } from "src/app/models/daily-questions-check-in";

@Component({
  selector: "app-onboarding",
  templateUrl: "./onboarding.component.html",
  styleUrls: ["./onboarding.component.css"],
})
export class OnboardingComponent implements OnInit {
  // shiftTimingsForm: FormGroup;

  constructor(
    private dataService: DataService,
    private router: Router,
    private fb: FormBuilder,
  ) {
    // this.shiftTimingsForm = this.fb.group({
    //   inTime: ["", Validators.required],
    //   outTime: ["", Validators.required],
    //   startLunch: ["", [Validators.required]],
    //   endLunch: ["", [Validators.required]],
    // });
  }

  ngOnInit(): void {
    this.getOrganization();
    this.getShifts();
    this.settingOrgId();
    this.getDailyQuestionCheckIn();
    this.getDailyQuestion();
    this.getDailyNotes();
    this.getLeaves();
  

    //   window.addEventListener("beforeunload", function (e) {
    //     var confirmationMessage = "\o/";
    //     console.log("cond");
    //     e.returnValue = confirmationMessage;
    //     return confirmationMessage;
    // });
  }
  id: number = this.getLoginDetailsOrgRefId();
  name: string = "";
  email: string = "";
  password: string = "";
  state: string = "";
  country: string = "";
  organizationPic: File | null = null;

  states: string[] = [];
  organization!: Organization;
  orgI: any;

  countries = [
    {
      name: "India",
      states: [
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chhattisgarh",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Odisha",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttar Pradesh",
        "Uttarakhand",
        "West Bengal",
      ],
    },
    {
      name: "Australia",
      states: ["New South Wales", "Victoria", "Queensland"],
    },
    {
      name: "Canada",
      states: ["Ontario", "Quebec", "British Columbia"],
    },
    {
      name: "United States",
      states: ["California", "New York", "Texas"],
    },
    {
      name: "Germany",
      states: ["Bavaria", "North Rhine-Westphalia", "Baden-Württemberg"],
    },
    {
      name: "Brazil",
      states: ["São Paulo", "Rio de Janeiro", "Minas Gerais"],
    },
    {
      name: "China",
      states: ["Guangdong", "Shandong", "Zhejiang"],
    },
    {
      name: "Russia",
      states: ["Moscow", "Saint Petersburg", "Sverdlovsk"],
    },
    {
      name: "South Africa",
      states: ["Gauteng", "KwaZulu-Natal", "Western Cape"],
    },
    {
      name: "Argentina",
      states: ["Buenos Aires", "Córdoba", "Santa Fe"],
    },
    {
      name: "France",
      states: [
        "Île-de-France",
        "Auvergne-Rhône-Alpes",
        "Provence-Alpes-Côte d",
      ],
    },
    {
      name: "Japan",
      states: ["Tokyo", "Osaka", "Kanagawa"],
    },
    {
      name: "Mexico",
      states: ["Mexico City", "Jalisco", "Nuevo León"],
    },
    {
      name: "Spain",
      states: ["Madrid", "Catalonia", "Andalusia"],
    },
    {
      name: "Italy",
      states: ["Lombardy", "Lazio", "Veneto"],
    },
    {
      name: "United Kingdom",
      states: ["England", "Scotland", "Wales"],
    },
    {
      name: "Saudi Arabia",
      states: ["Riyadh", "Makkah", "Eastern Province"],
    },
    {
      name: "Egypt",
      states: ["Cairo", "Giza", "Alexandria"],
    },
    {
      name: "Thailand",
      states: ["Bangkok", "Phuket", "Chiang Mai"],
    },
    {
      name: "Nigeria",
      states: ["Lagos", "Kano", "Abuja"],
    },
  ];

 selectCountry(selectedCountry: string) {
    this.country = selectedCountry;
    this.updateStates();
  }

  // selectCountry(selectedCountry: string) {
  //   this.country = selectedCountry;
  // }
  updateStates() {
    const selectedCountryData = this.countries.find((c) => c.name === this.country);
    if (selectedCountryData) {
      this.states = selectedCountryData.states; // Update the states based on the selected country
    } else {
      this.states = []; // Clear the states if no country is selected
    }
  }

  


  resetForm2() {
    this.name = "";
    this.email = "";
    this.password = "";
    this.state = "";
    this.country = "";
    this.organizationPic = null;
  }

  shiftTimingsValid = false;
  // eId:string="";
  // pass:string="";
  isSecondSectionOpen = false;

  

  register() {
    if (this.businessInfoForm.invalid) {
      this.BusinessInfoSetInvalidToggle = true;
      return;
    }
    
    this.dataService
      .registerOnboardingDetails(
        this.id,
        this.name,
        this.email,
        this.password,
        this.state,
        this.country,
        this.organizationPic
      )
      .subscribe(
        (resultData: any) => {
          console.log(resultData);
          this.country = resultData.country;
          this.state = resultData.state;
          this.loginArray.organizationId = resultData.id;
          this.leaveData.orgId = resultData.id;
          this.dailyQuestionsCheckInData.organnId=resultData.id;
          this.dailyQuestionsData.organId = resultData.id;
          this.dailyNotesData.organiId = resultData.id;
          this.shiftTimingsValid = true;
          //  this.eId=resultData.email;
          //  this.pass=resultData.password;
          //  console.log(this.eId, this.pass);
          //  this.signUp(this.eId, this.pass)
          // alert("Organization Registered successfully, Please Click on Shift Timings");
          // this.resetForm2();
          // this.orgI = this.organization.id;
          this.shiftTimesMessage();
          this.count = 1;
          this.onBusinessInfoCompleted();

          // this.requestShiftTimingsCloseModel.nativeElement.setAttribute("ariaExpanded", "false");
         
          this.requestBusinessInfoCloseModel.nativeElement.click();
         
          this.isSecondSectionOpen = true;

          this.setAct1();
          this.orgI = resultData.id;
          localStorage.setItem("orgId", this.orgI);
          //window.location.reload();
         
        },
        (error) => {
          console.log(error.error.message);
        }
      );
  }
   
  settingOrgId() {
    let orgnIds = this.getLoginDetailsOrgRefId();

    if (orgnIds) {
      this.loginArray.organizationId = +orgnIds;

      this.leaveData.orgId = +orgnIds;
      this.dailyQuestionsCheckInData.organnId= +orgnIds;
      this.dailyQuestionsData.organId = +orgnIds;
      this.dailyNotesData.organiId = +orgnIds;
    }
  }

  // setAct2() {
  //   this.setActive(1);
  // }

  // org: Organization[] = [];
  org: Organization = new Organization();
  a: number = 0;
  getOrganization() {
    this.dataService.getOrg(this.getLoginDetailsOrgRefId()).subscribe(
      (data) => {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        debugger
        this.state = data.state;
        this.country = data.country;
        this.organizationPic = data.organizationPic;

        this.updateStates();
        
        if (data.country !== null) {
          debugger
          this.setActive(1);
          this.count=1;
          if (this.a == 2) {
            this.setActive(1);
            this.setActive(2);
            this.count=2;
          }
          if (this.a == 3) {
            this.setActive(1);
            this.setActive(2);
            this.setActive(3);
            this.count=3;
          }
          if (this.a == 4) {
            this.setActive(1);
            this.setActive(2);
            this.setActive(3);
            this.setActive(4);
            this.count=4;
          }
          this.requestBusinessInfoCloseModel.nativeElement.click();
        }

        if (data.country!==null) {
          this.shiftTimingsValid = true;
          this.onBusinessInfoCompleted();
          this.shiftTimesMessage();
        }
        if (this.a == 4) {
          this.a = 4;
        } else if (this.a == 3) {
          this.a = 3;
        } else if (this.a == 2) {
          this.a = 2;
        } else {
          this.a = 1;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  shifttimings: ShiftTimings = new ShiftTimings();

  getShifts() {
    this.dataService.getShiftTimings(this.getLoginDetailsOrgRefId()).subscribe(
      (data) => {
        // this.setActive(1);
        this.loginArray.inTime = data.inTime;
        this.loginArray.outTime = data.outTime;
        this.loginArray.startLunch = data.startLunch;
        this.loginArray.endLunch = data.endLunch;
        this.loginArray.workingHour = data.workingHour;
        this.loginArray.totalHour = data.totalHour;

        if (data) {
          this.dailyQuesValid = true;
          this.dailyQuestMessage();
        }

        if (data.minLength !== 0) {
          this.setActive(1);
          this.setActive(2);
          this.count=2;
          if (this.a == 4) {
            this.setActive(1);
            this.setActive(2);
            this.setActive(3);
            this.setActive(4);
            this.count=4;
          }
          if (this.a == 3) {
            this.setActive(1);
            this.setActive(2);
            this.setActive(3);
            this.count=3;
          }
        }
        if (data) {
          this.onBusinessInfoCompleted();
          this.onShiftTimingsCompleted();
        }

        if (this.a == 4) {
          this.a = 4;
         
        } else if (this.a == 3) {
          this.a = 3;
          
        } else {
          this.a = 2;
         
        }
        this.requestShiftTimingsCloseModel.nativeElement.click();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  loginArray: {
    inTime: string;
    outTime: string;
    startLunch: string;
    endLunch: string;
    workingHour: string;
    totalHour: string;
    organizationId: number;
  } = {
    inTime: "",
    outTime: "",
    startLunch: "",
    endLunch: "",
    workingHour: "",
    totalHour: "",
    organizationId: 0,
  };

  calculateHours() {
    const inTimeParts = this.loginArray.inTime.split(":");
    const outTimeParts = this.loginArray.outTime.split(":");
    const startLunchParts = this.loginArray.startLunch.split(":");
    const endLunchParts = this.loginArray.endLunch.split(":");

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
      outTime += 24 * 60;
    }

    const workingMinutes = outTime - inTime - (endLunchTime - startLunchTime);
    const totalMinutes = outTime - inTime;

    const workingHours = Math.floor(workingMinutes / 60);
    const workingMinutesRemainder = workingMinutes % 60;
    console.log(workingMinutesRemainder);

    const totalHours = Math.floor(totalMinutes / 60);
    const totalMinutesRemainder = totalMinutes % 60;
    console.log(totalMinutesRemainder);

    this.loginArray.workingHour = `${workingHours}:${workingMinutesRemainder}`;
    this.loginArray.totalHour = `${totalHours}:${totalMinutesRemainder}`;
  }

  
  @ViewChild("shiftForm") shiftForm!: any;
  @ViewChild("requestShiftCloseModel") requestShiftCloseModel!: ElementRef;

  shiftSetInvalidToggle: boolean = false;

  addShift() {
    if (this.shiftForm.invalid) {
      this.shiftSetInvalidToggle = true;
      return;
    }
      this.calculateHours();
      console.log(this.loginArray);
      this.requestShiftCloseModel.nativeElement.click();
  }

  leaveData = {
    leaveType: "",
    leaveEntitled: "",
    leaveStatus: "",
    orgId: 0,
  };

  resetForm() {
    this.leaveData = {
      leaveType: "",
      leaveEntitled: "",
      leaveStatus: "",
      orgId: this.leaveData.orgId,
    };
  }

  @ViewChild("businessInfoForm", { static: false })
  businessInfoForm!: NgForm;
  // @ViewChild('businessInfoForm') businessInfoForm!:any
  @ViewChild("requestBusinessInfoCloseModel")
  requestBusinessInfoCloseModel!: ElementRef;

  BusinessInfoSetInvalidToggle: boolean = false;

  setAct1() {
    if (this.businessInfoForm.valid) {
      this.setActive(1);
    }
  }

  @ViewChild("leaveSetForm") leaveSetForm!: any;
  @ViewChild("requestLeaveCloseModel") requestLeaveCloseModel!: ElementRef;

  leaveSetInvalidToggle: boolean = false;

  setAct() {
    if (this.leaveSetForm.valid) {
      this.setActive(4);
    }
  }

  @ViewChild(" requestSaveLeavCloseModel")
  requestSaveLeavCloseModel!: ElementRef;

  saveLeaveValid = false;

  onSubmit() {
    if (this.leaveSetForm.invalid) {
      this.leaveSetInvalidToggle = true;
      return;
    }
    this.dataService.saveLeave(this.leaveData).subscribe(
      (response) => {
        console.log(response);
        this.savel.push(response);
        this.count = 4;

        // const result2=document.getElementById("cba") as HTMLElement | null;
        // if(result2){
        //      result2.style.display="none";
        //  }
        // const result=document.getElementById("zyx") as HTMLElement | null;
        // if(result){
        //     result.style.display="block";
        // }
        this.requestLeaveCloseModel.nativeElement.click();
        // alert("Leave saved successfully");
        this.resetForm();
        // window.location.reload();
      },
      (error) => {
        console.error(error);
        alert("Error saving leave");
      }
    );
  }

  // noData:any="Please add leaves";

  savel: Savel[] = [];
  
 
  getLeaves() {
    this.dataService.getLeave(this.leaveData.orgId).subscribe(
      (data) => {
        this.savel = data;
        if (data.minLength !== 0) {
          this.setActive(1);
          this.setActive(2);
          this.setActive(3);
          this.setActive(4);
          this.count=4;
        }
       
        console.log(this.savel);
        this.a = 4;
       
      },
      (error) => {
        console.log(error);

        // const result4=document.getElementById("pqr") as HTMLElement | null;
        //   if(result4){
        //     result4.style.display="none";
        //    }

        // const result5=document.getElementById("cba") as HTMLElement | null;
        //   if(result5){
        //     result5.style.display="block";
        //    }
      }
    );
  }

  setAce(){
    this.setActive(5);
    this.count=5;
  }
  updateLeaveStatus(sav: Savel) {
    this.dataService.updateLeaveStatus(sav).subscribe(
      () => {
        console.log(`Leave status updated for ${sav.leaveType}`);
        // alert("Leave status updated");
      },
      (error) => {
        console.log(error);
      }
    );
  }

  currentDate = new Date();

  activeModel: number = 0;
  count: number = 0;
  setActive(activeNumber: number) {
    // this.count=this.count+1;
    this.activeModel = activeNumber;
    console.log(this.activeModel, this.count);
  }

  // resetForm3() {
  //   this.loginArray = {
  //     inTime: "",
  //     outTime: "",
  //     startLunch: "",
  //     endLunch: "",
  //     workingHour: "",
  //     totalHour: "",
  //     organizationId: this.loginArray.organizationId,
  //   };
  // }

  @ViewChild("requestShiftTimingsCloseModel")
  requestShiftTimingsCloseModel!: ElementRef;

  dailyQuesValid = false;
  isThirdSectionOpen = false;
 


  onSaveShiftTimings() {
    this.dataService.saveShiftTimings(this.loginArray).subscribe(
      (response) => {
        this.dailyQuesValid = true;
        console.log(response);
        this.count = 2;
        this.setActive(2);
        this.dailyQuestMessage();
        debugger
        this.requestShiftTimingsCloseModel.nativeElement.click();
        // this.isSecondSectionOpen = false;
        
        this.isThirdSectionOpen = true;

        this.onShiftTimingsCompleted();
        // alert("Shift Time saved successfully, Click on Leaves Setting");
        // this.resetForm3();
        // const result4=document.getElementById("xyz") as HTMLElement | null;
        // if(result4){
        //   result4.style.display="none";
        //  }

        //  const result5=document.getElementById("def") as HTMLElement | null;
        // if(result5){
        //   result5.style.display="block";
        //  }
      },
      (error) => {
        console.error(error);
        alert("Error saving leave");
      }
    );
  }

  onBtnClick() {
    if (this.count >= 4) {
      //localStorage.clear();
      this.router.navigate(["/dynamic/waiting"]);
      
      
    }
  }

  businessInfoCompleted: boolean = false;
  shiftTimingsCompleted: boolean = false;
  dailyQuestionCompleted: boolean = false;

  onBusinessInfoCompleted() {
    this.businessInfoCompleted = true;
  }
  onShiftTimingsCompleted() {
    this.shiftTimingsCompleted = true;
  }
  onDailyQuestionCompleted() {
    this.dailyQuestionCompleted = true;
  }

  dailyQuestionsData = {
    messageCheckOut: "",
    organId: 0,
  };

  resetFormd() {
    this.dailyQuestionsData = {
      messageCheckOut: "",
      organId: this.dailyQuestionsData.organId,
    };
  }

  @ViewChild("dailyQuestionsForm") dailyQuetsionsForm!: any;
  @ViewChild("requestDailyQuestionsCloseModel")
  requestDailyQuestionsCloseModel!: ElementRef;

  dailyQuestionsSetInvalidToggle: boolean = false;

  dailyQuestionn: DailyQuestionsCheckout[] = [];
  dailyQuesId!: number;

  onSaveDailyQuestions() {
    if (this.dailyQuetsionsForm.invalid) {
      this.dailyQuestionsSetInvalidToggle = true;
      return;
    }
    this.dataService.saveDailyQuestions(this.dailyQuestionsData).subscribe(
      (response) => {
        console.log(response);
        this.dailyQuestionn.push(response);
        this.dailyQuesId = response.id;
        // this.saveLValid=true;
        this.resetFormd();
        this.requestDailyQuestionsCloseModel.nativeElement.click();
      },
      (error) => {
        console.error(error);
        alert("Error saving daily quess Checkout");
      }
    );
  }

  getDailyQuestion() {
    this.dataService
      .getDailyQuestions(this.dailyQuestionsData.organId)
      .subscribe(
        (data) => {
          this.dailyQuestionn = data;
          console.log(this.dailyQuestionn);
          this.requestDailyQuestionsCloseModel.nativeElement.click();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onDeleteDailyQuestions(dailyQuesId: number) {
    this.dataService.deleteDailyQuestions(dailyQuesId).subscribe(
      () => {
        console.log("Question deleted");
        this.dailyQuestionn = this.dailyQuestionn.filter(
          (ques) => ques.id !== dailyQuesId
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }
  // ###############################################3

  dailyQuestionsCheckInData = {
    messageCheckIn: "",
    organnId: 0,
  };

  resetFormdCheckIn() {
    this.dailyQuestionsCheckInData = {
      messageCheckIn: "",
      organnId: this.dailyQuestionsCheckInData.organnId,
    };
  }

  @ViewChild("dailyQuestionsCheckInForm") dailyQuetsionsCheckInForm!: any;
  @ViewChild("requestDailyQuestionsCheckInCloseModel")
  requestDailyQuestionsCheckInCloseModel!: ElementRef;

  dailyQuestionsCheckInSetInvalidToggle: boolean = false;

  dailyQuestionnCheckIn: DailyQuestionsCheckIn[] = [];
  dailyQuesCheckInId!: number;

  onSaveDailyQuestionsCheckIn() {
    if (this.dailyQuetsionsCheckInForm.invalid) {
      this.dailyQuestionsCheckInSetInvalidToggle = true;
      return;
    }
    this.dataService.saveDailyQuestionsCheckIn(this.dailyQuestionsCheckInData).subscribe(
      (response) => {
        console.log(response);
        this.dailyQuestionnCheckIn.push(response);
        this.dailyQuesCheckInId = response.id;
        // this.saveLValid=true;
        this.resetFormdCheckIn();
        this.requestDailyQuestionsCheckInCloseModel.nativeElement.click();
      },
      (error) => {
        console.error(error);
        alert("Error saving daily Quess CheckIn");
      }
    );
  }

  getDailyQuestionCheckIn() {
    this.dataService
      .getDailyQuestionsCheckIn(this.dailyQuestionsCheckInData.organnId)
      .subscribe(
        (data) => {
          this.dailyQuestionnCheckIn = data;
          console.log(this.dailyQuestionnCheckIn);
          this.requestDailyQuestionsCheckInCloseModel.nativeElement.click();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onDeleteDailyQuestionsCheckIn(dailyQuesCheckInId: number) {
    this.dataService.deleteDailyQuestionsCheckIn(dailyQuesCheckInId).subscribe(
      () => {
        console.log("Question deleted");
        this.dailyQuestionnCheckIn = this.dailyQuestionnCheckIn.filter(
          (ques) => ques.id !== dailyQuesCheckInId
        );
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // ####################################3333

  dailyNotesData: any = {
    checkInStatus: false,
    checkOutStatus: false,
    organiId: 0,
  };

  @ViewChild("requestDailyQuesCloseModel")
  requestDailyQuesCloseModel!: ElementRef;

  dailyNotes: DailyNotes = new DailyNotes();

  SLeaveValid = false;
  isFourthSectionOpen=false;

  onsaveDailyNotes() {
    // this.dailyNotes = [];
       

    this.dataService.saveDailyNotes(this.dailyNotesData).subscribe(
      (response) => {
        console.log(response);
        //  this.saveLValid=true;
        this.SLeaveValid = true;
        this.dailyNotes = response;
        this.SLeaveMessage();
        this.setActive(3);
        this.count = 3;
        this.onDailyQuestionCompleted();

        this.isFourthSectionOpen = true;

        // if (response) {
        //   debugger;
        //   this.requestSaveLeavCloseModel.nativeElement.click();
        // }
        this.requestDailyQuesCloseModel.nativeElement.click();
      },
      (error) => {
        console.error(error);
        alert("Error saving leave");
      }
    );
  }

  getDailyNotes() {
    this.dataService.getDailyNotes(this.getLoginDetailsOrgRefId()).subscribe(
      (data) => {
        // this.dailyNotesData=data;
        this.dailyNotes = data;

        if (data.checkInStatus) {
          this.dailyNotesData.checkInStatus = true;
        } else {
          this.dailyNotesData.checkInStatus = false;
        }
        if (data.checkOutStatus) {
          this.dailyNotesData.checkOutStatus = true;
        } else {
          this.dailyNotesData.checkOutStatus = false;
        }
        if (data) {
          this.SLeaveValid = true;
          this.SLeaveMessage();
        }

        if (data) {
          this.onBusinessInfoCompleted();
          this.onShiftTimingsCompleted();
          this.onDailyQuestionCompleted();
        }
        debugger;
        if (data.minLength !== 0) {
          this.setActive(1);
          this.setActive(2);
          this.setActive(3);
          this.count=3;

          if (this.a == 4) {
            this.setActive(1);
            this.setActive(2);
            this.setActive(3);
            this.setActive(4);
            this.count=4
          }
          this.requestDailyQuesCloseModel.nativeElement.click();
        }
        // if(data){      
        //     this.requestDailyQuesCloseModel.nativeElement.click();
        // }

        console.log(this.dailyNotes);
        if (this.a == 4) {
          this.a = 4;
        } else {
          this.a = 3;
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // toggleCheckInStatus() {
  //   this.dailyNotesData.checkInStatus = !this.dailyNotesData.checkInStatus;
  // }

  // // Method to toggle checkOutStatus
  // toggleCheckOutStatus() {
  //   this.dailyNotesData.checkOutStatus = !this.dailyNotesData.checkOutStatus;
  // }

  dailyQuesFlag: any;

  dailyQuestMessage() {
    debugger;
    if (this.isAboveSectionValid2()) {
      this.dailyQuesFlag = false;
    } else {
      this.dailyQuesFlag = true;
    }
    if (this.dailyQuesFlag) {
      setTimeout(() => {
        this.dailyQuesFlag = false;
      }, 500); // 1000ms = 1 second
    }
  }
  isAboveSectionValid2() {
    debugger;
    if (this.dailyQuesValid) {
      return true;
    }
    return false;
  }
  isAboveSectionValid1() {
    if (this.shiftTimingsValid) {
      return true;
    }
    return false;
  }

  shiftTimesFlag: any;

  shiftTimesMessage() {
    if (this.isAboveSectionValid1()) {
      this.shiftTimesFlag = false;
    } else {
      this.shiftTimesFlag = true;
    }
    if (this.shiftTimesFlag) {
      setTimeout(() => {
        this.shiftTimesFlag = false;
      }, 500); // 1000ms = 1 second
    }
  }

  SLeaveFlag: any;

  SLeaveMessage() {
    debugger;
    if (this.isAboveSectionValid3()) {
      this.SLeaveFlag = false;
    } else {
      this.SLeaveFlag = true;
    }
    if (this.SLeaveFlag) {
      setTimeout(() => {
        this.SLeaveFlag = false;
      }, 500); // 1000ms = 1 second
    }
  }
  isAboveSectionValid3() {
    debugger;
    if (this.SLeaveValid) {
      return true;
    }
    return false;
  }

  // Written/modified by Shivendra
  getLoginDetailsOrgRefId(){
    const loginDetails = localStorage.getItem('loginData');
    if(loginDetails!==null){
      const loginData = JSON.parse(loginDetails);
      return loginData.orgRefId;
    }
  }
}
