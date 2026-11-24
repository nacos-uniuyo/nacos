"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, ExternalLink, FolderPlus } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, projectCategoryLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

const filters = [
  { key: "all", label: "All" },
  { key: "submitted", label: "Under Review" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Changes Requested" },
  { key: "draft", label: "Drafts" },
] as const;

type FilterKey = (typeof filters)[number]["key"];

export default function MyProjectsPage() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const activeFilter = filters.find((item) => item.key === filter) ?? filters[0];

  const { data: projects, isLoading, error } = trpc.project.mySubmissions.useQuery(
    filter === "all" ? undefined : { status: filter },
  );

  return (
    <div className="space-y-6">
      <DashboardHeader
        breadcrumbs={[{ label: "Projects" }]}
        title="My Projects"
        description="Track the review status of your coursework and showcase submissions."
        action={
          <Button asChild size="sm">
            <Link href="/dashboard/projects/submit">
              <FolderPlus />
              Submit Project
            </Link>
          </Button>
        }
      />

      <Tabs
        value={filter}
        onValueChange={(value) => {
          const next = filters.find((item) => item.key === value);
          if (next) setFilter(next.key);
        }}
      >
        <div className="overflow-x-auto">
          <TabsList>
            {filters.map((item) => (
              <TabsTrigger key={item.key} value={item.key}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>

      {isLoading ? (
        <ListSkeleton />
      ) : error ? (
        <ErrorState title="Could not load your projects" message={error.message} />
      ) : !projects?.length ? (
        <EmptyState
          title={filter === "all" ? "No projects yet" : `Nothing in ${activeFilter.label.toLowerCase()}`}
          description="Send in coursework or something you built on your own. Your department coordinator reviews it before it goes on the public showcase."
          action={
            <Button asChild size="sm">
              <Link href="/dashboard/projects/submit">Submit a project</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {projects.map((proj) => (
            <Card key={proj.id}>
              <CardContent className="space-y-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={proj.status} />
                      <span className="text-xs text-muted-foreground">
                        {proj.departmentName ?? "Faculty"} · {projectCategoryLabels[proj.category]}
                      </span>
                    </div>
                    <h2 className="mt-2 text-lg font-semibold">{proj.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{proj.tagline}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Submitted {formatDate(proj.createdAt)}
                    </p>
                  </div>
                  {proj.status === "approved" ? (
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/projects/${proj.slug}`} target="_blank">
                        <ExternalLink />
                        View live
                      </Link>
                    </Button>
                  ) : null}
                </div>
                {proj.status === "rejected" && proj.rejectionReason ? (
                  <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>Coordinator feedback</AlertTitle>
                    <AlertDescription>{proj.rejectionReason}</AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
