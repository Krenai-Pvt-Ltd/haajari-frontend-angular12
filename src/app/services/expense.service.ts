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
      pageNumber: number,
      itemPerPage: number,
      startDate: any,
      endDate: any,
      tag: string,
      search: string,
      userIds: number[]
    ) {
      let params = new HttpParams()
        .set('currentPage', pageNumber)
        .set('itemPerPage', itemPerPage)
        .set('sortBy', 'createdDate')
        .set('sortOrder', 'desc')
        .set('tag', tag)
        .set('search', search);

        userIds.forEach(id => {
          params = params.append('id', id);
        });
      
        if (startDate && endDate) {
        params = params.set('startDate', startDate);
        params = params.set('endDate', endDate);
      }
  
      return this.httpClient.get<any>(`${this.baseUrl}/user-expense-wallet/users`, {
        params,
      });
    }

    getUserTransactions(userId: string){
      let params = new HttpParams();
      params.set('userUuid',userId);
      return this.httpClient.get<any>(`${this.baseUrl}/user-expense-wallet/user-transactions`, {
        params,
      });
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


}
