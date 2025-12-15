"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowUpRight } from "lucide-react";
import { getMemberLimit } from "@/lib/utils/permissions";

interface PlanUsageCardProps {
  planType?: string;
  teamMemberCount: number;
  pendingInvitationCount: number;
}

export function PlanUsageCard({
  planType = "free",
  teamMemberCount,
  pendingInvitationCount,
}: PlanUsageCardProps) {
  const memberLimit = getMemberLimit(planType);
  const totalMembers = teamMemberCount + pendingInvitationCount;
  const memberPercentage =
    memberLimit === Infinity ? 0 : (totalMembers / memberLimit) * 100;
  const isNearLimit = memberPercentage >= 80;
  const isAtLimit = totalMembers >= memberLimit;

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-slate-100 text-slate-900";
      case "starter":
        return "bg-blue-100 text-blue-900";
      case "pro":
        return "bg-purple-100 text-purple-900";
      case "enterprise":
        return "bg-orange-100 text-orange-900";
      default:
        return "bg-slate-100 text-slate-900";
    }
  };

  const formatPlanName = (plan: string) => {
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Plan & Usage</span>
          <Badge className={getPlanBadgeColor(planType)}>
            <Zap className="w-3 h-3 mr-1" />
            {formatPlanName(planType)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your plan and monitor usage limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Team Members Usage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Team Members</label>
            <span className="text-sm font-semibold text-slate-900">
              {totalMembers}{" "}
              {memberLimit === Infinity ? "" : `/ ${memberLimit}`}
            </span>
          </div>
          <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isAtLimit
                  ? "bg-red-500"
                  : isNearLimit
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{
                width:
                  memberLimit === Infinity
                    ? "0%"
                    : `${Math.min(memberPercentage, 100)}%`,
              }}
            />
          </div>
          {teamMemberCount > 0 && (
            <p className="text-xs text-slate-600">
              {teamMemberCount} active{" "}
              {teamMemberCount === 1 ? "member" : "members"}
              {pendingInvitationCount > 0 &&
                ` + ${pendingInvitationCount} pending`}
            </p>
          )}
          {isAtLimit && (
            <p className="text-xs text-red-600 font-medium">
              You've reached your team member limit. Upgrade to add more
              members.
            </p>
          )}
        </div>

        {/* Plan Features */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-3">Plan Features</h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">
                {memberLimit === Infinity ? "Unlimited" : memberLimit} team
                members
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">
                Shopify integration
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span className="text-sm text-slate-600">Component builder</span>
            </li>
            {(planType === "pro" || planType === "enterprise") && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="text-sm text-slate-600">
                    Priority support
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span className="text-sm text-slate-600">
                    Custom integrations
                  </span>
                </li>
              </>
            )}
            {planType === "enterprise" && (
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-sm text-slate-600">
                  Dedicated account manager
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Upgrade Button */}
        {planType !== "enterprise" && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
            disabled
          >
            <ArrowUpRight className="w-4 h-4" />
            Upgrade Plan
            <span className="text-xs opacity-75">(Coming soon)</span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
