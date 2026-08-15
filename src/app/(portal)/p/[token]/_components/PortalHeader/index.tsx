import { Avatar } from "@/components/Avatar";
import { Title } from "@/components/Title";
import { companyInitials } from "@/utils/company";
import { mediaUrl } from "@/utils/media";
import { PortalProfile } from "../../interface";

interface PortalHeaderProps {
  profile: PortalProfile;
}

/**
 * Cabeçalho do portal: de quem é a página, e para quem ela é.
 *
 * A marca do escritório vem primeiro por uma razão prática: o cliente recebeu
 * um endereço num aplicativo de mensagem, e a única forma de ele saber que
 * aquilo não é golpe é reconhecer, na primeira dobra, quem o atende — e o
 * próprio nome logo abaixo.
 */
export function PortalHeader({ profile }: PortalHeaderProps) {
  const city = [profile.clientCity, profile.clientState]
    .filter(Boolean)
    .join(" - ");

  return (
    <header className="border-b border-(--border) bg-(--bg2)">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-[16px] px-[16px] py-[24px]">
        <div className="flex items-center gap-8">
          <Avatar
            size="sm"
            color="amber"
            src={mediaUrl(profile.companyLogoUrl)}
            alt={profile.companyName}
            initials={companyInitials(profile.companyName)}
            className="shrink-0"
          />
          <Title variant="body-sm" color="muted">
            {profile.companyName}
          </Title>
        </div>

        <div className="flex flex-col gap-[4px]">
          <Title variant="heading-lg">{profile.clientName}</Title>
          {city ? (
            <Title variant="body-sm" color="muted">
              {city}
            </Title>
          ) : null}
        </div>
      </div>
    </header>
  );
}
