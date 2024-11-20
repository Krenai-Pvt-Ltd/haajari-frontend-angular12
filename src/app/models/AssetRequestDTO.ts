import { UserDTO } from "./UserDTO";

export interface AssetRequestDTO {
  id: Number;
  assetType: string;
  requestedOn: Date;
  requestedBy: string;
  userUuid: string;
  assetName: string;
  requestedType: string;
  assetCategory: string;
  assetCategoryName: string;
  requestedTo: UserDTO;
  requestedUser: string;
  approvedBy?: string;
  actionTakenOn?: Date;
  note: string;
  status: string;
}
