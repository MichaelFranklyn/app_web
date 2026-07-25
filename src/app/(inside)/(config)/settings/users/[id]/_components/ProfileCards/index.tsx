"use client";

import { Grid } from "@/components/Grid";
import { useState } from "react";
import {
  EditSellerDataModal,
  EnableSellerCard,
  EnableSellerModal,
  PersonalDataCard,
  SellerDataCard,
  SellerKpis,
  SystemAccessCard,
  UserDetail,
} from "../../../../../_shared/userProfile";
import { EditPersonDataModal } from "../EditPersonDataModal";

interface Props {
  user: UserDetail;
  onRefetch: () => void;
}

/**
 * Cadastro da pessoa na visão do gestor: os mesmos cards que ela vê em
 * /settings/user/[id]. Ele edita pelas mutations de gestão (`updateUser` e
 * `updateSeller`); ela, pelas do dono (`updateMyProfile`).
 */
export function ProfileCards({ user, onRefetch }: Props) {
  const [editPersonOpen, setEditPersonOpen] = useState(false);
  const [editSellerOpen, setEditSellerOpen] = useState(false);
  const [enableSellerOpen, setEnableSellerOpen] = useState(false);
  const seller = user.seller;

  return (
    <div className="flex flex-col gap-16">
      {seller && <SellerKpis seller={seller} />}

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        <PersonalDataCard user={user} onEdit={() => setEditPersonOpen(true)} />
        <SystemAccessCard user={user} />

        {seller ? (
          <SellerDataCard
            seller={seller}
            onEdit={() => setEditSellerOpen(true)}
          />
        ) : (
          <EnableSellerCard onEnable={() => setEnableSellerOpen(true)} />
        )}
      </Grid.Root>

      <EditPersonDataModal
        user={user}
        open={editPersonOpen}
        onOpenChange={setEditPersonOpen}
        onDone={onRefetch}
      />

      {seller ? (
        <EditSellerDataModal
          seller={seller}
          open={editSellerOpen}
          onOpenChange={setEditSellerOpen}
          onDone={onRefetch}
        />
      ) : (
        <EnableSellerModal
          user={user}
          open={enableSellerOpen}
          onOpenChange={setEnableSellerOpen}
          onDone={onRefetch}
        />
      )}
    </div>
  );
}
