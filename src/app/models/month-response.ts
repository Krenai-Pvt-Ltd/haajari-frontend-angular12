export class MonthResponse {
  constructor(
    public firstDate: string,
    public lastDate: string,
    public status: string,
    public disable : boolean
  ) {}
}