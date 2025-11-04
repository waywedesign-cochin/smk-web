"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordForm, string>>
  >({});
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <Input
                type="password"
                placeholder="New Password"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setErrors((prev) => ({ ...prev, password: "" }));
                }}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={form.confirm}
                onChange={(e) => {
                  setForm({ ...form, confirm: e.target.value });
                  setErrors((prev) => ({ ...prev, confirm: "" }));
                }}
                disabled={loading}
              />
              {errors.confirm && (
                <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
