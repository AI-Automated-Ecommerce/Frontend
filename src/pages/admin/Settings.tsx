import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Bell, Shield, Palette, Building2 } from 'lucide-react';
import { BusinessSettings } from '@/types/settings';
import { settingsService } from '@/services/settingsService';
import { useEffect } from 'react';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [notifications, setNotifications] = useState({
    newOrders: true,
    lowStock: true,
    customerSignups: false,
  });

  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
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
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setBusinessSettings(data);
    } catch (error) {
      console.error('Failed to load settings', error);
      toast({
        title: 'Error',
        description: 'Failed to load business settings',
        variant: 'destructive',
      });
    }
  };

  const handleSaveBusinessSettings = async () => {
    try {
      const updated = await settingsService.updateSettings(businessSettings);
      setBusinessSettings(updated);
      toast({
        title: 'Settings saved',
        description: 'Business details have been updated',
      });
    } catch (error) {
      console.error('Failed to save settings', error);
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Business Details Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Business Details</CardTitle>
          </div>
          <CardDescription>Manage your business information visible to the AI agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={businessSettings.business_name}
              onChange={(e) => setBusinessSettings({ ...businessSettings, business_name: e.target.value })}
              placeholder="e.g. Acme Corp"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                value={businessSettings.contact_email || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, contact_email: e.target.value })}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                value={businessSettings.contact_phone || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, contact_phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                value={businessSettings.whatsapp_number || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, whatsapp_number: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={businessSettings.address || ''}
                onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                placeholder="123 Main St, City, Country"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank_details">Bank Payment Details</Label>
            <textarea
              id="bank_details"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={businessSettings.bank_details || ''}
              onChange={(e) => setBusinessSettings({ ...businessSettings, bank_details: e.target.value })}
              placeholder="Bank Name: Example Bank&#10;Account No: 123456789&#10;Account Name: Business Name"
            />
            <p className="text-sm text-muted-foreground">
              These details will be shared with customers for bank transfer payments.
            </p>
          </div>
          <Button onClick={handleSaveBusinessSettings}>Save Business Details</Button>
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            />
          </div>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Orders</p>
              <p className="text-sm text-muted-foreground">
                Get notified when a new order is placed
              </p>
            </div>
            <Switch
              checked={notifications.newOrders}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, newOrders: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Low Stock Alerts</p>
              <p className="text-sm text-muted-foreground">
                Get notified when product stock is low
              </p>
            </div>
            <Switch
              checked={notifications.lowStock}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, lowStock: checked })
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Customer Signups</p>
              <p className="text-sm text-muted-foreground">
                Get notified when new customers sign up
              </p>
            </div>
            <Switch
              checked={notifications.customerSignups}
              onCheckedChange={(checked) =>
                setNotifications({ ...notifications, customerSignups: checked })
              }
            />
          </div>
          <Button onClick={handleSaveNotifications}>Save Preferences</Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input id="current-password" type="password" placeholder="Enter current password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input id="new-password" type="password" placeholder="Enter new password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input id="confirm-password" type="password" placeholder="Confirm new password" />
          </div>
          <Button
            onClick={() =>
              toast({
                title: 'Password updated',
                description: 'Your password has been changed successfully',
              })
            }
          >
            Change Password
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Theme settings coming soon. Currently using system default.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
