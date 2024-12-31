import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor() { }
  // formData:any={};

   // Logs array
   changeLogs: Array<{ field: string; property: string; previousValue: any; newValue: any }> = [];

   // To store previous values
  //  previousValues = { ...this.formData };
  // previousValues:any={};


   // Method to handle and log changes
  logChanges(newValues: any,previousValues:any) {
    // Recursively check each key
    this.checkChanges(newValues, previousValues, '');
  }

  checkChanges(newValues: any, previousValues: any, parentField: string){
 
  }
  // Recursive function to compare values
  // checkChanges(newValues: any, previousValues: any, parentField: string, parentProperty: string) {
  //   // console.log("🚀 ~ ProfileService ~ checkChanges ~ previousValues:", previousValues)
  //   debugger
  //   for (const field in newValues) {
  //     if (newValues.hasOwnProperty(field) && previousValues) {
  //       const newValue = newValues[field];
  //       const previousValue = previousValues[field];

  //       // If the field is an object, recursively check its properties
  //       if (typeof newValue === 'object' && newValue !== null) {
  //         this.checkChanges(newValue, previousValue, parentField + field + '.', '');
  //       } else {
  //         // Log only if the value has changed
  //         if (previousValue !== newValue) {
  //           const fullField = parentField + field;
  //           const property = parentProperty;

  //           // Push the change log entry
  //           this.changeLogs.push({
  //             field: fullField,
  //             property,
  //             previousValue,
  //             newValue
  //           });

  //           // Update the previous value for this field
  //           try{
  //             previousValues[field] = newValue;
  //           }catch(e){
  //             console.log("🚀 ~ ProfileService ~ checkChanges ~ e:", e)
  //           }

  //         }
  //       }
  //     }
  //   }

  //   // Debug log
  //   // console.log('Change log:', this.changeLogs);
  // }
}
