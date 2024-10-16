export class OnboardingModule {
  id: number;
  name: string;
  isFlag: boolean;

  constructor(id: number, name: string, isFlag: boolean) {
    this.id = id;
    this.name = name;
    this.isFlag = isFlag;
  }
}
