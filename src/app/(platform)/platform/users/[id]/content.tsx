"use client";

import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { UserActivityCard } from "./_components/UserActivityCard";
import { UserProfileCard } from "./_components/UserProfileCard";
import { UserDetailContentProps } from "./interface";
import { useUserDetail } from "./useUserDetail";

export default function UserDetailContent(props: UserDetailContentProps) {
  const { user, userError, refetchUser, entries, total, activityLoading } =
    useUserDetail(props);

  if (userError && !user) {
    return (
      <PageContent>
        <QueryError onRetry={() => refetchUser()} />
      </PageContent>
    );
  }

  if (!user) {
    return (
      <PageContent>
        <Loading.Skeleton className="h-[80px] w-full" />
        <Loading.Skeleton className="h-[120px] w-full" />
        <Loading.Skeleton className="h-[200px] w-full" />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <UserProfileCard user={user} />
      <UserActivityCard
        entries={entries}
        total={total}
        loading={activityLoading}
      />
    </PageContent>
  );
}
