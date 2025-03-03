import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.component.html',
  styleUrls: ['./configuration.component.css']
})
export class ConfigurationComponent implements OnInit {

  constructor() { }
  isDivVisible: boolean = false;
  ngOnInit(): void {
  }

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
  }
  
