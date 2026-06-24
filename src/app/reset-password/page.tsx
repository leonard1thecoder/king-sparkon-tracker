import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Reset Barcode Inventory Password",
  description:
    "Reset your King Sparkon Tracker password and restore secure access to barcode inventory, product tracking, claims, reports, and billing.",
};

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <AuthShell
      mode="reset"
      endpoint="/api/auth/reset-password"
      eyebrow="Choose new password"
      title="Create a fresh password"
      description="Use your reset code and set a new password that protects barcode inventory, product stock movement, claims, reports, and billing."
      submitLabel="Update password"
      footerText="Need another reset link?"
      footerHref="/forgot-password"
      footerLink="Request one"
      visualTitle="A secure path back into product operations."
      visualText="Set a fresh password and return to barcode stock tracking, worker scans, reports, audit logs, and billing."
      fields={[
        {
          name: "token",
          label: "Reset token",
          type: "text",
          placeholder: "Paste reset token",
          autoComplete: "one-time-code",
          icon: "key",
          defaultValue: token,
        },
        {
          name: "newPassword",
          label: "New password",
          type: "password",
          placeholder: "Create a new password",
          autoComplete: "new-password",
          icon: "lock",
        },
        {
          name: "confirmPassword",
          label: "Confirm password",
          type: "password",
          placeholder: "Repeat new password",
          autoComplete: "new-password",
          icon: "lock",
        },
      ]}
    />
  );
}
