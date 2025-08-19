import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "john.doe@example.com",
    timeZone: "utc-5",
    language: "en",
    autoDetectLanguage: true,
    highAccuracyMode: false,
    defaultOutputFormat: "plain",
    autoDeleteUploads: true,
    dataRetention: "30days",
    emailNotifications: true,
    processingCompletion: true,
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSwitchChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleEnable2FA = () => {
    toast({
      title: "2FA Setup",
      description: "Two-factor authentication setup wizard will open.",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Settings</h1>
        <p className="text-xl text-slate-600">Customize your TextExtract Pro experience.</p>
      </div>

      <div className="space-y-8">
        {/* Account Settings */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              <i className="fas fa-user text-blue-600 mr-3"></i>Account Settings
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  data-testid="input-full-name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  data-testid="input-email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Zone</label>
                <Select value={formData.timeZone} onValueChange={(value) => handleInputChange('timeZone', value)}>
                  <SelectTrigger data-testid="select-timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc-5">UTC-5 (Eastern Time)</SelectItem>
                    <SelectItem value="utc-8">UTC-8 (Pacific Time)</SelectItem>
                    <SelectItem value="utc+0">UTC+0 (GMT)</SelectItem>
                    <SelectItem value="utc+1">UTC+1 (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger data-testid="select-language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Preferences */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              <i className="fas fa-cogs text-green-600 mr-3"></i>Processing Preferences
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">Auto-detect Language</h3>
                  <p className="text-sm text-slate-600">Automatically detect document language</p>
                </div>
                <Switch
                  checked={formData.autoDetectLanguage}
                  onCheckedChange={(checked) => handleSwitchChange('autoDetectLanguage', checked)}
                  data-testid="switch-auto-detect"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">High Accuracy Mode</h3>
                  <p className="text-sm text-slate-600">Use advanced processing for better accuracy (slower)</p>
                </div>
                <Switch
                  checked={formData.highAccuracyMode}
                  onCheckedChange={(checked) => handleSwitchChange('highAccuracyMode', checked)}
                  data-testid="switch-high-accuracy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Default Output Format</label>
                <Select value={formData.defaultOutputFormat} onValueChange={(value) => handleInputChange('defaultOutputFormat', value)}>
                  <SelectTrigger data-testid="select-output-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plain">Plain Text</SelectItem>
                    <SelectItem value="formatted">Formatted Text</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV (Tables)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              <i className="fas fa-shield-alt text-purple-600 mr-3"></i>Privacy & Security
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">Auto-delete Uploads</h3>
                  <p className="text-sm text-slate-600">Automatically delete uploaded files after processing</p>
                </div>
                <Switch
                  checked={formData.autoDeleteUploads}
                  onCheckedChange={(checked) => handleSwitchChange('autoDeleteUploads', checked)}
                  data-testid="switch-auto-delete"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Data Retention Period</label>
                <Select value={formData.dataRetention} onValueChange={(value) => handleInputChange('dataRetention', value)}>
                  <SelectTrigger data-testid="select-data-retention">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="90days">90 days</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mr-3 mt-1"></i>
                  <div>
                    <h4 className="font-medium text-yellow-800">Two-Factor Authentication</h4>
                    <p className="text-sm text-yellow-700 mt-1">Enhance your account security by enabling 2FA.</p>
                    <Button
                      onClick={handleEnable2FA}
                      className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white"
                      data-testid="button-enable-2fa"
                    >
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              <i className="fas fa-bell text-orange-600 mr-3"></i>Notifications
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">Email Notifications</h3>
                  <p className="text-sm text-slate-600">Receive updates about your extractions</p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                  data-testid="switch-email-notifications"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">Processing Completion</h3>
                  <p className="text-sm text-slate-600">Notify when document processing is complete</p>
                </div>
                <Switch
                  checked={formData.processingCompletion}
                  onCheckedChange={(checked) => handleSwitchChange('processingCompletion', checked)}
                  data-testid="switch-processing-completion"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-settings">
            <i className="fas fa-save mr-2"></i>Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
