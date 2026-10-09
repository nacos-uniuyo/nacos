export type Executive = {
  slug: string;
  name: string;
  role: string;
  /** Officers listed first on the homepage and in the council grid. */
  principal?: boolean;
};

// 4th Executive Council, NACOS UNIUYO. Names follow the official inauguration flyer.
export const executives: Executive[] = [
  { slug: "president", name: "Banny Confidence Jack", role: "President", principal: true },
  { slug: "vice-president", name: "Chukwuemeka, Salome A.", role: "Vice President", principal: true },
  { slug: "secretary-general", name: "Bidong, Malachi O.", role: "Secretary General", principal: true },
  { slug: "assistant-secretary-general", name: "Mkpidogho Emmanuel E.", role: "Assistant Secretary General" },
  { slug: "financial-secretary", name: "Francis, Bright E.", role: "Financial Secretary" },
  { slug: "treasurer", name: "Charles Prosper O.", role: "Treasurer" },
  {
    slug: "director-of-information",
    name: "Vincent Clement",
    role: "Director of Information and Public Relations",
  },
  { slug: "director-of-academics", name: "David Etuk", role: "Director of Academics" },
  { slug: "director-of-software", name: "Emmanuel Akpan", role: "Director of Software", principal: true },
  { slug: "director-of-socials", name: "Stephen, Wisdom G.", role: "Director of Socials" },
  { slug: "director-of-sports", name: "Samuel Aniefiok", role: "Director of Sports" },
  { slug: "director-of-environment", name: "Clement Paul T.", role: "Director of Environment" },
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
