import api from './api';
import { BusinessSettings, BusinessSettingsUpdate } from '@/types/settings';

export const settingsService = {
  async getSettings(): Promise<BusinessSettings> {
    const response = await api.get('/settings');
    return response.data;
  },

  async updateSettings(data: BusinessSettingsUpdate): Promise<BusinessSettings> {
    const response = await api.put('/settings', data);
    return response.data;
  },
};
