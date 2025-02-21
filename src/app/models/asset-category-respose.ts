export interface AssetCategoryResponse {
    categoryId: number;
    categoryName: string;
    categoryImage: string;
    assignedCount: number;
    availableCount: number;
    unavailableCount: number;
}

export interface OrganizationAssetResponse {
    assetId: number;
    assetName: string;
    serialNumber: string;
    createdDate: Date;
    purchasedDate: any;
    expiryDate: Date;
    price: string;
    location: string;
    vendorName: string;
    status: string;
    userName: string;
    userImage: string;
    categoryName: string;
    categoryImage: string;
    
}

export interface AssetCategoryRequest {
    categoryName: string;
    categoryImage: string;
  }

  export interface OrganizationAssetRequest {
    assetName: string;
    serialNumber: string;
    purchasedDate: any;
    expiryDate: any;
    price: string;
    location: string;
    vendorName: string;
    userId: number;
    assignedDate: any;
    categoryId: number;
  }

  export interface StatusWiseTotalAssetsResponse {
	 assetName: string;
	 serialNumber: string;
	 createdDate: Date;
	 status: string;

}
export class CategoryCountDTO {
    month: string;
    categoryCounts: { [key: string]: number };

    constructor(month: string, categoryCounts: { [key: string]: number }) {
      this.month = month;
      this.categoryCounts = categoryCounts;
    }
  }




