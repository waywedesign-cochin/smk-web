"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { resetPasswordSchema } from "@/lib/validation/userSchema";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "@/redux/baseUrl";

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [form, setForm] = useState<ResetPasswordForm>({
    password: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordForm, string>>
  >({});
  const [loading, setLoading] = useState(false);

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
    // ✅ Validate using Zod
    const parsed = resetPasswordSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ResetPasswordForm;
        fieldErrors[fieldName] = issue.message;
      });

      setErrors(fieldErrors);
      return;
    }

    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }
    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/api/user/reset-password`, {
        token,
        newPassword: form.password,
      });

      if (res.status === 200) {
        toast.success("Password reset successful. Please sign in again.");
        router.push("/signin");
      } else {
        toast.error(res.data?.message || "Password reset failed.");
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message?: string }>;
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(form.password);
  const strengthInfo = getPasswordStrengthText(passwordStrength);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98120_1px,transparent_1px),linear-gradient(to_bottom,#10b98120_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <ShieldCheck className="h-8 w-8 text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent mb-2">
              Reset Password
            </h1>
            <p className="text-slate-400 text-sm">
              Create a new secure password for your account
            </p>
          </div>
        </div>

        {/* Reset Password Card */}
        <Card className="border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-black/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-slate-100">
              New Password
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Choose a strong password to secure your account
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-200 text-sm font-medium"
                >
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={form.password}
                    onChange={(e) => {
                      setForm({ ...form, password: e.target.value });
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    disabled={loading}
                    className="pl-11 pr-12 bg-slate-950/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-100 placeholder:text-slate-600 h-12 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-800/50 text-slate-500 hover:text-emerald-400 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.password && (
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
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirm"
                  className="text-slate-200 text-sm font-medium"
                >
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <Input
                    id="confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={form.confirm}
                    onChange={(e) => {
                      setForm({ ...form, confirm: e.target.value });
                      setErrors((prev) => ({ ...prev, confirm: "" }));
                    }}
                    disabled={loading}
                    className="pl-11 pr-12 bg-slate-950/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-100 placeholder:text-slate-600 h-12 transition-all"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-800/50 text-slate-500 hover:text-emerald-400 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {form.confirm && form.password === form.confirm && (
                  <div className="flex items-center space-x-2 text-green-400 mt-2">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Passwords match</span>
                  </div>
                )}
                {errors.confirm && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirm}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all relative overflow-hidden group"
                disabled={loading}
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Resetting...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </form>

            <div className="mt-6 text-center relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-900/40 text-slate-500">
                  secure reset
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={() => router.push("/signin")}
                variant="link"
                className="text-sm cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors"
                disabled={loading}
              >
                Remember your password?{" "}
                <span className="text-emerald-400 ml-1 font-semibold">
                  Sign in
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Info Card */}
        <Card className="border-slate-800/50 bg-slate-900/40 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-slate-400 text-sm">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-300 font-medium mb-1">
                  Password Requirements
                </p>
                <ul className="text-xs leading-relaxed space-y-1">
                  <li>• At least 6 characters long</li>
                  <li>• Mix of uppercase and lowercase letters</li>
                  <li>• Include numbers and special characters</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-gray-400 flex items-center justify-center gap-2">
          <TrendingUp className="h-3 w-3" />
          <p>© {new Date().getFullYear()} SK & SL Associate Private Limited</p>
        </div>
      </div>
    </div>
  );
}
