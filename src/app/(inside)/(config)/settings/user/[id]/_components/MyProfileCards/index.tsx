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
import { ChangePasswordModal } from "../ChangePasswordModal";
import { EditMyProfileModal } from "../EditMyProfileModal";
import { PasswordCard } from "../PasswordCard";

interface Props {
  user: UserDetail;
  /**
   * Gestor (owner/admin) abrindo o próprio perfil: só ele pode habilitar o
   * próprio perfil de vendedor, porque `createSeller` é mutation de gestor. É o
   * caso do proprietário que também vende.
   */
  canEnableSeller: boolean;
  onRefetch: () => void;
}

/**
 * Cadastro do próprio usuário: os MESMOS cards que o gestor vê em /settings/users/[id],
 * com a ação de editar no cabeçalho de cada um.
 */
export function MyProfileCards({ user, canEnableSeller, onRefetch }: Props) {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editSellerOpen, setEditSellerOpen] = useState(false);
  const [enableSellerOpen, setEnableSellerOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const seller = user.seller;

  return (
    <div className="flex flex-col gap-16">
      {seller && <SellerKpis seller={seller} />}

      <Grid.Root cols={{ base: 1, desktop: 2 }} gap={16}>
        <PersonalDataCard
          user={user}
          isSelf
          onEdit={() => setEditProfileOpen(true)}
          dataTour="profile-info"
        />

        <SystemAccessCard user={user} isSelf />

        {seller ? (
          <SellerDataCard
            seller={seller}
            isSelf
            onEdit={() => setEditSellerOpen(true)}
          />
        ) : (
          canEnableSeller && (
            <EnableSellerCard
              isSelf
              onEnable={() => setEnableSellerOpen(true)}
            />
          )
        )}

        <PasswordCard
          email={user.email}
          onChangePassword={() => setChangePasswordOpen(true)}
          dataTour="profile-password"
        />
      </Grid.Root>

      <EditMyProfileModal
        profile={user}
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
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
        canEnableSeller && (
          <EnableSellerModal
            user={user}
            isSelf
            open={enableSellerOpen}
            onOpenChange={setEnableSellerOpen}
            onDone={onRefetch}
          />
        )
      )}

      <ChangePasswordModal
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}
