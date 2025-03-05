import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { ProfessionalTax } from 'src/app/payroll-models/ProfeessionalTax';
import { Profile } from 'src/app/payroll-models/Profile';
import { HelperService } from 'src/app/services/helper.service';
import { PayrollConfigurationService } from 'src/app/services/payroll-configuration.service';
import { TaxSlabService } from 'src/app/services/tax-slab.service';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {



  isDivVisible: boolean = false;
  constructor(private taxSlabService: TaxSlabService,
    private _payrollConfigurationService :PayrollConfigurationService,
    private _helperService : HelperService,
    private afStorage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this.getProfile();
    this.taxSlabService.taxSlab$.subscribe(taxData => {
      if (taxData) {
        console.log("opening modal")
        this.selectedTaxSlab = taxData;
      }
    });
  }

  selectedFile: File | null = null;

  toggleDiv() {
    this.isDivVisible = !this.isDivVisible;
  }
  closeStatutoryDiv() {
    this.isDivVisible = false;
    this.tab= '';
  }
  stateList=[
    { "id": 1, "name": "Andhra Pradesh" },
    { "id": 2, "name": "Arunachal Pradesh" },
    { "id": 3, "name": "Assam" },
    { "id": 4, "name": "Bihar" },
    { "id": 5, "name": "Chhattisgarh" },
    { "id": 6, "name": "Goa" },
    { "id": 7, "name": "Gujarat" },
    { "id": 8, "name": "Haryana" },
    { "id": 9, "name": "Himachal Pradesh" },
    { "id": 10, "name": "Jharkhand" },
    { "id": 11, "name": "Karnataka" },
    { "id": 12, "name": "Kerala" },
    { "id": 13, "name": "Madhya Pradesh" },
    { "id": 14, "name": "Maharashtra" },
    { "id": 15, "name": "Manipur" },
    { "id": 16, "name": "Meghalaya" },
    { "id": 17, "name": "Mizoram" },
    { "id": 18, "name": "Nagaland" },
    { "id": 19, "name": "Odisha" },
    { "id": 20, "name": "Punjab" },
    { "id": 21, "name": "Rajasthan" },
    { "id": 22, "name": "Sikkim" },
    { "id": 23, "name": "Tamil Nadu" },
    { "id": 24, "name": "Telangana" },
    { "id": 25, "name": "Tripura" },
    { "id": 26, "name": "Uttar Pradesh" },
    { "id": 27, "name": "Uttarakhand" },
    { "id": 28, "name": "West Bengal" }
  ]
  
  selectedLocation: string = 'india';

    selectedCurrency: string = 'INR'; // INR selected by default
  
    stateCurrency = [
      { "code": "USD", "name": "USD", "symbol": "$" },
      { "code": "EUR", "name": "Euro", "symbol": "€" },
      { "code": "INR", "name": "INR", "symbol": "₹" }, // Default selection
      { "code": "GBP", "name": "British Pound Sterling", "symbol": "£" },
      { "code": "AUD", "name": "Australian Dollar", "symbol": "A$" },
      { "code": "CAD", "name": "Canadian Dollar", "symbol": "C$" },
      { "code": "SGD", "name": "Singapore Dollar", "symbol": "S$" },
      { "code": "JPY", "name": "Japanese Yen", "symbol": "¥" },
      { "code": "CNY", "name": "Chinese Yuan", "symbol": "¥" },
      { "code": "CHF", "name": "Swiss Franc", "symbol": "CHF" },
      { "code": "HKD", "name": "Hong Kong Dollar", "symbol": "HK$" },
      { "code": "NZD", "name": "New Zealand Dollar", "symbol": "NZ$" },
      { "code": "SEK", "name": "Swedish Krona", "symbol": "kr" },
      { "code": "KRW", "name": "South Korean Won", "symbol": "₩" },
      { "code": "BRL", "name": "Brazilian Real", "symbol": "R$" },
      { "code": "ZAR", "name": "South African Rand", "symbol": "R" },
      { "code": "RUB", "name": "Russian Ruble", "symbol": "₽" },
      { "code": "MXN", "name": "Mexican Peso", "symbol": "$" },
      { "code": "IDR", "name": "Indonesian Rupiah", "symbol": "Rp" },
      { "code": "TRY", "name": "Turkish Lira", "symbol": "₺" },
      { "code": "SAR", "name": "Saudi Riyal", "symbol": "﷼" },
      { "code": "AED", "name": "United Arab Emirates Dirham", "symbol": "د.إ" }
    ];


    isLopChecked:boolean = true;
    toggleLOPVisibility(): void {
      console.log("toggled",this.isLopChecked)
    }

    calculateValue(type: string, value: number): string {
      if (this.isLopChecked) {
        if (type === 'basic') {
          return ` ${(value * 0.85).toFixed(2)}`; 
        }
        if (type === 'transport') {
          return ` ${(value * 0.90).toFixed(2)}`; 
        }
      }
      return ` ${value.toFixed(2)}`;
    }

    selectedPfWage = "12% of Actual PF Wage"; // Default selected value

employer = [
  { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
  { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
];
employee = [
  { label: "12% of Actual PF Wage", value: "12% of Actual PF Wage" },
  { label: "10% of Actual PF Wage", value: "10% of Actual PF Wage" }
];

tab: string = '';
switchTab(tab: string) {
  this.tab = tab
}


selectedTaxSlab!: ProfessionalTax; 

// ################# Profile #######################


dateFormats = [
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' }
];

onDateFormatChange(format: string) {
  this.profile.dateFormat = format;
  console.log('Selected Date Format:', this.profile.dateFormat);
}

profile:Profile = new Profile();
  getProfile(){
      this._payrollConfigurationService.getOrganizationProfile().subscribe(
        (response) => {
          if(response.status){
            this.profile= response.object;
            if(this.profile==null){
              this.profile = new Profile();
            }
          }
        },
        (error) => {
  
        }
      );
    }


    saveLoader:boolean=false;
          saveOrganizationProfile(){
            this.saveLoader = true;
            this._payrollConfigurationService.saveOrganizationProfile(this.profile).subscribe(
              (response) => {
                if(response.status){
                  this._helperService.showToast(response.message, Key.TOAST_STATUS_SUCCESS);
                }else{
                  this._helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
                }
                this.saveLoader = false;
              },
              (error) => {
                this.saveLoader = false;
              }
            );
          }



          isFileSelected = false;
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imagePreview: HTMLImageElement = document.getElementById(
          'imagePreview'
        ) as HTMLImageElement;
        imagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);

      this.uploadFile(file);
    } else {
      this.isFileSelected = false;
    }
  }

  uploadFile(file: File): void {
      debugger;
      const filePath = `uploads/${new Date().getTime()}_${file.name}`;
      const fileRef = this.afStorage.ref(filePath);
      const task = this.afStorage.upload(filePath, file);
  
      task
        .snapshotChanges()
        .pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              // console.log('File URL:', url);
              this.profile.logo = url;
            });
          })
        )
        .subscribe();
    }
    

  }



  

