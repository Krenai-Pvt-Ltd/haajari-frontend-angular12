export class EmployeeAdditionalDocument {

    id: number = 0;
    name: string = '';
    url: string = '';
    fileName: string = '';
    uploading!: boolean;


    constructor() {
      this.id = 0;
      this.name = '';
      this.url = '';
      this.fileName =  '';
      this.uploading = false;
    }

}
