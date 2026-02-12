import { BusinessSettings, BusinessSettingsUpdate } from '@/types/settings';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const settingsService = {
  async getSettings(): Promise<BusinessSettings> {
    const response = await fetch(`${API_URL}/settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return response.json();
  },

  async updateSettings(data: BusinessSettingsUpdate): Promise<BusinessSettings> {
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update settings');
    }
    return response.json();
  },
};
