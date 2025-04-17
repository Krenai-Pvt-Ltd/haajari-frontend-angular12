import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import moment from 'moment';
import { finalize } from 'rxjs/operators';
import { Key } from 'src/app/constant/key';
import { Routes } from 'src/app/constant/Routes';
import { LeaveResponse } from 'src/app/models/leave-responses.model';
import { HelperService } from 'src/app/services/helper.service';
import { LeaveService } from 'src/app/services/leave.service';
import { RoleBasedAccessControlService } from 'src/app/services/role-based-access-control.service';

@Component({
  selector: 'app-leave-requests',
  templateUrl: './leave-requests.component.html',
  styleUrls: ['./leave-requests.component.css']
})
export class LeaveRequestsComponent implements OnInit {

  constructor(
    private leaveService: LeaveService,
    private helperService: HelperService,
    public rbacService: RoleBasedAccessControlService,
    private datePipe: DatePipe,
    private router: Router,
    private cdr: ChangeDetectorRef
) {}

@Output() pendingLeaveCountChange = new EventEmitter<number>();
@Input() category: string = '';
showFilter: boolean = false;
logInUserUuid: string = '';
APPROVED: string = 'approved';
PENDING: string = 'pending';
REJECTED: string = 'rejected';
REQUESTED: string = 'requested';
HOLIDAY: string = Key.HOLIDAY;
isLoadingLeaves: boolean = false;
itemPerPage: number = 10;
currentPage: number = 1;
searchTerm: string = '';
leaves: any[] = [];
totalItems: number = 0;
statusMaster: string[] = [this.PENDING, this.APPROVED, this.REJECTED];
filters: {
    fromDate: any | undefined;
    toDate: any | undefined;
    leaveType: string[];
    status: string[]
} = {
    leaveType: [],
    status: [],
    fromDate: undefined,
    toDate: undefined
};
appliedFilters: { key: string; value: string }[] = [];
leaveTypes = ['Earned Leave', 'Sick Leave', 'Casual Leave', 'Leave Without Pay'];
pendingLeaveCount: number = 0;
leaveRequestLoading: { [key: number]: boolean } = {};
rejectionReason: string = '';
rejectionReasonFlag: boolean = false;
isPendingChange: boolean = false;
showLeaveQuotaModal: boolean = false;
userLeaveQuota: any = null;
leave!: LeaveResponse;
leaveData: any = { leave: {} };
isModalOpen: boolean = false;
expandedStates: boolean[] = [];
expandedIndex: number | null = null;
showCalender: boolean = false;
dayWiseLeaveStatus: any[] = [];
dayWiseLeaveStatusLoader: boolean = false;
selectedLeave: any = '';
displayDateFormat: string = 'DD-MM-YYYY';
displayDateFormatNew: string = 'YYYY-MM-DD';
networkDateFormat: string = "yyyy-MM-DD HH:mm:ss";
readonly Routes = Routes;

  changeShowFilter(flag: boolean) {
    this.showFilter = flag;
}

async ngOnInit() {
    this.logInUserUuid = await this.rbacService.getUUID();
    this.filters.status = ['pending'];
    this.applyFilters();
}

getLeaves(resetSearch = false, applyDateRange = false) {
    if (resetSearch) {
        this.resetSearch();
    }

    console.log('category', this.category);
    const params: any = {
        status: this.filters.status,
        category: this.category,
        leaveType: this.filters.leaveType,
        itemPerPage: this.itemPerPage,
        currentPage: this.currentPage,
        search: this.searchTerm || undefined
    };

    if (applyDateRange) {
        params.startDate = moment(this.filters.fromDate).format(this.displayDateFormatNew);
        params.endDate = moment(this.filters.toDate).format(this.displayDateFormatNew);
    }

    this.isLoadingLeaves = true;

    this.leaveService.get(params)
        .pipe(finalize(() => this.isLoadingLeaves = false))
        .subscribe({
            next: (response: any) => {
                if (Array.isArray(response.object)) {
                    this.leaves = response.object;
                    this.totalItems = response.totalItems;
                    if (this.filters.status.length == 1 && this.filters.status.includes('pending')) {
                        this.pendingLeaveCount = response.totalItems;
                        this.pendingLeaveCountChange.emit(this.pendingLeaveCount);
                    }
                } else {
                    this.leaves = [];
                    this.totalItems = 0;
                }
            },
            error: () => {
                this.helperService.showToast('Failed to load leaves.', Key.TOAST_STATUS_ERROR);
            },
        });
}

routeToUserDetails(uuid: string) {
    let navExtra: NavigationExtras = {
        queryParams: { userId: uuid },
    };
    const url = this.router.createUrlTree([Key.EMPLOYEE_PROFILE_ROUTE], navExtra).toString();
    window.open(url, '_blank');
}

onPageChange(page: number) {
    this.searchTerm = '';
    this.currentPage = page;
    if (this.filters.fromDate && this.filters.toDate) {
        this.getLeaves(false, true);
    } else {
        this.getLeaves(false, false);
    }
}

resetSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
    this.leaves = [];
}

searchTermChanged(event: any) {
    this.currentPage = 1;
    this.searchTerm = event.target.value;
    this.searchTerm.trim().length === 0 ? this.resetSearch() : this.applyFilters();
}

resetFiltersSearch() {
    if (this.filters.fromDate && this.filters.toDate) {
        this.getLeaves(true, true);
    } else {
        this.getLeaves(true, false);
    }
}

applyFilters(): void {
    this.appliedFilters = [];
    if (this.filters.leaveType.length) {
        const uniqueLeaveTypes = [...new Set(this.filters.leaveType)];
        uniqueLeaveTypes.forEach(type => {
            this.appliedFilters.push({ key: 'Leave Type', value: type });
        });
    }
    if (this.filters.status.length) {
        const uniqueStatuses = [...new Set(this.filters.status)];
        uniqueStatuses.forEach(status => {
            this.appliedFilters.push({ key: 'Status', value: status });
        });
    }
    if (this.filters.fromDate && this.filters.toDate) {
        const fromDate = moment(this.filters.fromDate).format(this.displayDateFormat);
        const toDate = moment(this.filters.toDate).format(this.displayDateFormat);
        this.appliedFilters.push({ key: 'Date', value: `${fromDate} to ${toDate}` });
    }
    this.changeShowFilter(false);
    this.currentPage = 1;
    if (this.filters.fromDate && this.filters.toDate) {
        this.getLeaves(false, true);
    } else {
        this.getLeaves(false, false);
    }
}

resetFilters(): void {
    this.filters = {
        fromDate: undefined,
        toDate: undefined,
        leaveType: [],
        status: [],
    };
    this.appliedFilters = [];
    this.changeShowFilter(false);
    this.currentPage = 1;
    this.applyFilters();
}

removeFilter(filter: { key: string; value: string }): void {
    this.appliedFilters = this.appliedFilters.filter(f => !(f.key === filter.key && f.value === filter.value));
    switch (filter.key) {
        case 'Leave Type':
            this.filters.leaveType = this.filters.leaveType.filter(type => type !== filter.value);
            break;
        case 'Status':
            this.filters.status = this.filters.status.filter(status => status !== filter.value);
            break;
        case 'Date':
            this.filters.fromDate = undefined;
            this.filters.toDate = undefined;
            break;
    }
    this.changeShowFilter(false);
    this.currentPage = 1;
    this.applyFilters();
}

disabledDateTo = (current: Date): boolean => {
    return current && this.filters.fromDate && current <= this.filters.fromDate;
};

disabledDateFrom = (current: Date): boolean => {
    return current && this.filters.toDate && current >= this.filters.toDate;
};

approveOrRejectLeave(leaveId: number, operation: string) {
    this.leaveRequestLoading[leaveId] = true;
    this.leaveService.approveOrRejectLeaveOfUser(leaveId, operation, this.rejectionReason).subscribe({
        next: (response: any) => {
            this.leaveRequestLoading[leaveId] = false;
            this.rejectionReason = '';
            this.rejectionReasonFlag = false;
            this.isPendingChange = true;
            this.applyFilters();
            if (response.message === 'approved' || response.message === 'rejected') {
                this.helperService.showToast(`Leave ${operation} successfully.`, Key.TOAST_STATUS_SUCCESS);
            } else if (response.message === Key.LEAVE_QUOTA_EXCEEDED) {
                this.helperService.showToast('Leave quota exceeded.', Key.TOAST_STATUS_ERROR);
                this.fetchUserLeaveQuota(leaveId);
            } else {
                this.helperService.showToast(response.message, Key.TOAST_STATUS_ERROR);
            }
        },
        error: (error) => {
            this.leaveRequestLoading[leaveId] = false;
            this.helperService.showToast('Error.', Key.TOAST_STATUS_ERROR);
            console.error('Failed to fetch approve/reject leaves:', error);
        },
    });
}

fetchUserLeaveQuota(leaveId: number) {
    this.leaveService.getUserLeaveQuota(leaveId).subscribe({
        next: (quota: any) => {
            this.userLeaveQuota = quota.object;
            this.openLeaveQuotaModal();
        },
        error: (err) => {
            console.error('Failed to fetch user leave quota:', err);
            this.helperService.showToast('Failed to load leave quota.', Key.TOAST_STATUS_ERROR);
        }
    });
}

openLeaveQuotaModal() {
    this.showLeaveQuotaModal = true;
}

closeLeaveQuotaModal() {
    this.showLeaveQuotaModal = false;
}

viewLeave(leave: any) {
    if (!leave) {
        console.log("Leave data is undefined or null.");
        return;
    }
    this.isModalOpen = false;
    this.leave = leave;
    this.leaveData = { leave: {} };
    this.leaveData.leave = leave;
    setTimeout(() => {
        this.isModalOpen = true;
        this.cdr.detectChanges();
        this.cdr.markForCheck();
    }, 10);
}

closeModalHandler(event: any): void {
    this.leaveData = null;
    this.isModalOpen = false;
    this.applyFilters();
    if (event != null) {
        this.userLeaveQuota = event;
        this.openLeaveQuotaModal();
    }
}

getDayWiseLeaveStatus(leave: any) {
    this.selectedLeave = leave;
    this.dayWiseLeaveStatusLoader = true;
    this.dayWiseLeaveStatus = [];
    this.leaveService.getDayWiseLeaveStatus(leave.id).subscribe({
        next: (response: any) => {
            this.dayWiseLeaveStatus = response.object;
            this.dayWiseLeaveStatusLoader = false;
        },
        error: (error) => {
            this.dayWiseLeaveStatusLoader = false;
            console.error('Failed to fetch day-wise leave status:', error);
        },
    });
}

isBetweenStartAndEndDate(date: string): boolean {
    const currentDate = new Date(date);
    const startDate = new Date(this.selectedLeave.startDate);
    const endDate = new Date(this.selectedLeave.endDate);
    currentDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    return currentDate >= startDate && currentDate <= endDate;
}

openCloseMonthCalender() {
    this.showCalender = !this.showCalender;
}

toggleCollapse(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
    this.expandedStates[index] = !this.expandedStates[index];
}

isExpanded(index: number): boolean {
    return this.expandedIndex === index;
}

getDayFromDate(inputDate: string) {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    return day;
}

getDayNameFromDate(dateString: string): any {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'EEEE');
}

}
