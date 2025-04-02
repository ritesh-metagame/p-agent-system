import CreateAccountForm from "@/components/create-account-form";
import React from "react";

type Props = {};

export default async function CreateOperatorAccount({}: Props) {
  const response = await fetch("");
  const responseJson = await response.json();
  return (
    <div>
      <CreateAccountForm />
    </div>
  );
}
