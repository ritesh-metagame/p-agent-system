import KYCVerification from "@/components/tables/common/kyc-verification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import React from "react";

type Props = {};

export default async function VerifyKycPage({}: Props) {
  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-r flex items-center justify-center">
      <div className="shadow-md p-8 border bg-white rounded-lg w-full md:w-1/2">
        {/* <DialogHeader> */}
        <h1 className="font-bold text-2xl mb-6">Approve Agents</h1>
        {/* </DialogHeader> */}
        <div>
          <p>No agents found for approval</p>
        </div>
        {/* <Dialog open={true}>
          <DialogContent>
          </DialogContent>
        </Dialog> */}
      </div>
    </div>
  );
}
