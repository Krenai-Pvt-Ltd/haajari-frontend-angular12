import { UserDTO } from "./UserDTO";

export interface AssetRequestDTO {
  assetType: string;
  requestedOn: Date;
  assetName: string;
  requestedType: string;
  assetCategory: string;
  assetCategoryName: string;
  requestedTo: UserDTO;
  requestedUser: string;
  approvedBy?: string;
  actionTakenOn?: Date;
  note: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
