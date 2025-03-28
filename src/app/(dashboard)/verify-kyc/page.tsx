import KYCVerification from "@/components/tables/common/kyc-verification";
import React from "react";

type Props = {};

export default function VerifyKycPage({}: Props) {
  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-r flex items-center justify-center">
      <div className="shadow-md p-8 border bg-white rounded-lg w-1/3">
        <KYCVerification />
      </div>
    </div>
  );
}
