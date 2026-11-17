"use client";

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
import { EmailDigestCard } from "../EmailDigestCard";
import { PasswordCard } from "../PasswordCard";
import { ProfileSection } from "../ProfileSection";
import { PushNotificationsCard } from "../PushNotificationsCard";

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
    <div className="flex flex-col gap-24">
      {seller && <SellerKpis seller={seller} />}

      <ProfileSection
        title="Seus dados"
        description="Quem você é e como a empresa fala com você."
      >
        <PersonalDataCard
          user={user}
          isSelf
          onEdit={() => setEditProfileOpen(true)}
          dataTour="profile-info"
        />

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
      </ProfileSection>

      <ProfileSection
        title="Acesso e segurança"
        description="Como você entra no Itinus e o que pode fazer nele."
      >
        <SystemAccessCard user={user} isSelf />

        <PasswordCard
          email={user.email}
          onChangePassword={() => setChangePasswordOpen(true)}
          dataTour="profile-password"
        />
      </ProfileSection>

      <ProfileSection
        title="Notificações"
        description="O que o Itinus avisa a você, por email e neste aparelho."
      >
        <EmailDigestCard
          isEnabled={user.isEmailDigestEnabled}
          onDone={onRefetch}
        />

        {/* Só no próprio perfil: a autorização é do aparelho de quem está
            usando, e o gestor não tem como ligá-la no celular de outra pessoa. */}
        <PushNotificationsCard />
      </ProfileSection>

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
