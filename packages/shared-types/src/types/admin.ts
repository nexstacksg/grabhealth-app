// Admin Service Types - Only unique types not already defined elsewhere
export interface IAdminSettings {
  siteName?: string;
  siteDescription?: string;
  maintenanceMode?: boolean;
  allowRegistration?: boolean;
  emailNotifications?: boolean;
  commissionSettings?: {
    level1Rate: number;
    level2Rate: number;
    level3Rate: number;
    level4Rate: number;
  };
  paymentSettings?: {
    stripePublicKey?: string;
    paypalClientId?: string;
  };
}

// Backward compatibility exports (without I prefix)
export type AdminSettings = IAdminSettings;