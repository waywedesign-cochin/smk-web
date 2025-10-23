"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "../ui/alert";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Lock,
  Edit2,
  Save,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
// import { toast } from 'sonner@2.0.3';
import toast from "react-hot-toast";
import { User as UserProfile } from "@/lib/types";

// interface User {
//   id: string;
//   username: string;
//   email: string;
//   role: number; // 1: admin, 2: director, 3: staff
//   location?: {
//     id: string;
//     name: string;
//   };
//   createdAt: string;
//   updatedAt: string;
// }

interface ProfilePageProps {
  user: null | UserProfile;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
  onChangePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export function ProfilePage({
  user,
  onUpdateProfile,
  onChangePassword,
}: ProfilePageProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user?.username,
    email: user?.email,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const getRoleName = (role: number) => {
    switch (role) {
      case 1:
        return "Admin";
      case 2:
        return "Director";
      case 3:
        return "Staff";
      default:
        return "Unknown";
    }
  };

  const getRoleBadgeVariant = (
    role: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 1:
        return "destructive";
      case 2:
        return "default";
      case 3:
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleProfileSave = async () => {
    try {
      await onUpdateProfile({
        username: profileData.username,
        email: profileData.email,
        locationId: user?.locationId,
        name: user?.name,
        role: user?.role,
        location: user?.location,
        id: user?.id,
      });
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    }
  };

  const handlePasswordChange = async () => {
    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await onChangePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        "Failed to change password. Please check your current password."
      );
      console.error(error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const validatePassword = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      hasLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      isValid:
        hasLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar,
    };
  };

  const passwordValidation = validatePassword(passwordData.newPassword);

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="bg-[#17191a] border-none">
        <CardContent className="">
          <div>
            <div className="flex items-center gap-3 mb-2 text-white">
              <h2 className="text-2xl text-blue-100">{user?.username}</h2>
              <Badge variant={getRoleBadgeVariant(user?.role as number)}>
                {getRoleName(user?.role as number)}
              </Badge>
            </div>
            <div className="space-y-2 text-muted-foreground">
              <div className="flex items-center text-blue-600 gap-2">
                <Mail className="h-4 w-4  " />
                <span>{user?.email}</span>
              </div>
              {user?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{user?.location.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Member since{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Profile and Security */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-[#17191a] text-white">
          <TabsTrigger value="profile" className="text-white">
            <User className="h-4 w-4 mr-2" />
            Profile Information
          </TabsTrigger>
          <TabsTrigger value="security" className="text-white">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Information Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-[#0a0a0a]/70 backdrop-blur-3xl border-[#191a1a] text-white">
            <CardHeader>
              <div className="flex items-center max-md:flex-col max-md:justify-start max-md:items-start max-md:gap-4 justify-between">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                {!isEditingProfile ? (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    variant="secondary"
                    className="max-md:ms-auto"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2 max-md:ms-auto">
                    <Button onClick={handleProfileSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditingProfile(false);
                        setProfileData({
                          username: user?.username,
                          email: user?.email,
                        });
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username </Label>
                  <Input
                    id="username"
                    required
                    className="bg-[#151515] border-[#191a1a]"
                    value={profileData.username}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        username: e.target.value,
                      })
                    }
                    disabled={!isEditingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-[#151515] border-[#191a1a]"
                    value={profileData.email}
                    required
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{getRoleName(user?.role as number)}</span>
                  </div>
                </div>
                {user?.location && (
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="flex items-center gap-2 h-10">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.location.name}</span>
                    </div>
                  </div>
                )}
              </div>

              <Alert className="bg-red-100/20 shadow-inner text-red-600 font-semibold border-l-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white">
                  Role and location can only be changed by an administrator.
                  Please contact your system admin if you need these changed.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="bg-blue-950/60 backdrop-blur-3xl border-[#191a1a] text-white">
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Information about your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="text-sm text-muted-foreground">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Last Updated</Label>
                  <div className="text-sm text-muted-foreground">
                    {user?.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="bg-[#0f1d40]/10  backdrop-blur-3xl border-[#191a1a] text-white">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Ensure your account is using a strong password to stay secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    className="bg-[#151515] border-[#191a1a]"
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="Enter your current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    className="bg-[#151515] border-[#191a1a]"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    placeholder="Enter your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    className="bg-[#151515] border-[#191a1a]"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="Confirm your new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {passwordData.newPassword && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1 mt-2">
                      <p className="font-medium mb-2">Password Requirements:</p>
                      <div className="space-y-1">
                        <PasswordRequirement
                          met={passwordValidation.hasLength}
                          text="At least 8 characters"
                        />
                        <PasswordRequirement
                          met={passwordValidation.hasUpperCase}
                          text="One uppercase letter"
                        />
                        <PasswordRequirement
                          met={passwordValidation.hasLowerCase}
                          text="One lowercase letter"
                        />
                        <PasswordRequirement
                          met={passwordValidation.hasNumber}
                          text="One number"
                        />
                        <PasswordRequirement
                          met={passwordValidation.hasSpecialChar}
                          text="One special character"
                        />
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {passwordData.confirmPassword &&
                passwordData.newPassword !== passwordData.confirmPassword && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Passwords do not match</AlertDescription>
                  </Alert>
                )}

              <div className="flex justify-end gap-2">
                <Button
                  onClick={() =>
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }
                  variant="secondary"
                  disabled={isChangingPassword}
                >
                  Clear
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={
                    isChangingPassword ||
                    !passwordValidation.isValid ||
                    passwordData.newPassword !== passwordData.confirmPassword ||
                    !passwordData.currentPassword
                  }
                >
                  {isChangingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a]/70 backdrop-blur-3xl border-[#191a1a] text-white">
            <CardHeader>
              <CardTitle>Security Information</CardTitle>
              <CardDescription>
                Additional security details about your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 border-[">
              <div className="space-y-2">
                <Label>Last Password Change</Label>
                <div className="text-sm text-muted-foreground">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>
              <Alert className="text-green-600 bg-green-100/10 border-l-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  We recommend changing your password every 90 days.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={met ? "text-green-500" : "text-muted-foreground"}>
        {text}
      </span>
    </div>
  );
}
