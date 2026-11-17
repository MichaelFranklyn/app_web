"use client";

import { FeatureGate } from "@/components/FeatureGate";
import { useState } from "react";
import {
  EditSellerDataModal,
  EnableSellerCard,
  EnableSellerModal,
  FixedSchedulesSection,
  PersonalDataCard,
  ProfileSection,
  RoutineSection,
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
    <div className="flex flex-col gap-24">
      {seller && <SellerKpis seller={seller} />}

      <ProfileSection
        title="Dados e acesso"
        description="Contato, endereço e o que esta pessoa pode fazer no sistema."
      >
        <PersonalDataCard user={user} onEdit={() => setEditPersonOpen(true)} />
        <SystemAccessCard user={user} />
      </ProfileSection>

      <ProfileSection
        title="Trabalho em campo"
        description="A região que esta pessoa atende e como o sistema monta a agenda de visitas dela."
        columns={1}
      >
        {seller ? (
          <SellerDataCard
            seller={seller}
            onEdit={() => setEditSellerOpen(true)}
          />
        ) : (
          <EnableSellerCard onEnable={() => setEnableSellerOpen(true)} />
        )}

        {/* Configuração de rotina e rotas fixas alimentam o motor de
            visita: sem o recurso no plano, não há rotina para configurar. */}
        <FeatureGate feature="ROUTINES">
          {seller && <RoutineSection seller={seller} onRefetch={onRefetch} />}
          {seller && <FixedSchedulesSection sellerId={seller.id} />}
        </FeatureGate>
      </ProfileSection>

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
