
export interface EmployeeAdditionalDocument {
  id?: number;
  name: string;
  value: string;
  url: string;
  fileName: string;
  documentType?: string;
  startDate?: Date;
  endDate?: Date;
}
