"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, KeyRound, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { forgotPasswordSchema } from "@/lib/validation/userSchema";
import axios, { AxiosError } from "axios";
import { BASE_URL } from "@/redux/baseUrl";
import { useRouter } from "next/navigation";

interface ForgotPasswordForm {
  email: string;
}

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<keyof ForgotPasswordForm, string>>
  >({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validate using Zod
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof ForgotPasswordForm;
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Please enter a valid email.");
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/user/forgot-password`,
        { email }
      );

      toast.success("If this email is registered, a reset link has been sent.");
      setEmail("");
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to send reset link. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

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
            <KeyRound className="h-8 w-8 text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-4xl pb-1 font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400 bg-clip-text text-transparent mb-2">
              Forgot Password
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your email to receive a reset link
            </p>
          </div>
        </div>

        {/* Forgot Password Card */}
        <Card className="border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-black/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-slate-100">
              Reset Password
            </CardTitle>
            <p className="text-sm text-slate-400 mt-1">
              We&apos;ll send you instructions to reset your password
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-slate-200 text-sm font-medium"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({});
                    }}
                    disabled={loading}
                    className="pl-11 bg-slate-950/50 border-slate-800 focus:border-emerald-500 focus:ring-emerald-500/20 text-slate-100 placeholder:text-slate-600 h-12 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all relative overflow-hidden group"
                disabled={loading}
              >
                <span className="relative z-10">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
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
                <span className="px-2 bg-slate-900/40 text-slate-500">or</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                onClick={() => router.push("/signin")}
                variant="link"
                className="text-sm cursor-pointer text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
                disabled={loading}
              >
                <ArrowLeft className="h-3 w-3" />
                Back to{" "}
                <span className="text-emerald-400 ml-1 font-semibold">
                  Sign in
                </span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-slate-800/50 bg-slate-900/40 backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 text-slate-400 text-sm">
              <Mail className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-300 font-medium mb-1">
                  Check your email
                </p>
                <p className="text-xs leading-relaxed">
                  If an account exists with this email, you&apos;ll receive
                  password reset instructions. The link will expire in 1 hour.
                </p>
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
