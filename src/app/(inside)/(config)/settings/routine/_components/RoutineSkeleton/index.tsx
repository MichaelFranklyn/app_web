import { Card } from "@/components/Card";
import { Grid } from "@/components/Grid";
import { Loading } from "@/components/Loading";

const WEEKDAY_COUNT = 7;
const WEIGHT_ROW_COUNT = 5;

function ActionBarSkeleton() {
  return (
    <div className="flex items-start justify-between gap-16">
      <div className="flex flex-col gap-3">
        <Loading.Skeleton className="h-5 w-64" />
        <Loading.Skeleton className="h-4 w-80" />
      </div>
      <Loading.Skeleton className="h-9 w-44" />
    </div>
  );
}

function InputSkeleton({ width = "w-full" }: { width?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <Loading.Skeleton className="h-3 w-32" />
      <Loading.Skeleton className={`h-9 ${width}`} />
    </div>
  );
}

function WorkingParametersSkeleton() {
  return (
    <Card.Root>
      <Card.Header>
        <Loading.Skeleton className="h-4 w-44" />
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-12">
          <InputSkeleton />
          <InputSkeleton />
          <div className="grid grid-cols-2 gap-10">
            <InputSkeleton />
            <InputSkeleton />
          </div>
          <div className="flex flex-col gap-5">
            <Loading.Skeleton className="h-3 w-24" />
            <div className="flex gap-6">
              {Array.from({ length: WEEKDAY_COUNT }).map((_, i) => (
                <Loading.Skeleton key={i} className="h-8 w-10" />
              ))}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card.Root>
  );
}

function SchedulingPreferencesSkeleton() {
  return (
    <Card.Root>
      <Card.Header>
        <Loading.Skeleton className="h-4 w-56" />
      </Card.Header>
      <Card.Body padding="compact">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-(--border) py-10 last:border-b-0"
          >
            <Loading.Skeleton className="h-4 w-64" />
            <Loading.Skeleton className="h-9 w-20" />
          </div>
        ))}
      </Card.Body>
    </Card.Root>
  );
}

function ScoreWeightsSkeleton() {
  return (
    <Card.Root>
      <Card.Header>
        <Loading.Skeleton className="h-4 w-48" />
        <Loading.Skeleton className="h-6 w-24 rounded-full" />
      </Card.Header>
      <Card.Body>
        <div className="flex flex-col gap-12">
          {Array.from({ length: WEIGHT_ROW_COUNT }).map((_, i) => (
            <div key={i} className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <Loading.Skeleton className="h-4 w-40" />
                <div className="flex items-center gap-8">
                  <Loading.Skeleton className="h-9 w-16" />
                  <Loading.Skeleton className="h-4 w-10" />
                </div>
              </div>
              <Loading.Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </Card.Body>
    </Card.Root>
  );
}

export function RoutineSkeleton() {
  return (
    <div className="flex flex-col gap-20">
      <ActionBarSkeleton />
      <Loading.Skeleton className="h-16 w-full" />
      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        <WorkingParametersSkeleton />
        <SchedulingPreferencesSkeleton />
      </Grid.Root>
      <ScoreWeightsSkeleton />
    </div>
  );
}
