import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Key } from '../constant/key';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  private readonly _key: Key = new Key();
  constructor(private readonly httpClient: HttpClient) { }

  private readonly baseUrl = this._key.base_url;

  getAllUserByWallet(
      role: string,
      pageNumber: number,
      itemPerPage: number,
      startDate: any,
      endDate: any,
      tag: string,
      search: string,
      userIds: number[]
    ) {
      let params = new HttpParams()
        .set('sortBy', 'createdDate')
        .set('sortOrder', 'desc')
        .set('tag', tag)
        .set('role', role)
        .set('search', search);

        userIds.forEach(id => {
          params = params.append('id', id);
        });


        if (pageNumber != 0 && itemPerPage != 0) {
          params = params.set('currentPage', pageNumber); 
          params = params.set('itemPerPage', itemPerPage);
        }
      
        if (startDate && endDate) {
          params = params.set('startDate', startDate);
          params = params.set('endDate', endDate);
        }
  
      return this.httpClient.get<any>(`${this.baseUrl}/user-expense-wallet/users`, {
        params,
      });
    }

    getUserTransactions(userId: string) {
      let params = new HttpParams().set('userUuid', userId); 
      return this.httpClient.get<any>(`${this.baseUrl}/user-expense-wallet/user-transactions`, { params });
    }
  

    rechargeWallet(requestBody : any) {
      // const body = { userId, amount, remark };
      return this.httpClient.post<any>(`${this.baseUrl}/user-expense-wallet`, requestBody);
    }
  
    //Get Full Expeanse Summary
    getExpenseSummary(){
      return this.httpClient.get<any>(`${this.baseUrl}/company-expense/expense-summary`);
    }

    //get expense by selecting type
    getExpenseBytype(startDate: any, endDate: any,){
      let params = new HttpParams();
      
      if (startDate && endDate) {
        params = params.set('startDate', startDate);
        params = params.set('endDate', endDate);
      }
      return this.httpClient.get<any>(`${this.baseUrl}/company-expense/expense-summary-by-type`,{ params });
    }

    //get trends date on expense
    getExpenseTrends(){
      return this.httpClient.get<any>(`${this.baseUrl}/company-expense/compare-weekly`);
    }


    getTeamWallets() {
      return this.httpClient.get<any>(`${this.baseUrl}/user-expense-wallet/team-wallets`);
    }

    getCreditWalletAmount() {
      return this.httpClient.get<any>(`${this.baseUrl}/user-expense-wallet/company-credit-wallet-amount`);
    }

    getDebitWalletAmount() {
      return this.httpClient.get<any>(`${this.baseUrl}/user-expense-wallet/company-debit-wallet-amount`);
    }



    getTop5UsersWithHighestExpense(){
      return this.httpClient.get<any>(`${this.baseUrl}/company-expense/top-expense-user`);
    }

    


}
