export class MonthResponse {
  constructor(
    public id: number,
    public firstDate: Date,
    public lastDate: Date,
    public month: string,
    public year: number,
    public status: string,
    public disable : boolean
  ) {}
}
