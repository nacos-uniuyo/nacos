"use client";

import Link from "next/link";
import { ArrowRight, History, MessageSquareQuote, Quote, Users } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc/client";

const upcomingTools = [
  {
    title: "Goodwill messages",
    description: "Curate and reorder the goodwill messages shown on the homepage.",
    icon: Quote,
  },
  {
    title: "Users and roles",
    description: "Make members department editors or faculty admins.",
    icon: Users,
  },
  {
    title: "Audit log",
    description: "See who changed what across the portal, and when.",
    icon: History,
  },
];

export default function ControlCenterPage() {
  const { data: deansMessage, isLoading, error } = trpc.setting.deansMessage.useQuery();

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Control Center"
        description="Manage the faculty-wide content of the portal."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-2xl shadow-2xs md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MessageSquareQuote className="size-4 text-primary" />
              Dean&apos;s message
            </CardTitle>
            <CardDescription>The welcome note shown on the homepage, right after the hero.</CardDescription>
            <CardAction>
              <Button asChild size="sm" className="h-9 rounded-xl px-4 text-xs">
                <Link href="/dashboard/admin/deans-message">
                  Edit message
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {isLoading ? (
              <div className="flex flex-col gap-2" aria-busy="true" aria-label="Loading">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">{error.message}</p>
            ) : deansMessage ? (
              <>
                <p className="text-sm font-medium text-foreground">{deansMessage.heading}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {deansMessage.body.split(/\n\s*\n/)[0]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {deansMessage.authorName}, {deansMessage.authorTitle}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No message yet. The homepage hides this section until one is saved.
              </p>
            )}
          </CardContent>
        </Card>

        {upcomingTools.map((tool) => (
          <Card key={tool.title} className="rounded-2xl shadow-2xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <tool.icon className="size-4" />
                {tool.title}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
              <CardAction>
                <Badge variant="secondary" className="rounded-full text-[11px]">
                  Coming soon
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
