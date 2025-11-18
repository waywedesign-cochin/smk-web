"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAppDispatch } from "@/lib/hooks";
import { signInSchema } from "@/lib/validation/signinSchema";
import { login } from "@/redux/features/user/userSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function SignInForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsed = signInSchema.safeParse(formData);
    if (!parsed.success) {
      const { fieldErrors } = parsed.error.flatten();
      const newErrors: Record<string, string> = {};
      (Object.keys(fieldErrors) as (keyof typeof fieldErrors)[]).forEach(
        (key) => {
          const messages = fieldErrors[key];
          if (messages && messages.length > 0) newErrors[key] = messages[0];
        }
      );
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(login(parsed.data)).unwrap();
      router.push("/");
      setFormData({ email: "", password: "" });
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials or server error");
    } finally {
      setIsLoading(false);
    }
  };

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

        {/* SignIn Card */}
        <Card className="border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-black/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-slate-100">Sign In</CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              Enter your credentials to continue
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
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
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password}</p>
                )}

                {/* Forgot Password Link */}
                <div className="text-right mt-1">
                  <Button
                    variant="link"
                    className="text-sm text-blue-400 hover:text-blue-300 p-0 cursor-pointer h-auto font-normal"
                    type="button"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Forgot password?
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all relative overflow-hidden group"
                disabled={isLoading}
              >
                <span className="relative z-10">
                  {isLoading ? "Signing In..." : "Sign In"}
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
                onClick={() => router.push("/signup")}
                variant="link"
                className="text-sm cursor-pointer text-slate-400 hover:text-blue-400 transition-colors"
                disabled={isLoading}
              >
                Don&apos;t have an account?{" "}
                <span className="text-blue-400  font-semibold">Sign up</span>
              </Button>
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

export default SignInForm;
