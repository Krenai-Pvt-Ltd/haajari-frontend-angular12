import {
  Component,
  ComponentFactoryResolver,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  NgForm,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { url } from 'inspector';
import { UserPersonalInformationRequest } from 'src/app/models/user-personal-information-request';
import { DataService } from 'src/app/services/data.service';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
} from 'rxjs/operators';
import { debug } from 'console';
import { DomSanitizer } from '@angular/platform-browser';
import { HelperService } from 'src/app/services/helper.service';
import { Key } from 'src/app/constant/key';
import { PreviewFormComponent } from '../preview-form/preview-form.component';

@Component({
  selector: 'app-employee-onboarding-form',
  templateUrl: './employee-onboarding-form.component.html',
  styleUrls: ['./employee-onboarding-form.component.css'],
})
export class EmployeeOnboardingFormComponent implements OnInit {
  userPersonalInformationRequest: UserPersonalInformationRequest =
    new UserPersonalInformationRequest();
  maxDob: string;
  // minJoiningDate: string;
  constructor(
    public dataService: DataService,
    private router: Router,
    private afStorage: AngularFireStorage,
    private helperService: HelperService,
    private modalService: NgbModal,
    private activatedRoute: ActivatedRoute
  ) {
         // Get the full URL with query parameters
         const currentPath = this.router.url; // Path without query parameters
           localStorage.setItem('returnUrl', currentPath);

    // DOB Date logic
    const today = new Date();
    const minAge = 18;
    const maxDobDate = new Date(
      today.getFullYear() - minAge,
      today.getMonth(),
      today.getDate()
    );
    this.maxDob = maxDobDate.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'

    // Joining Date Logic

    // this.minJoiningDate = today.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
  }

  @ViewChild('imageModel') imageModel!: ElementRef;
  @ViewChild('closeModel') closeModel!: ElementRef;
  @ViewChild('imageGallerButton') imageGallerButton!: ElementRef;
  @ViewChildren('checkboxes') checkboxes!: QueryList<ElementRef>;
  async ngOnInit() {
    await this.dataService.loadOnboardingRoute(new URLSearchParams(window.location.search).get('userUuid'));
    this.isPagePresent();
    this.userPersonalInformationRequest.dateOfBirth = this.getInitialDate();
    // console.log();
    this.getNewUserPersonalInformationMethodCall();

  }
  isPagePresent() {
    debugger;
    let navExtra: NavigationExtras = {
      queryParams: {
        userUuid: new URLSearchParams(window.location.search).get('userUuid'),
      },
    };
    console.log(" personal info ",this.dataService.isRoutePresent('/employee-onboarding-form'))
    console.log(" address info ",this.dataService.isRoutePresent('/employee-address-detail'))
    if(this.dataService.isRoutePresent('/employee-onboarding-form')){

      return;
    }
    else if(this.dataService.isRoutePresent('/employee-address-detail')){
      this.router.navigate(
        ['/employee-onboarding/employee-address-detail'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/employee-document')){
      this.router.navigate(
        ['/employee-onboarding/employee-document'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/acadmic')){
      this.router.navigate(
        ['/employee-onboarding/acadmic'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/employee-experience')){
      this.router.navigate(
        ['/employee-onboarding/employee-experience'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/bank-details')){
      this.router.navigate(
        ['/employee-onboarding/bank-details'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/emergency-contact')){
      this.router.navigate(
        ['/employee-onboarding/emergency-contact'],
        navExtra
      );
    }
  }


  routeToUserDetails() {
    let navExtra: NavigationExtras = {
      queryParams: {
        userUuid: new URLSearchParams(window.location.search).get('userUuid'),
      },
    };
    if(this.dataService.isRoutePresent('/employee-address-detail')){
      this.router.navigate(
        ['/employee-onboarding/employee-address-detail'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/employee-document')){
      this.router.navigate(
        ['/employee-onboarding/employee-document'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/acadmic')){
      this.router.navigate(
        ['/employee-onboarding/acadmic'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/employee-experience')){
      this.router.navigate(
        ['/employee-onboarding/employee-experience'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/bank-details')){
      this.router.navigate(
        ['/employee-onboarding/bank-details'],
        navExtra
      );
    }else if(this.dataService.isRoutePresent('/emergency-contact')){
      this.router.navigate(
        ['/employee-onboarding/emergency-contact'],
        navExtra
      );
    }
  }
  routeToLastSavedStep(lastSavedStep: number) {
    // Extract userUuid from URL
    const userUuid = new URLSearchParams(window.location.search).get(
      'userUuid'
    );
    let navExtra: NavigationExtras = {
      queryParams: { userUuid: userUuid },
    };

    // Determine the route based on lastSavedStep
    let route;
    if (lastSavedStep === 18) {
      route = '/employee-onboarding/employee-address-detail';
    } else if (lastSavedStep === 19) {
      route = '/employee-onboarding/employee-document';
    } else if (lastSavedStep === 20) {
      route = '/employee-onboarding/acadmic';
    } else if (lastSavedStep === 21) {
      route = '/employee-onboarding/employee-experience';
    } else if (lastSavedStep === 22) {
      route = '/employee-onboarding/bank-details';
    } else if (lastSavedStep === 23) {
      route = '/employee-onboarding/emergency-contact';
    } else {
      console.error('Invalid lastSavedStep provided:', lastSavedStep);
      // Optionally, handle invalid step (e.g., redirect to a default page or show an error message)
      return;
    }

    // Navigate to the determined route
    this.router.navigate([route], navExtra);
  }

  isFileSelected = false;
  imagePreviewUrl: any = null;
  onFileSelected(event: Event): void {
    debugger;
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];

      // Check if the file type is valid
      if (this.isValidFileType(file)) {
        this.selectedFile = file;
        this.isUploading = true;

        const reader = new FileReader();
        reader.onload = (e: any) => {
          // Set the loaded image as the preview
          this.imagePreviewUrl = e.target.result;
        };
        reader.readAsDataURL(file);

        this.uploadFile(file);
      } else {
        element.value = '';
        this.userPersonalInformationRequest.image = '';
        // Handle invalid file type here (e.g., show an error message)
        console.error(
          'Invalid file type. Please select a jpg, jpeg, or png file.'
        );
      }
    } else {
      this.isFileSelected = false;
    }
  }

  // Helper function to check if the file type is valid
  isInvalidFileType = false;
  isValidFileType(file: File): boolean {
    const validExtensions = ['jpg', 'jpeg', 'png'];
    const fileType = file.type.split('/').pop(); // Get the file extension from the MIME type

    if (fileType && validExtensions.includes(fileType.toLowerCase())) {
      this.isInvalidFileType = false;
      return true;
    }
    // console.log(this.isInvalidFileType);
    this.isInvalidFileType = true;
    return false;
  }

  getImageUrl(e: any) {
    // console.log(e);
    if (e != null && e.length > 0) {
    }
  }

  uploadFile(file: File): void {
    debugger;
    const filePath = `uploads/${new Date().getTime()}_${file.name}`;
    const fileRef = this.afStorage.ref(filePath);
    const task = this.afStorage.upload(filePath, file);

    task
      .snapshotChanges()
      .toPromise()
      .then(() => {
        // console.log('Upload completed');
        fileRef
          .getDownloadURL()
          .toPromise()
          .then((url) => {
            // console.log('File URL:', url);
            this.isUploading = false;
            this.userPersonalInformationRequest.image = url;
          })
          .catch((error) => {
            console.error('Failed to get download URL', error);
          });
      })
      .catch((error) => {
        console.error('Error in upload snapshotChanges:', error);
      });
  }

  userPersonalDetailsStatus = '';
  selectedFile: File | null = null;
  toggle = false;
  toggleSave = false;
  isUploading: boolean = false;
  invite:boolean = true;
  setEmployeePersonalDetailsMethodCall() {
    debugger;

    if (this.buttonType == 'next') {
      this.toggle = true;
      this.userPersonalInformationRequest.directSave = false;
      this.userPersonalInformationRequest.updateRequest = false;
    } else if (this.buttonType == 'save') {
      this.toggleSave = true;
      this.userPersonalInformationRequest.directSave = true;
      this.userPersonalInformationRequest.updateRequest = false;
    } else if (this.buttonType == 'update') {
      this.toggle = true;
      this.userPersonalInformationRequest.updateRequest = true;
    }
    if (this.userPersonalInformationRequest.department === 'Other') {
      // Use the value from otherDepartment field
      let department = this.userPersonalInformationRequest.department;
      // ... submit the form with the custom department
    }
    const userUuid =
      new URLSearchParams(window.location.search).get('userUuid') || '';

    this.dataService
      .setEmployeeOnboardingPersonalDetails(
        this.userPersonalInformationRequest,
        userUuid
      )
      .subscribe(
        (response: UserPersonalInformationRequest) => {
          if(this.buttonType === 'preview'){
            const modalRef = this.modalService.open(PreviewFormComponent, {
              centered: true,
              size: 'lg', backdrop: 'static'
            });
            }
          // console.log(response);
          this.employeeOnboardingFormStatus =
            response.employeeOnboardingFormStatus.toString();
          this.handleOnboardingStatus(this.employeeOnboardingFormStatus);
          this.toggle = false;
          if (!userUuid) {
            // localStorage.setItem('uuidNewUser', response.uuid);
            this.dataService.setEmployeePersonalDetails(
              this.userPersonalInformationRequest,
              userUuid,
              [],
              0,
              [],
              this.invite
            );
            // this.userPersonalDetailsStatus = response.statusResponse;
            // localStorage.setItem('statusResponse', JSON.stringify(this.userPersonalDetailsStatus));
            this.dataService.markStepAsCompleted(response.statusId);
          }

          // this.router.navigate(['/employee-address-detail']);
          if (this.buttonType == 'next') {
            this.routeToUserDetails();
          } else if (this.buttonType == 'save') {
            if (this.employeeOnboardingFormStatus != 'REJECTED') {
              this.successMessageModalButton.nativeElement.click();
            }

            setTimeout(() => {
              this.routeToFormPreview();
            }, 2000);
          } else if (this.buttonType == 'update') {
            this.helperService.showToast(
              'Information Updated Successfully',
              Key.TOAST_STATUS_SUCCESS
            );
          }
        },
        (error) => {
          console.error(error);
          this.toggle = false;
        }
      );
  }

  dbImageUrl: string | null = null;

  setImageUrlFromDatabase(url: string) {
    this.dbImageUrl = url;
  }

  lastSavedStep: number = 0;
  isNewUser: boolean = true;
  isLoading: boolean = true;
  employeeOnboardingFormStatus: string | null = null;
  @ViewChild('successMessageModalButton')
  successMessageModalButton!: ElementRef;
  getNewUserPersonalInformationMethodCall(): Promise<boolean> {
    debugger;
    return new Promise<boolean>(async (resolve, reject) => {
      // Notice the `async` here
      const userUuid = new URLSearchParams(window.location.search).get(
        'userUuid'
      );
      const adminUuid = new URLSearchParams(window.location.search).get(
        'adminUuid'
      );
      if (userUuid) {
        this.dataService.getNewUserPersonalInformation(userUuid).subscribe(
          async (response: UserPersonalInformationRequest) => {
            this.userPersonalInformationRequest = response;

            this.isLoading = false;
            this.employeeOnboardingFormStatus =
              response.employeeOnboardingStatus.response;
            if(response.employeeOnboardingFormStatus.id && this.helperService.isFirstTime ){
              this.lastSavedStep = response.employeeOnboardingFormStatus.id;
              this.routeToLastSavedStep(this.lastSavedStep);
            }
            if (adminUuid) {
              await this.getAdminVerifiedForOnboardingUpdateMethodCall();
            }
            if (
              response.employeeOnboardingFormStatus.response ==
                'USER_REGISTRATION_SUCCESSFUL' &&
              this.employeeOnboardingFormStatus != 'REJECTED' &&
              this.employeeOnboardingFormStatus != 'REQUESTED' &&
              (!this.userPersonalInformationRequest.updateRequest ||
                this.userPersonalInformationRequest.updateRequest == null ||
                !this.userPersonalInformationRequest.updateRequest)
            ) {
              this.successMessageModalButton.nativeElement.click();
            }

            if (response.employeeOnboardingStatus.response == 'PENDING') {
              this.isNewUser = false;
            }

            this.handleOnboardingStatus(
              response.employeeOnboardingStatus.response
            );
            // console.log(response);
            if (response.dateOfBirth) {
              this.dataService.markStepAsCompleted(response.statusId);
            }

            if (response.image) {
              this.setImageUrlFromDatabase(response.image);
            }
            if (
              response.employeeOnboardingFormStatus.response ==
                'USER_REGISTRATION_SUCCESSFUL' &&
              (this.employeeOnboardingFormStatus == 'PENDING' ||
                this.employeeOnboardingFormStatus == 'APPROVED') &&
              !this.userPersonalInformationRequest.updateRequest
            ) {
              setTimeout(() => {
                this.routeToFormPreview();
              }, 500);
            }
          },
          (error: any) => {
            console.error('Error fetching user details:', error);
          }
        );
      } else {
        console.error('uuidNewUser not found in localStorage');
      }
    });
  }

  displayModal = false;
  allowEdit = false;

  handleOnboardingStatus(response: string) {
    this.displayModal = true;
    switch (response) {
      case 'REJECTED':
        this.allowEdit = true;
        break;
      case 'APPROVED':
      case 'PENDING':
        this.allowEdit = false;
        break;
      default:
        this.displayModal = false;
        break;
    }
  }

  closeAndEdit() {
    this.displayModal = false;
  }

  closeModal() {
    this.displayModal = false;
  }

  departments: string[] = [
    'Accounting',
    'Administration',
    'Business Development',
    'Communications',
    'Compliance',
    'Customer Service',
    'Design',
    'Distribution',
    'Engineering',
    'Environmental, Health, and Safety (EHS)',
    'Finance',
    'Human Resources',
    'Information Technology (IT)',
    'Legal',
    'Logistics',
    'Maintenance',
    'Manufacturing',
    'Marketing',
    'Operations',
    'Procurement',
    'Product Development',
    'Project Management',
    'Public Relations',
    'Quality Assurance',
    'Research and Development (R&D)',
    'Sales',
    'Supply Chain Management',
    'Sustainability',
    'Training and Development',
    'Treasury',
  ];

  departmentInputValue?: string;
  positionInputValue?: string;
  nationalityInputValue?: string;
  departmentFilteredOptions: string[] = [];
  positionFilteredOptions: string[] = [];
  nationalityFilteredOptions: string[] = [];

  onChange(value: string, type: string): void {
    if (type === 'department') {
      this.departmentFilteredOptions = this.departments.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    } else if (type === 'position') {
      this.positionFilteredOptions = this.jobTitles.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    } else if (type === 'nationality') {
      this.nationalityFilteredOptions = this.nationalities.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      );
    }
  }

  // Function to select department
  // selectDepartment(dept: string): void {
  //   this.userPersonalInformationRequest.department = dept;
  //   // this.filteredDepartments = [];

  // }

  selectNationality(name: string): void {
    this.userPersonalInformationRequest.nationality = name;
  }

  nationalities = [
    'Afghan',
    'Albanian',
    'Algerian',
    'Andorran',
    'Angolan',
    'Antiguan and Barbudan',
    'Argentine',
    'Armenian',
    'Australian',
    'Austrian',
    'Azerbaijani',
    'Bahamian',
    'Bahraini',
    'Bangladeshi',
    'Barbadian',
    'Belarusian',
    'Belgian',
    'Belizean',
    'Beninese',
    'Bhutanese',
    'Bolivian',
    'Bosnian and Herzegovinian',
    'Botswanan',
    'Brazilian',
    'Bruneian',
    'Bulgarian',
    'Burkinabé',
    'Burundian',
    'Cape Verdean',
    'Cambodian',
    'Cameroonian',
    'Canadian',
    'Central African',
    'Chadian',
    'Chilean',
    'Chinese',
    'Colombian',
    'Comorian',
    'Congolese',
    'Congolese',
    'Costa Rican',
    'Ivorian',
    'Croatian',
    'Cuban',
    'Cypriot',
    'Czech',
    'Danish',
    'Djiboutian',
    'Dominican',
    'Dominican',
    'Timorese',
    'Ecuadorian',
    'Egyptian',
    'Salvadoran',
    'Equatorial Guinean',
    'Eritrean',
    'Estonian',
    'Swazi',
    'Ethiopian',
    'Fijian',
    'Finnish',
    'French',
    'Gabonese',
    'Gambian',
    'Georgian',
    'German',
    'Ghanaian',
    'Greek',
    'Grenadian',
    'Guatemalan',
    'Guinean',
    'Bissau-Guinean',
    'Guyanese',
    'Haitian',
    'Honduran',
    'Hungarian',
    'Icelandic',
    'Indian',
    'Indonesian',
    'Iranian',
    'Iraqi',
    'Irish',
    'Israeli',
    'Italian',
    'Jamaican',
    'Japanese',
    'Jordanian',
    'Kazakhstani',
    'Kenyan',
    'I-Kiribati',
    'North Korean',
    'South Korean',
    'Kosovar',
    'Kuwaiti',
    'Kyrgyzstani',
    'Laotian',
    'Latvian',
    'Lebanese',
    'Basotho',
    'Liberian',
    'Libyan',
    'Liechtensteiner',
    'Lithuanian',
    'Luxembourger',
    'Malagasy',
    'Malawian',
    'Malaysian',
    'Maldivian',
    'Malian',
    'Maltese',
    'Marshallese',
    'Mauritanian',
    'Mauritian',
    'Mexican',
    'Micronesian',
    'Moldovan',
    'Monégasque',
    'Mongolian',
    'Montenegrin',
    'Moroccan',
    'Mozambican',
    'Myanmarese',
    'Namibian',
    'Nauruan',
    'Nepalese',
    'Dutch',
    'New Zealander',
    'Nicaraguan',
    'Nigerien',
    'Nigerian',
    'North Macedonian',
    'Norwegian',
    'Omani',
    'Pakistani',
    'Palauan',
    'Palestinian',
    'Panamanian',
    'Papua New Guinean',
    'Paraguayan',
    'Peruvian',
    'Filipino',
    'Polish',
    'Portuguese',
    'Qatari',
    'Romanian',
    'Russian',
    'Rwandan',
    'Kittitian and Nevisian',
    'Saint Lucian',
    'Saint Vincentian',
    'Samoan',
    'Sammarinese',
    'São Toméan',
    'Saudi',
    'Senegalese',
    'Serbian',
    'Seychellois',
    'Sierra Leonean',
    'Singaporean',
    'Slovak',
    'Slovenian',
    'Solomon Islander',
    'Somali',
    'South African',
    'South Sudanese',
    'Spanish',
    'Sri Lankan',
    'Sudanese',
    'Surinamese',
    'Swedish',
    'Swiss',
    'Syrian',
    'Taiwanese',
    'Tajik',
    'Tanzanian',
    'Thai',
    'Togolese',
    'Tongan',
    'Trinidadian or Tobagonian',
    'Tunisian',
    'Turkish',
    'Turkmen',
    'Tuvaluan',
    'Ugandan',
    'Ukrainian',
    'Emirati',
    'British',
    'American',
    'Uruguayan',
    'Uzbekistani',
    'Ni-Vanuatu',
    'Vatican',
    'Venezuelan',
    'Vietnamese',
    'Yemeni',
    'Zambian',
    'Zimbabwean',
  ];

  jobTitles: string[] = [
    'Accountant',
    'Accounting Manager',
    'Administrative Assistant',
    'AI Developer (Artificial Intelligence)',
    'Angular Developer',
    'AR/VR Developer (Augmented Reality / Virtual Reality)',
    'Assembly Line Worker',
    'Automation Test Engineer',
    'Back-End Developer',
    'Bioinformatics Developer',
    'Blockchain Developer',
    'Brand Manager',
    'Business Analyst',
    'Business Development Executive',
    'Business Development Manager',
    'Buyer',
    'Call Center Agent',
    'Cash Manager',
    'Chief Financial Officer (CFO)',
    'Civil Engineer',
    'Cloud Developer (AWS Developer, Azure Developer, etc.)',
    'Communications Director',
    'Communications Specialist',
    'Compliance Analyst',
    'Compliance Officer',
    'Content Writer',
    'Corporate Lawyer',
    'Corporate Social Responsibility Manager',
    'Corporate Trainer',
    'Creative Director',
    'Customer Service Manager',
    'Customer Service Representative',
    'Database Administrator',
    'Database Developer',
    'Data Warehouse Developer',
    'Desktop Application Developer',
    'DevOps Developer',
    'Digital Marketing Specialist',
    'Distribution Manager',
    'Electrical Engineer',
    'Embedded Systems Developer',
    'EHS Manager',
    'Engineering Manager',
    'Environmental Analyst',
    'Environmental Engineer',
    'Event Coordinator',
    'Executive Assistant',
    'Facilities Manager',
    'Finance Manager',
    'Financial Analyst',
    'Front-End Developer',
    'Full Stack Developer',
    'Game Developer',
    'General Counsel',
    'Go Developer',
    'Graphic Designer',
    'Green Program Manager',
    'Health and Safety Officer',
    'Help Desk Technician',
    'Helpdesk Technician',
    'HR Generalist',
    'HR Manager',
    'HTML/CSS Developer',
    'Human Resources',
    'Information Technology (IT)',
    'Investment Analyst',
    'Inventory Manager',
    'Inventory Specialist',
    'IT Manager',
    'Java Developer',
    'JavaScript Developer',
    'Junior Software Developer',
    'Lead Developer / Technical Lead',
    'Learning and Development Specialist',
    'Legal Assistant',
    'Logistics Coordinator',
    'Logistics Manager',
    'Machine Learning Developer',
    'Maintenance Manager',
    'Maintenance Technician',
    'Manufacturing Engineer',
    'Market Research Analyst',
    'Marketing Manager',
    'Mechanical Engineer',
    'Media Relations Coordinator',
    'Mobile App Developer (Android Developer, iOS Developer)',
    'Network Engineer',
    'Node.js Developer',
    'Office Manager',
    'Operations Analyst',
    'Operations Manager',
    'Paralegal',
    'Payroll Clerk',
    'Payroll Specialist',
    'PHP Developer',
    'Plant Manager',
    'Plumber',
    'Product Designer',
    'Product Developer',
    'Product Manager',
    'Production Manager',
    'Production Planner',
    'Program Manager',
    'Project Coordinator',
    'Project Manager',
    'Public Relations Officer',
    'Procurement Manager',
    'Process Improvement Specialist',
    'Product Development',
    'Product Owner (in a software development context)',
    'Project Management',
    'Public Relations',
    'Purchasing Agent',
    'Python Developer',
    'QA Developer',
    'Quality Assurance Manager',
    'Quality Control Inspector',
    'Quality Control Technician',
    'Quality Inspector',
    'React Developer',
    'Receptionist',
    'Recruiter',
    'Regulatory Affairs Manager',
    'Research and Development (R&D)',
    'Research and Development Engineer',
    'Research Scientist',
    'Risk Analyst',
    'Risk Manager',
    'Robotics Developer',
    'Ruby Developer',
    'R&D Engineer',
    'R&D Manager',
    'Sales Manager',
    'Sales Representative',
    'Scrum Master',
    'Scala Developer',
    'Security Developer',
    'Senior Software Developer',
    'SEO Specialist',
    'Software Architect',
    'Software Development Manager',
    'Software Engineer',
    'Software Test Developer',
    'Software Tester',
    'Software Development',
    'Software Test Developer',
    'Software Tester',
    'Sourcing Manager',
    'Supply Chain Analyst',
    'Supply Chain Manager',
    'Sustainability Coordinator',
    'Sustainability Manager',
    'Systems Administrator',
    'Systems Software Developer',
    'Tax Specialist',
    'Training and Development Officer',
    'Training Manager',
    'Transportation Coordinator',
    'Treasury Analyst',
    'Treasurer',
    'UI (User Interface) Developer',
    'UX (User Experience) Developer',
    'Vue.js Developer',
    'Web Designer',
    'Web Developer',
    'Workplace Safety Officer',
  ];

  selectCurrentPosition(title: string): void {
    debugger;
    this.userPersonalInformationRequest.position = title;
  }

  @ViewChild('formSubmitButton') formSubmitButton!: ElementRef;
  buttonType: string = 'next';
  selectButtonType(type: string) {
    try {



    this.userPersonalInformationRequest.directSave = false;
    this.formSubmitButton.nativeElement.click();
    this.buttonType = type;

  } catch (error) {
      console.log(error)
  }
  }

  directSave: boolean = false;

  submit() {
    this.checkFormValidation();

    if (this.isFormInvalid == true) {
      return;
    } else {
      switch (this.buttonType) {
        case 'next': {
          this.setEmployeePersonalDetailsMethodCall();
          break;
        }
        case 'save': {
          debugger;
          this.userPersonalInformationRequest.directSave = true;
          this.setEmployeePersonalDetailsMethodCall();
          break;
        }
        case 'update': {
          this.setEmployeePersonalDetailsMethodCall();
          break;
        }
        case 'preview': {
          this.setEmployeePersonalDetailsMethodCall();
          break;
        }
      }
    }
  }
  @ViewChild('dismissSuccessModalButton')
  dismissSuccessModalButton!: ElementRef;
  routeToFormPreview() {
    this.dismissSuccessModalButton.nativeElement.click();
    setTimeout((x) => {
      let navExtra: NavigationExtras = {
        queryParams: {
          userUuid: new URLSearchParams(window.location.search).get('userUuid'),
        },
      };
      this.router.navigate(
        ['/employee-onboarding/employee-onboarding-preview'],
        navExtra
      );
    }, 2000);
  }

  // In your component

  calculate18YearsAgo(): Date {
    // const currentYear = new Date().getFullYear();
    // const date18YearsAgo = new Date();
    // date18YearsAgo.setFullYear(currentYear - 18);
    // return date18YearsAgo;
    const currentDate = new Date();
    return new Date(
      currentDate.getFullYear() - 18,
      currentDate.getMonth(),
      currentDate.getDate()
    );
  }

  disabledDate = (current: Date): boolean => {
    // Disable dates that are less than 18 years ago
    return current && current > this.calculate18YearsAgo();
  };

  getInitialDate(): Date {
    debugger;
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    // Check if the calculated date is disabled. If it is, adjust accordingly.
    if (this.disabledDate(eighteenYearsAgo)) {
      return today;
    }

    return eighteenYearsAgo;
  }

  // routeToPreviewFormIfStatusPending() {
  //   let navExtra: NavigationExtras = {
  //       queryParams: { userUuid: new URLSearchParams(window.location.search).get('userUuid') }
  //   };

  //   this.router.navigate(['/employee-onboarding/employee-onboarding-preview'], navExtra);
  // }

  trimStartingWhitespace(value: string, fieldName: string): void {
    debugger;
    if (value.startsWith(' ')) {
      // Correctly use bracket notation to access the property dynamically
      if (fieldName == 'fatherName') {
        // this.userPersonalInformationRequest.fatherName = value.trimStart();
        this.userPersonalInformationRequest.fatherName = value.replace(
          /^\s+/,
          ''
        );
      } else if (fieldName == 'position') {
        this.userPersonalInformationRequest.position = value.trimStart();
      } else if (fieldName == 'department') {
        this.userPersonalInformationRequest.department = value.trimStart();
      } else if (fieldName == 'nationality') {
        this.userPersonalInformationRequest.nationality = value.trimStart();
      }

      // Alternatively, if you want to prevent ONLY the leading whitespace (keep ending spaces):
      // this.userPersonalInformationRequest[fieldName] = value.replace(/^\s+/, '');
    }
  }

  preventLeadingWhitespace(event: KeyboardEvent): void {
    const inputElement = event.target as HTMLInputElement;

    // Prevent space if it's the first character
    if (event.key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
    }
    if (!isNaN(Number(event.key)) && event.key !== ' ') {
      event.preventDefault();
    }
  }

  isFormInvalid: boolean = false;

  @ViewChild('personalInformationForm') personalInformationForm!: NgForm;
  checkFormValidation() {
    if (this.personalInformationForm.invalid) {
      this.isFormInvalid = true;
      return;
    } else {
      this.isFormInvalid = false;
    }
  }

  getAdminVerifiedForOnboardingUpdateMethodCall(): Promise<boolean> {
    debugger;
    return new Promise<boolean>((resolve, reject) => {
      const userUuid = new URLSearchParams(window.location.search).get(
        'userUuid'
      );
      const adminUuid = new URLSearchParams(window.location.search).get(
        'adminUuid'
      );
      if (userUuid && adminUuid) {
        this.dataService
          .getAdminVerifiedForOnboardingUpdate(userUuid, adminUuid)
          .subscribe(
            (isAdminPresent: boolean) => {
              this.userPersonalInformationRequest.updateRequest =
                isAdminPresent;
              // console.log('Admin verification successful.');
              resolve(isAdminPresent); // Resolve the promise with the result
            },
            (error: any) => {
              console.error('Error fetching admin verification status:', error);
              reject(error); // Reject the promise on error
            }
          );
      } else {
        console.error('User UUID or Admin UUID not found in the URL.');
        reject(new Error('User UUID or Admin UUID not found in the URL.')); // Reject the promise if parameters are missing
      }
    });
  }

  goBackToProfile() {
    let navExtra: NavigationExtras = {
      queryParams: {
        userId: new URLSearchParams(window.location.search).get('userUuid'),
      },
    };
    // this.router.navigate([Key.EMPLOYEE_PROFILE_ROUTE], navExtra);
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
    return;
  }
}
function finalize(
  arg0: () => void
): import('rxjs').OperatorFunction<
  import('firebase/compat').default.storage.UploadTaskSnapshot | undefined,
  unknown
> {
  throw new Error('Function not implemented.');
}
