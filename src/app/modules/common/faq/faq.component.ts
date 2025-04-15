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
    // this.injectTawkScript();
  }
  private scriptId = 'tawk-script';
  private tawkInterval: any;
  ngOnDestroy(): void {
    console.log("destriy called");
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

  cleanupTawk() {
    // 1. Remove script by ID
    const tawkScript = document.getElementById('tawk-script');
    if (tawkScript && tawkScript.parentNode) {
      tawkScript.parentNode.removeChild(tawkScript);
      console.log('✅ Removed Tawk script');
    }
  this.startTawkCleanupWatcher()
     // 2. Remove Tawk-related iframes and DOM nodes
  const selectors = [
    'iframe[src*="tawk.to"]',
    '.tawk-min-container',
    '.tawk-button',
    '[class*="tawk"]',
    '[id*="tawk"]',
  ];
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.remove();
      console.log(`✅ Removed element matching: ${sel}`);
    });
  });

  // 3. Delete global vars
  delete (window as any).Tawk_API;
  delete (window as any).Tawk_LoadStart;
  
  
    console.log('✅ Tawk cleanup complete');
  }
  
  removeTawkElements() {
    const selectors = [
      'script[src*="tawk.to"]',
      'iframe[src*="tawk.to"]',
      'link[href*="tawk.to"]',
      '[id*="tawk"]',
      '[class*="tawk"]',
      'style[data-tawk]',
      '.tawk-min-container',
      '.tawk-button',
      '.tawk-bubble-container',
      '.tawk-live-chat'
    ];
  
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        console.log('Removing element:', el);
        el.remove();
      });
    });
  }

  startTawkCleanupWatcher() {
    // Remove existing Tawk-related elements immediately
    this.removeTawkElements();
  
    // Start a MutationObserver to watch for new additions
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach((node: any) => {
          if (node.tagName === 'SCRIPT' && node.src && node.src.includes('tawk.to')) {
            console.log('Removing Tawk script:', node.src);
            node.remove();
          }
  
          if (node.tagName === 'IFRAME' && node.src && node.src.includes('tawk.to')) {
            console.log('Removing Tawk iframe:', node.src);
            node.remove();
          }
  
          if (node.tagName === 'LINK' && node.href && node.href.includes('tawk.to')) {
            console.log('Removing Tawk link:', node.href);
            node.remove();
          }
  
          if (node.tagName === 'DIV' && node.id && node.id.includes('tawk')) {
            console.log('Removing Tawk div:', node.id);
            node.remove();
          }
        });
      });
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  
    // Optionally store the observer so you can disconnect it later
    // this.tawkObserver = observer;
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
