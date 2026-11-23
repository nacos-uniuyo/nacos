import presidentImg from "@/assets/images/execs/president.webp";
import vicePresidentImg from "@/assets/images/execs/vice-president.webp";
import secretaryGeneralImg from "@/assets/images/execs/secretary-general.webp";
import assistantSecretaryGeneralImg from "@/assets/images/execs/assistant-secretary-general.webp";
import financialSecretaryImg from "@/assets/images/execs/financial-secretary.webp";
import treasurerImg from "@/assets/images/execs/treasurer.webp";
import directorOfInformationImg from "@/assets/images/execs/director-of-information.webp";
import directorOfAcademicsImg from "@/assets/images/execs/director-of-academics.webp";
import directorOfSoftwareImg from "@/assets/images/execs/director-of-software.webp";
import directorOfSocialsImg from "@/assets/images/execs/director-of-socials.webp";
import directorOfSportsImg from "@/assets/images/execs/director-of-sports.webp";
import directorOfEnvironmentImg from "@/assets/images/execs/director-of-environment.webp";

export type Executive = {
  slug: string;
  name: string;
  role: string;
  /** Portrait imported as asset reference */
  photo?: string;
  /** Officers listed first on the homepage and in the council grid. */
  principal?: boolean;
};

// 4th Executive Council, NACOS UNIUYO. Names follow the official inauguration flyer.
export const executives: Executive[] = [
  { slug: "president", photo: presidentImg.src, name: "Banny Confidence Jack", role: "President", principal: true },
  { slug: "vice-president", photo: vicePresidentImg.src, name: "Chukwuemeka, Salome A.", role: "Vice President", principal: true },
  { slug: "secretary-general", photo: secretaryGeneralImg.src, name: "Bisong, Malachi O.", role: "Secretary General", principal: true },
  { slug: "assistant-secretary-general", photo: assistantSecretaryGeneralImg.src, name: "Mikpidogho Emmanuel E.", role: "Assistant Secretary General" },
  { slug: "financial-secretary", photo: financialSecretaryImg.src, name: "Francis, Bright E.", role: "Financial Secretary" },
  { slug: "treasurer", photo: treasurerImg.src, name: "Charles Prosper O.", role: "Treasurer" },
  {
    slug: "director-of-information",
    photo: directorOfInformationImg.src,
    name: "Vincent Clement",
    role: "Director of Information and Public Relations",
  },
  { slug: "director-of-academics", photo: directorOfAcademicsImg.src, name: "David Etuk", role: "Director of Academics" },
  { slug: "director-of-software", photo: directorOfSoftwareImg.src, name: "Emmanuel Akpan", role: "Director of Software", principal: true },
  { slug: "director-of-socials", photo: directorOfSocialsImg.src, name: "Stephen, Wisdom G.", role: "Director of Socials" },
  { slug: "director-of-sports", photo: directorOfSportsImg.src, name: "Samuel Aniefiok", role: "Director of Sports" },
  { slug: "director-of-environment", photo: directorOfEnvironmentImg.src, name: "Clement Paul T.", role: "Director of Environment" },
];

export const president = executives[0];

export function initials(name: string) {
  const words = name
    .replace(/[.,]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
  return words
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
