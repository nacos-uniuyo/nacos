"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { keepPreviousData } from "@tanstack/react-query";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight, GraduationCap, Loader2, Pencil, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/dashboard/DashboardStates";
import { PillTabs } from "@/components/dashboard/PillTabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardSession } from "@/lib/auth-client";
import { roleNames, type RoleName } from "@/lib/enums";
import { formatDate, roleLabels } from "@/lib/format";
import { trpc } from "@/lib/trpc/client";

const ROSTER_TABS = ["all", "assigned", "coordinators", "unassigned"] as const;

type RosterTab = (typeof ROSTER_TABS)[number];

interface RosterView {
  filter: RosterTab;
  department: string;
  page: number;
  search: string;
}

const DEFAULT_ROSTER_VIEW: RosterView = {
  filter: "all",
  department: "",
  page: 1,
  search: "",
};

function isRosterTab(value: string | null): value is RosterTab {
  return value !== null && (ROSTER_TABS as readonly string[]).includes(value);
}

function parseRosterView(search: string): RosterView {
  const params = new URLSearchParams(search);
  const filter = params.get("filter");
  const page = Number(params.get("page"));

  return {
    filter: isRosterTab(filter) ? filter : "all",
    department: params.get("department") ?? "",
    page: Number.isInteger(page) && page > 0 ? page : 1,
    search: params.get("search") ?? "",
  };
}

let cachedSearch: string | null = null;
let cachedView = DEFAULT_ROSTER_VIEW;

function readRosterView(): RosterView {
  const search = window.location.search;
  if (search !== cachedSearch) {
    cachedSearch = search;
    cachedView = parseRosterView(search);
  }
  return cachedView;
}

const rosterViewListeners = new Set<() => void>();

function subscribeRosterView(listener: () => void) {
  rosterViewListeners.add(listener);
  const onPopState = () => {
    cachedSearch = null;
    listener();
  };
  window.addEventListener("popstate", onPopState);

  return () => {
    rosterViewListeners.delete(listener);
    window.removeEventListener("popstate", onPopState);
  };
}

function writeRosterView(patch: Partial<RosterView>) {
  const current = readRosterView();
  const next = { ...current, ...patch };

  if (
    next.filter === current.filter &&
    next.department === current.department &&
    next.page === current.page &&
    next.search === current.search
  ) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  if (next.filter === "all") params.delete("filter");
  else params.set("filter", next.filter);
  if (next.department) params.set("department", next.department);
  else params.delete("department");
  if (next.page <= 1) params.delete("page");
  else params.set("page", String(next.page));
  if (next.search) params.set("search", next.search);
  else params.delete("search");

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;

  // Next patches history.replaceState to dispatch a router restore, which
  // re-renders the route. Calling the native method keeps the roster's URL
  // state out of the router while preserving Next's history state for
  // back/forward navigation.
  History.prototype.replaceState.call(window.history, window.history.state, "", url);

  cachedSearch = window.location.search;
  cachedView = next;
  rosterViewListeners.forEach((listener) => listener());
}

const NO_DEPARTMENT = "none";

const editMemberSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(128),
  regNumber: z.string().trim().max(32, "Max 32 characters."),
  departmentSlug: z.string(),
  role: z.enum(roleNames),
});

type EditMemberValues = z.output<typeof editMemberSchema>;

interface MemberRow {
  id: string;
  name: string;
  email: string;
  regNumber: string | null;
  role: RoleName;
  departmentSlug: string | null;
}

function EditMemberDialog({
  member,
  isAdmin,
  onOpenChange,
}: {
  member: MemberRow | null;
  isAdmin: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const utils = trpc.useUtils();
  const { data: departments } = trpc.department.list.useQuery();

  const form = useForm<EditMemberValues>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      name: "",
      regNumber: "",
      departmentSlug: NO_DEPARTMENT,
      role: "user",
    },
    values: member
      ? {
          name: member.name,
          regNumber: member.regNumber ?? "",
          departmentSlug: member.departmentSlug ?? NO_DEPARTMENT,
          role: member.role,
        }
      : undefined,
  });

  const updateMutation = trpc.coordinator.updateMember.useMutation({
    onSuccess: async () => {
      await utils.coordinator.getRoster.invalidate();
      await utils.coordinator.getDepartmentOverview.invalidate();
      toast.success("Member updated.");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Dialog open={member !== null} onOpenChange={(next) => !updateMutation.isPending && onOpenChange(next)}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base font-semibold">Edit Member</DialogTitle>
          <DialogDescription className="text-xs">
            {member?.email}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              if (!member) return;
              updateMutation.mutate({
                userId: member.id,
                name: values.name,
                regNumber: values.regNumber || null,
                departmentSlug: values.departmentSlug === NO_DEPARTMENT ? null : values.departmentSlug,
                role: isAdmin ? values.role : undefined,
              });
            })}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Full name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="regNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Registration number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 22/SC/CO/1199"
                      maxLength={32}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Department</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-9 w-full rounded-xl">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isAdmin ? <SelectItem value={NO_DEPARTMENT}>Unassigned</SelectItem> : null}
                      {departments?.map((dept) => (
                        <SelectItem key={dept.slug} value={dept.slug}>
                          {dept.name} ({dept.shortName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isAdmin ? (
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-9 w-full rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleNames.map((role) => (
                          <SelectItem key={role} value={role}>
                            {roleLabels[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={updateMutation.isPending}
                onClick={() => onOpenChange(false)}
                className="h-9 rounded-xl px-4 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="h-9 rounded-xl px-4 text-xs"
              >
                {updateMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : null}
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const TAB_HEADINGS: Record<RosterTab, string> = {
  all: "All Members",
  assigned: "With Department",
  coordinators: "Coordinators",
  unassigned: "Unassigned Users",
};

export default function CoordinatorRosterPage() {
  const view = useSyncExternalStore(
    subscribeRosterView,
    readRosterView,
    () => DEFAULT_ROSTER_VIEW,
  );
  const [searchInput, setSearchInput] = useState(view.search);
  const [editTarget, setEditTarget] = useState<MemberRow | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isAdmin } = useDashboardSession();
  const utils = trpc.useUtils();
  const { data: departments } = trpc.department.list.useQuery();

  useEffect(() => {
    setSearchInput(readRosterView().search);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      writeRosterView({ search: value.trim(), page: 1 });
    }, 350);
  }

  const { data, isLoading, error } = trpc.coordinator.getRoster.useQuery(
    {
      filter: view.filter,
      departmentFilter: view.department || undefined,
      search: view.search || undefined,
      page: view.page,
      limit: 25,
    },
    { placeholderData: keepPreviousData },
  );

  const members = data?.students ?? [];
  const total = data?.total ?? 0;
  const counts = data?.counts;
  const totalPages = data?.totalPages ?? 1;

  useEffect(() => {
    if (!data || view.page >= totalPages) return;
    void utils.coordinator.getRoster.prefetch({
      filter: view.filter,
      departmentFilter: view.department || undefined,
      search: view.search || undefined,
      page: view.page + 1,
      limit: 25,
    });
  }, [
    data,
    totalPages,
    utils,
    view.department,
    view.filter,
    view.page,
    view.search,
  ]);

  const tabs = [
    { value: "all" as const, label: "All", count: counts?.all },
    { value: "assigned" as const, label: "Department", count: counts?.assigned },
    { value: "coordinators" as const, label: "Coordinators", count: counts?.coordinators },
    { value: "unassigned" as const, label: "Unassigned", count: counts?.unassigned },
  ];

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        title="Roster"
        badge={
          data?.department.shortName && (!isAdmin || view.department) ? (
            <Badge variant="outline" className="rounded-full text-[11px] font-semibold">
              {data.department.shortName}
            </Badge>
          ) : null
        }
      />

      <PillTabs
        label="Filter roster"
        value={view.filter}
        onValueChange={(next) => writeRosterView({ filter: next, page: 1 })}
        onTabIntent={(next) => {
          if (next === view.filter) return;
          void utils.coordinator.getRoster.prefetch({
            filter: next,
            departmentFilter: view.department || undefined,
            search: view.search || undefined,
            page: 1,
            limit: 25,
          });
        }}
        tabs={tabs}
      />

      {isLoading ? (
        <ListSkeleton count={5} />
      ) : error ? (
        <ErrorState title="Failed to load student roster" message={error.message} />
      ) : (
        <Card className="overflow-hidden rounded-2xl py-0 shadow-2xs">
          <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">{TAB_HEADINGS[view.filter]}</h2>
              <p className="text-xs text-muted-foreground">
                {total} member{total !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              {isAdmin ? (
                <Select
                  value={view.department || "all"}
                  onValueChange={(value) =>
                    writeRosterView({
                      department: value === "all" ? "" : value,
                      page: 1,
                    })
                  }
                >
                  <SelectTrigger
                    aria-label="Filter by department"
                    className="h-9 w-full rounded-xl text-xs sm:w-52"
                  >
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.slug} value={dept.slug}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, reg no..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-9 rounded-xl bg-background pl-9 text-xs"
                />
              </div>
            </div>
          </div>

          {members.length === 0 ? (
            <div className="p-6">
              <EmptyState icon={<GraduationCap className="size-5" />} title="No members found" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="text-xs hover:bg-transparent">
                  <TableHead className="py-3.5 pl-5 font-medium">Member</TableHead>
                  <TableHead className="py-3.5 font-medium">Department</TableHead>
                  <TableHead className="py-3.5 font-medium">Reg. No.</TableHead>
                  <TableHead className="py-3.5 font-medium">Role</TableHead>
                  <TableHead className="py-3.5 font-medium">Joined</TableHead>
                  <TableHead className="py-3.5 pr-5 text-right font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((student) => {
                  const initials =
                    student.name
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase() ?? "")
                      .join("") || "U";
                  const roleLabel =
                    roleLabels[student.role as RoleName] ?? student.role.replace(/_/g, " ");

                  return (
                    <TableRow key={student.id} className="text-xs">
                      <TableCell className="py-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{student.name}</p>
                            <p className="truncate text-[11px] text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.departmentShortName ? (
                          <Badge variant="outline" className="rounded-full text-[11px] font-medium">
                            {student.departmentShortName}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.regNumber ? (
                          <span className="font-mono text-xs font-medium text-foreground">
                            {student.regNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full text-[11px] font-normal">
                          {roleLabel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.createdAt ? formatDate(student.createdAt) : "-"}
                      </TableCell>
                      <TableCell className="pr-5 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setEditTarget({
                              id: student.id,
                              name: student.name,
                              email: student.email,
                              regNumber: student.regNumber,
                              role: student.role as RoleName,
                              departmentSlug: student.departmentSlug,
                            })
                          }
                          className="h-8 rounded-xl px-2.5 text-xs"
                        >
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t px-5 py-3">
              <p className="text-xs text-muted-foreground">
                Page {view.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={view.page <= 1}
                  onClick={() => writeRosterView({ page: Math.max(1, view.page - 1) })}
                  className="h-8 rounded-xl px-3 text-xs"
                >
                  <ChevronLeft className="size-3.5" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={view.page >= totalPages}
                  onClick={() => writeRosterView({ page: view.page + 1 })}
                  className="h-8 rounded-xl px-3 text-xs"
                >
                  Next
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      )}

      <EditMemberDialog
        member={editTarget}
        isAdmin={isAdmin}
        onOpenChange={(open) => !open && setEditTarget(null)}
      />
    </div>
  );
}
