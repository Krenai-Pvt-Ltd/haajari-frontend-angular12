import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

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
}
