// import React from "react";

// import {
//   goldcommissionPerCutoffColumns,
//   goldpartnerCommissionColumns,
// } from "../../../components/tables/gold/commission-release/commission-per-cutoff-columns";

// import type {
//   GoldCommissionPerCutoffData,
//   GoldPartnerCommissionData,
// } from "../../../components/tables/gold/commission-release/commission-per-cutoff-columns";

// import { TypographyH2 } from "@/components/ui/typographyh2";

// import { DataTable } from "@/components/tables/data-table";
// import Data from "./gold.json";

// //

// type Props = {};

// // Dummy data for GoldCommissionRecentCutoffData
// const goldCommissionPerCutoffData: GoldCommissionPerCutoffData[] = [];

// const goldPartnerCommissionData: GoldPartnerCommissionData[] = [];

// export default function PlatinumRecentCutoff({}: Props) {
//   return (
//     <div>
//       <div className="container mb-10">
//         <div className="mb-10">
//           <TypographyH2 className="mb-4">Network Commission</TypographyH2>

//           <DataTable
//             columns={goldcommissionPerCutoffColumns}
//             data={goldCommissionPerCutoffData}
//             // columnWidths={[
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             // ]}
//           />
//         </div>

//         <div className="mb-10">
//           <TypographyH2 className="mb-4">Network Commission</TypographyH2>

//           <DataTable
//             columns={goldpartnerCommissionColumns}
//             data={goldPartnerCommissionData}
//             // columnWidths={[
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             // ]}
//           />
//         </div>

//         <div className="mb-10">
//           <TypographyH2 className="mb-4">Network Commission</TypographyH2>

//           <DataTable
//             columns={goldcommissionRecentCutoffColumns}
//             data={goldCommissionRecentCutoffData}
//             // columnWidths={[
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             //   "250px",
//             // ]}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }
