"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { passwordSchema } from "@/lib/validation/userSchema";
import { changePassword } from "@/redux/features/user/userSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";

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
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof passwordData, string>>
  >({});

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { submitting } = useAppSelector((state) => state.users);
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
    const result = passwordSchema.safeParse(passwordData);

    if (!result.success) {
      // Collect and map field errors
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });

      setErrors(fieldErrors);
      toast.error("Please correct the highlighted fields.");
      return;
    }

    // Clear previous errors
    setErrors({});

    try {
      await dispatch(
        changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        })
      );
      // localStorage.removeItem("token");
      // router.push("/signin");
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
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 animate-pulse"></div>
        <CardContent className="relative z-10 pt-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/50">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                  {user?.username}
                </h2>
                <Badge
                  variant={getRoleBadgeVariant(user?.role as number)}
                  className="mt-1 shadow-md"
                >
                  {getRoleName(user?.role as number)}
                </Badge>
              </div>
            </div>
            <div className="space-y-3 text-slate-300">
              <div className="flex items-center gap-3 hover:text-blue-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm">{user?.email}</span>
              </div>
              {user?.location && (
                <div className="flex items-center gap-3 hover:text-cyan-400 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-cyan-400" />
                  </div>
                  <span className="text-sm">{user?.location.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 hover:text-emerald-400 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                </div>
                <span className="text-sm">
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
        <TabsList
          className="
    inline-flex
    w-full
    overflow-x-auto
    whitespace-nowrap
    no-scrollbar
        bg-gradient-to-b from-gray-800/40 to-gray-900/40
        backdrop-blur-xl
    border border-white/10
    rounded-xl
    shadow-lg shadow-black/20    p-1
  "
        >
          <TabsTrigger
            value="profile"
            className="
              text-gray-400
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700
              data-[state=active]:text-white
              data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30
              hover:bg-white/5
              hover:text-gray-200
              transition-all duration-300
              px-5 py-2.5 rounded-lg text-sm font-medium flex-shrink-0
            "
          >
            <User className="h-4 w-4 mr-2" />
            Profile Information
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="
              text-gray-400
              data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700
              data-[state=active]:text-white
              data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30
              hover:bg-white/5
              hover:text-gray-200
              transition-all duration-300
              px-5 py-2.5 rounded-lg text-sm font-medium flex-shrink-0
            "
          >
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        {/* Profile Information Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-900 via-blue-950/50 to-slate-900 backdrop-blur-xl border border-blue-500/20 shadow-xl shadow-blue-500/5">
            <CardHeader>
              <div className="flex items-center max-md:flex-col max-md:justify-start max-md:items-start max-md:gap-4 justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                {!isEditingProfile ? (
                  <Button
                    onClick={() => setIsEditingProfile(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/50 max-md:ms-auto transition-all duration-300"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2 max-md:ms-auto">
                    <Button
                      onClick={handleProfileSave}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-lg shadow-emerald-500/50"
                    >
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
                      className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/50"
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
                  <Label
                    htmlFor="username"
                    className="text-slate-300 font-medium"
                  >
                    Username{" "}
                  </Label>
                  <Input
                    id="username"
                    required
                    className="bg-slate-900/50 border-blue-500/30 focus:border-blue-500 text-white placeholder:text-slate-500 transition-all duration-300"
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
                  <Label htmlFor="email" className="text-slate-300 font-medium">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-slate-900/50 border-blue-500/30 focus:border-blue-500 text-white placeholder:text-slate-500 transition-all duration-300"
                    value={profileData.email}
                    required
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    disabled={!isEditingProfile}
                  />
                </div>
              </div>

              <Separator className="bg-blue-500/20" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium">Role</Label>
                  <div className="flex items-center gap-3 h-10 px-4 rounded-lg bg-slate-900/50 border border-blue-500/30">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-white">
                      {getRoleName(user?.role as number)}
                    </span>
                  </div>
                </div>
                {user?.location && (
                  <div className="space-y-2">
                    <Label className="text-slate-300 font-medium">
                      Location
                    </Label>
                    <div className="flex items-center gap-3 h-10 px-4 rounded-lg bg-slate-900/50 border border-blue-500/30">
                      <MapPin className="h-4 w-4 text-cyan-400" />
                      <span className="text-white">{user?.location.name}</span>
                    </div>
                  </div>
                )}
              </div>
              {user?.role !== 1 && (
                <Alert className="bg-red-500/10 border-l-4 border-red-500 shadow-lg shadow-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    Role and location can only be changed by an administrator.
                    Please contact your system admin if you need these changed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 via-cyan-950/50 to-slate-900 backdrop-blur-xl border border-cyan-500/20 shadow-xl shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Account Details
              </CardTitle>
              <CardDescription className="text-slate-400">
                Information about your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium">
                    Account Created
                  </Label>
                  <div className="text-sm text-slate-400 px-4 py-3 rounded-lg bg-slate-900/50 border border-cyan-500/30">
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
                  <Label className="text-slate-300 font-medium">
                    Last Updated
                  </Label>
                  <div className="text-sm text-slate-400 px-4 py-3 rounded-lg bg-slate-900/50 border border-cyan-500/30">
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
          <Card className="bg-gradient-to-br from-slate-900 via-slate-800/50 to-slate-900 backdrop-blur-xl border border-slate-700/20 shadow-xl shadow-slate-900/5">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-400">
                Change Password
              </CardTitle>
              <CardDescription className="text-slate-400">
                Ensure your account is using a strong password to stay secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="text-slate-300 font-medium"
                >
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    className="bg-slate-900/50 border-slate-700/30 focus:border-slate-600 text-white placeholder:text-slate-500 transition-all duration-300"
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
                  {errors.currentPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.currentPassword}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-200"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        current: !showPasswords.current,
                      })
                    }
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator className="bg-slate-700/20" />

              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-slate-300 font-medium"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    className="bg-slate-900/50 border-slate-700/30 focus:border-slate-600 text-white placeholder:text-slate-500 transition-all duration-300"
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
                  {errors.newPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-200"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        new: !showPasswords.new,
                      })
                    }
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-slate-300 font-medium"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    className="bg-slate-900/50 border-slate-700/30 focus:border-slate-600 text-white placeholder:text-slate-500 transition-all duration-300"
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
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-slate-400 hover:text-slate-200"
                    onClick={() =>
                      setShowPasswords({
                        ...showPasswords,
                        confirm: !showPasswords.confirm,
                      })
                    }
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {passwordData.newPassword && (
                <Alert className="bg-blue-500/10 border-l-4 border-blue-500 shadow-lg shadow-blue-500/10">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-slate-300">
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
                  <Alert className="bg-red-500/10 border-l-4 border-red-500 shadow-lg shadow-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">
                      Passwords do not match
                    </AlertDescription>
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
                  className="bg-slate-700 hover:bg-slate-600"
                  disabled={submitting}
                >
                  Clear
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  className="bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 shadow-lg shadow-slate-900/50"
                >
                  {submitting ? "Changing Password..." : "Change Password"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 via-emerald-950/50 to-slate-900 backdrop-blur-xl border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                Security Information
              </CardTitle>
              <CardDescription className="text-slate-400">
                Additional security details about your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300 font-medium">
                  Last Password Change
                </Label>
                <div className="text-sm text-slate-400 px-4 py-3 rounded-lg bg-slate-900/50 border border-emerald-500/30">
                  {user?.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString("en-GB", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>
              <Alert className="bg-emerald-500/10 border-l-4 border-emerald-500 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-emerald-200">
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
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      ) : (
        <X className="h-4 w-4 text-slate-500" />
      )}
      <span className={met ? "text-emerald-400" : "text-slate-500"}>
        {text}
      </span>
    </div>
  );
}
