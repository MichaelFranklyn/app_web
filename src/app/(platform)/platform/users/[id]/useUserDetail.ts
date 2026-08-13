"use client";

import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { PLATFORM_USER_QUERY, USER_ACTIVITY_QUERY } from "./gql";
import {
  UserActivityQueryData,
  UserDetailContentProps,
  UserQueryData,
} from "./interface";
import { activityVariables } from "./utils";

export function useUserDetail({
  id,
  seedUser,
  seedActivity,
}: UserDetailContentProps) {
  useSeedQuery(
    [
      { query: PLATFORM_USER_QUERY, variables: { id }, data: seedUser },
      {
        query: USER_ACTIVITY_QUERY,
        variables: activityVariables(id),
        data: seedActivity,
      },
    ],
    id
  );

  const userQuery = useQuery<UserQueryData>(PLATFORM_USER_QUERY, {
    variables: { id },
  });
  const activityQuery = useQuery<UserActivityQueryData>(USER_ACTIVITY_QUERY, {
    variables: activityVariables(id),
  });

  return {
    user: userQuery.data?.platformUser?.data ?? null,
    userLoading: userQuery.loading,
    userError: userQuery.error,
    refetchUser: userQuery.refetch,

    entries: activityQuery.data?.user_activity?.edges?.map((e) => e.node) ?? [],
    total: activityQuery.data?.user_activity?.totalCount ?? 0,
    activityLoading: activityQuery.loading,
  };
}
