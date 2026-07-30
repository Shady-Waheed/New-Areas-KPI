import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { sendPasswordReset } from "../services/authService";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await sendPasswordReset(data.email);
      toast.success(
        "Password reset email sent. Please check your inbox or spam folder.",
      );
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(
        error?.code?.includes("user-not-found")
          ? "لا يوجد حساب مسجل بهذا البريد. تأكد من الإيميل وأعد المحاولة."
          : "فشل إرسال بريد إعادة التعيين. تأكد من إعدادات Firebase وحاول مجدداً.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="auth-card-wrap">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Forgot Password
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Enter your email and we will send you a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          register={register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
          })}
        />
        <Button type="submit" className="w-full" loading={loading}>
          Send reset link
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Remembered your password?{" "}
        <Link
          to="/login"
          className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
