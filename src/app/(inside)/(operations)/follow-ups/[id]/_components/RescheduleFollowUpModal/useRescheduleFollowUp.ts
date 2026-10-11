"use client";

import { RESCHEDULE_FOLLOW_UP_MUTATION } from "@/graphql/followUps";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { FOLLOW_UP_CACHE_FIELDS } from "@/utils/cacheFields";
import { getBrtTodayIso } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

import { RescheduleFollowUpResponse } from "../../interface";
import { isSchedulable } from "../../utils";

interface Params {
  followUpId: string;
  currentDate: string;
  onDone: () => void;
}

/** Mudar de dia. O backend guarda o de-para; o porquê é opcional. */
export function useRescheduleFollowUp({
  followUpId,
  currentDate,
  onDone,
}: Params) {
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("");

  const [reschedule] = useMutation<RescheduleFollowUpResponse>(
    RESCHEDULE_FOLLOW_UP_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();
  const invalidateClient = useInvalidateQueriesClient();

  const isValid =
    isSchedulable(dueDate, getBrtTodayIso()) && dueDate !== currentDate;

  const submit = () =>
    execute(
      async () => {
        const res = await reschedule({
          variables: {
            input: { id: followUpId, dueDate, note: note.trim() || null },
          },
        });
        const payload = res.data?.rescheduleClientFollowUp;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao reagendar o contato");
        }
        return payload;
      },
      {
        successMessage: "Contato reagendado",
        onSuccess: () => {
          setDueDate("");
          setNote("");
          onDone();
          void invalidateClient(FOLLOW_UP_CACHE_FIELDS);
        },
      }
    );

  return { dueDate, setDueDate, note, setNote, isValid, isLoading, submit };
}
