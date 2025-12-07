export interface SponsoringInterfaceModel {
  id?: number | string;
  sponsor_id: string;
  sponsored_id: string;
  firstDeposit: boolean;
}

export interface SponsoringReturnedInterfaceModel {
  id?: number | string;
  sponsor_id: string;
  initials: string;
  name: string;
  email: string;
  firstDeposit: boolean;
}
