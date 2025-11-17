"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Eye,
  EyeOff,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Lock,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { signUpSchema } from "@/lib/validation/signupSchema";
import { useAppDispatch } from "@/lib/hooks";
import { signUp } from "@/redux/features/user/userSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function SignUpForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/\d/)) strength++;
    if (password.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    switch (strength) {
      case 0:
      case 1:
        return { text: "Weak", color: "text-red-400" };
      case 2:
        return { text: "Fair", color: "text-yellow-400" };
      case 3:
        return { text: "Good", color: "text-blue-400" };
      case 4:
        return { text: "Strong", color: "text-green-400" };
      default:
        return { text: "Weak", color: "text-red-400" };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Zod validation
    const parsed = signUpSchema.safeParse(formData);

    if (!parsed.success) {
      // Flatten returns { formErrors: string[], fieldErrors: Record<string, string[]> }
      const { fieldErrors } = parsed.error.flatten();

      const newErrors: Record<string, string> = {};

      // fieldErrors is Record<string, string[] | undefined>
      (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).forEach(
        (key) => {
          const messages = fieldErrors[key];
          if (messages && messages.length > 0) {
            newErrors[key] = messages[0]; // first error message
          }
        }
      );

      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await dispatch(signUp(parsed.data)).unwrap();
      router.push("/signin");
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f620_1px,transparent_1px),linear-gradient(to_bottom,#3b82f620_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-sky-400/40 relative">
            <Image
              src="/Stock-market-kerala-1-1.png"
              alt="logo"
              width={55}
              height={55}
              className="object-contain p-1"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-1">
              Welcome Back
            </h1>
            <p className="text-slate-400 text-sm tracking-wide">
              SK & SL Associate Private Limited
            </p>
          </div>
        </div>

        {/* SignUp Card */}
        <Card className="border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-black/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-slate-100">Sign Up</CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Fill in your details to get started
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1">
                {/* Username */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-slate-200 text-sm font-medium"
                  >
                    Username
                  </Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      placeholder="johndoe"
                      disabled={isLoading}
                      className="pl-11 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-600 h-12 transition-all"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-red-400">{errors.username}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-200 text-sm font-medium"
                >
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className="pl-11 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-600 h-12 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-200 text-sm font-medium"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pl-11 pr-12 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-600 h-12 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-800/50 text-slate-500 hover:text-blue-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.password && (
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex-1 bg-slate-800/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength === 1
                            ? "w-1/4 bg-red-500"
                            : passwordStrength === 2
                            ? "w-2/4 bg-yellow-500"
                            : passwordStrength === 3
                            ? "w-3/4 bg-blue-500"
                            : passwordStrength === 4
                            ? "w-full bg-green-500"
                            : "w-0"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${strengthInfo.color}`}
                    >
                      {strengthInfo.text}
                    </span>
                  </div>
                )}
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-slate-200 text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="pl-11 pr-12 bg-slate-950/50 border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 text-slate-100 placeholder:text-slate-600 h-12 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-800/50 text-slate-500 hover:text-blue-400 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {formData.confirmPassword &&
                  formData.password === formData.confirmPassword && (
                    <div className="flex items-center space-x-2 text-green-400 mt-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Passwords match
                      </span>
                    </div>
                  )}
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all relative overflow-hidden group"
                disabled={isLoading}
              >
                <span className="relative z-10">
                  {isLoading ? "Creating Account..." : "Create Account"}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </form>

            <div className="mt-6 text-center relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-900/40 text-slate-500">or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={() => router.push("/signin")}
                variant="link"
                className="text-sm cursor-pointer text-slate-400 hover:text-blue-400 transition-colors"
                disabled={isLoading}
              >
                Already have an account?{" "}
                <span className="text-blue-400 ml-1 font-semibold">
                  Sign in
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        {/* <Card className="border-slate-800/50 bg-slate-900/40 backdrop-blur-xl">
          <CardContent className="pt-6">
            <Alert className="bg-blue-500/10 border-blue-500/20">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-slate-300">
                New accounts require approval from an administrator before
                access.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card> */}

        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <TrendingUp className="h-3 w-3" />
          <p>© {new Date().getFullYear()} SK & SL Associate Private Limited</p>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;
