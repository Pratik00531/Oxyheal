import { Navigation } from "@/components/Navigation";
import { MobileNav } from "@/components/MobileNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import oxyMascot from "@/assets/oxy-mascot.png";

const Profile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [height, setHeight] = useState<number | string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const result = await api.getCurrentUser();
      if (result.error) {
        toast({
          title: 'Error',
          description: 'Failed to load user data',
          variant: 'destructive',
        });
      } else if (result.data) {
        setUser(result.data);
        setName(result.data.name || '');
        setEmail(result.data.email || '');
        setAge(result.data.age || '');
        setHeight(result.data.height || '');
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData: any = {};
      
      if (name !== user?.name) updateData.name = name;
      if (email !== user?.email) updateData.email = email;
      if (age && age !== user?.age) updateData.age = typeof age === 'string' ? parseInt(age) : age;
      if (height && height !== user?.height) updateData.height = typeof height === 'string' ? parseInt(height) : height;

      if (Object.keys(updateData).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No fields were modified',
        });
        setSaving(false);
        return;
      }

      const result = await api.updateUser(updateData);
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
        // Reload user data
        await loadUserData();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid File',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const result = await api.uploadProfilePicture(file);
      
      if (result.error) {
        toast({
          title: 'Upload Failed',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Profile picture updated',
        });
        // Reload user data to get new picture URL
        await loadUserData();
      }
    } catch (error) {
      console.error('Error uploading picture:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <MobileNav />
        <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <MobileNav />
      
      <main className="md:ml-20 p-6 md:p-8 pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-display font-bold">Profile & Settings</h1>
            <p className="text-muted-foreground text-lg">Manage your account and preferences</p>
          </div>

          {/* Profile Info */}
          <Card className="p-8 gradient-card shadow-soft">
            <div className="flex items-center space-x-6 mb-8">
              <div className="relative">
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
                <img
                  src={user?.profile_picture || oxyMascot}
                  alt="Profile"
                  className="w-24 h-24 rounded-full bg-purple-light p-2 object-cover"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfilePictureChange}
                  accept="image/*"
                  className="hidden"
                  id="profile-picture-input"
                />
                <button 
                  onClick={() => document.getElementById('profile-picture-input')?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-soft hover:scale-110 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">{user?.name || 'User'}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-primary mt-1">Member since {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    placeholder="Enter your age" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="rounded-xl" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    placeholder="Enter your height" 
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="rounded-xl" 
                  />
                </div>
              </div>
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="rounded-full bg-primary hover:bg-primary/90 shadow-soft"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6 gradient-card shadow-soft">
            <h2 className="text-xl font-display font-bold mb-6">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-purple-light/50">
                <div>
                  <p className="font-medium">Daily Reminders</p>
                  <p className="text-sm text-muted-foreground">Get reminded to log your daily metrics</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-purple-light/50">
                <div>
                  <p className="font-medium">Exercise Alerts</p>
                  <p className="text-sm text-muted-foreground">Notifications for breathing exercises</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-purple-light/50">
                <div>
                  <p className="font-medium">Water Intake Reminders</p>
                  <p className="text-sm text-muted-foreground">Stay hydrated throughout the day</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          {/* Health Goals */}
          <Card className="p-6 gradient-card shadow-soft">
            <h2 className="text-xl font-display font-bold mb-6">Health Goals</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-light/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Daily Steps Goal</p>
                  <p className="text-sm text-primary font-medium">10,000</p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-purple-light/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Water Intake Goal</p>
                  <p className="text-sm text-primary font-medium">8 glasses</p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "75%" }}></div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-purple-light/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">Weekly Exercise Sessions</p>
                  <p className="text-sm text-primary font-medium">5 sessions</p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "60%" }}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
