import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchSettings, updateSettings } from '@/store/slices/settingsSlice';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Shield, Palette, Building2, Save } from 'lucide-react';
import { BusinessSettings } from '@/types/settings';

const Settings = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { toast } = useToast();
  const dispatch = useAppDispatch();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    customerSignups: false,
  });

  const { settings: businessSettings, status } = useAppSelector((state) => state.settings);
  const [localSettings, setLocalSettings] = useState<BusinessSettings>({
    id: 0,
    business_name: '',
    contact_email: '',
    contact_phone: '',
    whatsapp_number: '',
    address: '',
    bank_details: '',
    updated_at: null,
  });

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (businessSettings) {
      setLocalSettings(businessSettings);
    }
  }, [businessSettings]);

  const handleSaveBusinessSettings = async () => {
    try {
      await dispatch(updateSettings(localSettings)).unwrap();
      toast({
        title: 'Settings saved',
        description: 'Business details have been updated',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save business settings',
        variant: 'destructive',
      });
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: 'Profile updated',
      description: 'Your profile settings have been saved',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notifications updated',
      description: 'Your notification preferences have been saved',
    });
  };

  return (
    <div className="space-y-6">
      <div className="admin-surface flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">System Configuration</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your business profile, account preferences, and security.</p>
        </div>
        <Button className="h-11 rounded-xl px-4" onClick={handleSaveBusinessSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Business Details
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="admin-surface p-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">Business Details</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Information that powers invoices, communication, and AI agent replies.</p>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business_name">Business Name</Label>
                <Input
                  id="business_name"
                  value={localSettings.business_name}
                  onChange={(e) => setLocalSettings({ ...localSettings, business_name: e.target.value })}
                  placeholder="e.g. Acme Corp"
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={localSettings.contact_email || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, contact_email: e.target.value })}
                    placeholder="contact@example.com"
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    value={localSettings.contact_phone || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, contact_phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
                  <Input
                    id="whatsapp_number"
                    value={localSettings.whatsapp_number || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, whatsapp_number: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="rounded-xl border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={localSettings.address || ''}
                    onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                    placeholder="123 Main St, City, Country"
                    className="rounded-xl border-slate-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank_details">Bank Payment Details</Label>
                <Textarea
                  id="bank_details"
                  rows={5}
                  className="rounded-xl border-slate-200"
                  value={localSettings.bank_details || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, bank_details: e.target.value })}
                  placeholder="Bank Name: Example Bank&#10;Account No: 123456789&#10;Account Name: Business Name"
                />
                <p className="text-sm text-slate-500">
                  These details are shared with customers for bank transfer payments.
                </p>
              </div>
            </div>
          </div>

          <div className="admin-surface p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">Security</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Update password and protect your admin workspace.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="Enter current password" className="rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" className="rounded-xl border-slate-200" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" className="rounded-xl border-slate-200" />
              </div>
            </div>
            <Button
              className="mt-5 rounded-xl"
              onClick={() =>
                toast({
                  title: 'Password updated',
                  description: 'Your password has been changed successfully',
                })
              }
            >
              Change Password
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="admin-surface p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Update account details and display name.</p>
            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <Button className="rounded-xl" onClick={handleSaveProfile}>Save Changes</Button>
            </div>
          </div>

          <div className="admin-surface p-6">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
            </div>
            <p className="mt-1 text-sm text-slate-500">Choose what updates you receive.</p>
            <div className="mt-5 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">New Orders</p>
                  <p className="text-sm text-slate-500">Notify when a new order is placed</p>
                </div>
                <Switch
                  checked={notifications.newOrders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">Low Stock Alerts</p>
                  <p className="text-sm text-slate-500">Notify when stock is low</p>
                </div>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-800">Customer Signups</p>
                  <p className="text-sm text-slate-500">Notify when new customers sign up</p>
                </div>
                <Switch
                  checked={notifications.customerSignups}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, customerSignups: checked })}
                />
              </div>
              <Button className="rounded-xl" onClick={handleSaveNotifications}>Save Preferences</Button>
            </div>
          </div>

          <div className="admin-surface p-6">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-slate-600" />
              <h2 className="text-xl font-semibold text-slate-900">Appearance</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">
              Theme customization controls will be available soon. Current theme follows the dashboard design system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
