import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

type Props = {};

export default function Loading({}: Props) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Skeleton className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Skeleton className="aspect-video rounded-xl bg-muted/50" />
        <Skeleton className="aspect-video rounded-xl bg-muted/50" />
        <Skeleton className="aspect-video rounded-xl bg-muted/50" />
      </Skeleton>
      <Skeleton className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
    </div>
  );
}
