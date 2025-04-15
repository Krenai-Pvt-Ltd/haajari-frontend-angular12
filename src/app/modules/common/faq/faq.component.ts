import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  constructor(private dataService: DataService, private router:Router,   private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.getFaq();
    this.injectTawkScript();
  }

  private scriptId = 'tawk-script';
  private tawkInterval: any;
  ngOnDestroy(): void {
    this.cleanupTawk();
  }

  private injectTawkScript() {
    if (document.getElementById(this.scriptId)) {
      return;
    }

    const script = document.createElement('script');
    script.id = this.scriptId;
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://embed.tawk.to/67fcae275de05719072dd2e2/1iopggjij';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Append to body instead of head to make sure it runs fully
    document.body.appendChild(script);

  }

  private cleanupTawk() {
    // Remove script
    const script = document.getElementById(this.scriptId);
    if (script) {
      script.remove();
    }

    // Remove all Tawk.to injected DOM elements
    const tawkSelectors = [
      '[id^="tawk"]',
      '[class^="tawk"]',
      '[id*="tawk"]',
      '[class*="tawk"]',
      'iframe[src*="tawk.to"]',
      'link[href*="tawk.to"]',
      'script[src*="tawk.to"]',
      'style[data-tawk]',
      '.tawk-min-container',
      '.tawk-button',
      '.tawk-bubble-container',
      '.tawk-live-chat'
    ];

    tawkSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  }

  route(faq: any) {
    this.router.navigate(['/faq-detail'], { state: { faq } });
  }
  

  faqList: any[] = [];

  page: number = 0;
  itemsPerPage: number = 10;

  getFaq() {
    this.dataService.getFaq(this.page, this.itemsPerPage).subscribe((res: any) => {
      if (res.status) {
        // Add a flag to control visibility of faqs for each section
        this.faqList = res.object.map((section: any) => ({
          ...section,
          expanded: false // initially collapsed
        }));
      }
    }, () => {
      console.log("Error Fetching FAQ Data");
    });
  }

  toggleSection(section: any) {
    section.expanded = !section.expanded;
  }


  selectedfaq: any = {};
  selectedTopic: string = '';
  viewDetails : boolean = false;

  faqDetails(faq: any, topic: string) {
    this.viewDetails = true;
    this.selectedfaq = faq;
    this.selectedTopic = topic;
  }


  viewFaqDetails(){
    this.viewDetails = false;
    this.selectedfaq = {};
    this.selectedTopic = '';
  }

  previewString: SafeResourceUrl | null = null;
  setPreviewString(url:string){
    console.log(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);;
  }


}
