// import CreateAccountForm from "@/components/create-account-form";
// import React from "react";

// type Props = {};

// export default function OperatorCreatePlatinumAccount({}: Props) {
//   return (
//     <div>
//       <CreateAccountForm />

//       {/* <p>tesxt</p> */}
//     </div>
//   );
// }
import CreateAccountForm from "@/components/create-account-form";
import React from "react";

export default function OperatorCreatePlatinumAccount() {
  // Correct role and category options
  const roleOptions = ["Platinum", "Gold"];
  const categoryOptions = ["Sports Betting", "eGames", "Speciality Games"];

  return (
    <div>
      <CreateAccountForm
        roleOptions={roleOptions}
        categoryOptions={categoryOptions}
      />
    </div>
  );
}
