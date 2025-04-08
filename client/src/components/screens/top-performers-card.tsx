"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { UserRole } from "@/lib/constants";
import axios from "axios";
import { useSelector } from "@/redux/store";
import { Skeleton } from "../ui/skeleton";
import { User } from "lucide-react";
import { Badge } from "../ui/badge";

// Define the top performer model matching the backend structure
interface TopPerformerUser {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
}

interface TopPerformer {
  id: string;
  user: TopPerformerUser;
  settledTransactions: number;
  operatorName: string;
  type: string;
}

interface TopPerformersCardProps {
  siteId: string;
  className?: string;
  limit?: number;
}

const TopPerformersCard = ({
  siteId,
  className,
  limit = 5,
}: TopPerformersCardProps) => {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth = useSelector((state) => state.authReducer);
  const role = auth.role;

  // Determine the role text based on the current user's role
  const getSubordinateRoleText = () => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "Operator";
      case UserRole.OPERATOR:
        return "Platinum";
      case UserRole.PLATINUM:
        return "Gold";
      default:
        return "Agent";
    }
  };

  useEffect(() => {
    const fetchTopPerformers = async () => {
      if (!siteId) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `/api/v1/top-performers?siteId=${siteId}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          }
        );

        if (response.data?.data) {
          setTopPerformers(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch top performers:", err);
        setError("Failed to load top performers");
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, [siteId, limit, auth.token]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">
          Top {getSubordinateRoleText()} Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </>
        ) : error ? (
          <div className="text-center py-4 text-red-500">{error}</div>
        ) : topPerformers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No performers found
          </div>
        ) : (
          <div className="space-y-5">
            {topPerformers.map((performer) => (
              <div key={performer.id} className="flex items-center">
                <div className="mr-3 bg-muted h-10 w-10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="font-medium">
                    {performer.operatorName || performer.user.username}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="text-xs font-normal rounded-sm"
                    >
                      {performer.settledTransactions} transactions
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopPerformersCard;
