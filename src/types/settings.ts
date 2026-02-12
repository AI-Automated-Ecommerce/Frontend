export interface BusinessSettings {
  id: number;
  business_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  updated_at: string | null;
}

export interface BusinessSettingsUpdate {
  business_name?: string;
  contact_email?: string;
  contact_phone?: string;
  whatsapp_number?: string;
  address?: string;
}
