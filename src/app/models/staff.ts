export class Staff {
    id!: number;
    name!: string;
    uuid!: string;
    email!: string;
    phoneNumber!: string;
    selected ?: boolean;
    isAdded:boolean=false;
    joiningDate!: string;

    checked: boolean = false;
}
