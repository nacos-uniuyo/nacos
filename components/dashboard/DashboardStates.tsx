import { AlertCircle, Inbox, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SPARKLE_POSITIONS = [
  "left-[8%] top-[14%] size-2",
  "right-0 top-[46%] size-2",
  "left-0 top-[68%] size-1.5",
  "left-[64%] top-[10%] size-1.5",
  "left-[82%] top-[78%] size-1.5",
] as const;

export function EmptyIllustration({ icon }: { icon?: React.ReactNode }) {
  return (
    <div className="relative h-20 w-24" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon ?? <Inbox className="size-6" />}
      </div>
      {SPARKLE_POSITIONS.map((pos) => (
        <Plus key={pos} className={`absolute text-primary/45 ${pos}`} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="rounded-2xl py-4 shadow-2xs">
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-xl" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="overflow-hidden rounded-2xl py-0 shadow-2xs">
          <Skeleton className="h-36 w-full rounded-none" />
          <CardContent className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ErrorState({ title, message }: { title: string; message: string }) {
  return (
    <Alert variant="destructive" className="rounded-2xl">
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  bordered = true,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  bordered?: boolean;
}) {
  return (
    <div
      className={
        bordered
          ? "flex flex-col items-center justify-center rounded-2xl border border-dashed bg-card/50 px-6 py-12 text-center"
          : "flex flex-col items-center justify-center px-4 py-8 text-center"
      }
    >
      <EmptyIllustration icon={icon} />
      <h2 className="mt-2 text-sm font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
