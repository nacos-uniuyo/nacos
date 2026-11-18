import type {
  DepartmentSummary,
  EventSummary,
  GoodwillSummary,
  OpportunitySummary,
  PersonSummary,
  PostSummary,
  ProjectSummary,
  SchoolSessionSummary,
} from "@/server/contracts";

/**
 * Seed fixtures for Phase 2 frontend work. They mirror the production schema
 * closely enough that swapping a router from these arrays to a Drizzle query
 * does not change the contract. Every array is validated by its router, so a
 * fixture that drifts from the contract fails loudly instead of reaching a page.
 */

export const departments: DepartmentSummary[] = [
  {
    slug: "computer-science",
    name: "Computer Science",
    shortName: "CSC",
    summary:
      "Algorithms, software construction and the theory that underpins them. The faculty's oldest department and the home of most of its coursework projects.",
    hodName: "Dr. U. E. Umoren",
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    shortName: "CYB",
    summary:
      "Defensive and offensive security practice, digital forensics and the policy work that keeps institutions safe.",
    hodName: "Dr. A. E. Essien",
  },
  {
    slug: "information-systems",
    name: "Information Systems",
    shortName: "INS",
    summary:
      "How organisations capture, move and act on data, from enterprise systems to the public-sector records that run on them.",
    hodName: "Dr. I. J. Akpan",
  },
  {
    slug: "data-analytics",
    name: "Data Analytics",
    shortName: "DAN",
    summary:
      "Statistics, machine learning and the pipeline engineering that turns raw records into decisions people can defend.",
    hodName: "Dr. M. B. Okon",
  },
  {
    slug: "software-engineering",
    name: "Software Engineering",
    shortName: "SWE",
    summary:
      "Requirements, architecture, testing and delivery. The department that treats shipping maintainable software as the discipline itself.",
    hodName: "Dr. G. A. Etuk",
  },
];

export const schoolSessions: SchoolSessionSummary[] = [
  {
    slug: "2024-2025",
    name: "2024/2025 Academic Session",
    theme: "The Revolution",
    isCurrent: true,
  },
  {
    slug: "2022-2023",
    name: "2022/2023 Academic Session",
    theme: "The Pioneer Administration",
    isCurrent: false,
  },
];

export const roster: PersonSummary[] = [
  {
    slug: "banny-confidence-jack",
    fullName: "Banny Confidence Jack",
    roleTitle: "President",
    tier: "elected_exco",
    sessionSlug: "2024-2025",
    departmentSlug: "computer-science",
    photoUrl: "/images/execs/president.webp",
    isFeaturedHomepage: true,
  },
  {
    slug: "chukwuemeka-salome",
    fullName: "Chukwuemeka, Salome A.",
    roleTitle: "Vice President",
    tier: "elected_exco",
    sessionSlug: "2024-2025",
    departmentSlug: "information-systems",
    photoUrl: "/images/execs/vice-president.webp",
    isFeaturedHomepage: true,
  },
  {
    slug: "bisong-malachi",
    fullName: "Bisong, Malachi O.",
    roleTitle: "Secretary General",
    tier: "elected_exco",
    sessionSlug: "2024-2025",
    departmentSlug: "cybersecurity",
    photoUrl: "/images/execs/secretary-general.webp",
    isFeaturedHomepage: true,
  },
  {
    slug: "emmanuel-akpan",
    fullName: "Emmanuel Akpan",
    roleTitle: "Director of Software",
    tier: "elected_exco",
    sessionSlug: "2024-2025",
    departmentSlug: "software-engineering",
    photoUrl: "/images/execs/director-of-software.webp",
    isFeaturedHomepage: true,
  },
  {
    slug: "vincent-clement",
    fullName: "Vincent Clement",
    roleTitle: "Director of Information and Public Relations",
    tier: "elected_exco",
    sessionSlug: "2024-2025",
    departmentSlug: "data-analytics",
    photoUrl: "/images/execs/director-of-information.webp",
    isFeaturedHomepage: false,
  },
  {
    slug: "grace-udoh",
    fullName: "Grace Udoh",
    roleTitle: "Special Aide on Documentation",
    tier: "aide",
    sessionSlug: "2024-2025",
    departmentSlug: "computer-science",
    photoUrl: null,
    isFeaturedHomepage: false,
  },
  {
    slug: "samuel-aniefiok",
    fullName: "Samuel Aniefiok",
    roleTitle: "Lead Frontend",
    tier: "dev_team",
    sessionSlug: "2024-2025",
    departmentSlug: "software-engineering",
    photoUrl: null,
    isFeaturedHomepage: false,
  },
  {
    slug: "david-etuk",
    fullName: "David Etuk",
    roleTitle: "Lead Backend",
    tier: "dev_team",
    sessionSlug: "2024-2025",
    departmentSlug: "computer-science",
    photoUrl: null,
    isFeaturedHomepage: false,
  },
  {
    slug: "mikpidogho-emmanuel",
    fullName: "Mikpidogho Emmanuel E.",
    roleTitle: "Graduating Class",
    tier: "alumni",
    sessionSlug: "2022-2023",
    departmentSlug: "cybersecurity",
    photoUrl: null,
    isFeaturedHomepage: false,
  },
  {
    slug: "charles-prosper",
    fullName: "Charles Prosper O.",
    roleTitle: "Graduating Class",
    tier: "alumni",
    sessionSlug: "2022-2023",
    departmentSlug: "information-systems",
    photoUrl: null,
    isFeaturedHomepage: false,
  },
];

export const projects: ProjectSummary[] = [
  {
    slug: "open-track",
    title: "Open-Track",
    tagline: "A shared progress board for every faculty commitment, visible to the whole chapter.",
    category: "software_engineering",
    departmentSlug: "software-engineering",
    courseCode: null,
    teamDisplayName: "NACOS Software Directorate",
    repoUrl: "https://github.com/nacos-uniuYo",
    demoUrl: null,
    featured: true,
  },
  {
    slug: "campus-threat-monitor",
    title: "Campus Threat Monitor",
    tagline: "Passive network monitoring that flags rogue access points around the Faculty of Computing.",
    category: "cybersecurity",
    departmentSlug: "cybersecurity",
    courseCode: "CYB 411",
    teamDisplayName: "CYB 400L - Group 3",
    repoUrl: null,
    demoUrl: null,
    featured: false,
  },
  {
    slug: "siwes-placement-matcher",
    title: "SIWES Placement Matcher",
    tagline: "Matches students to industrial training slots by department, skill set and location.",
    category: "information_systems_networking",
    departmentSlug: "information-systems",
    courseCode: "INS 412",
    teamDisplayName: "INS 400L - Group 7",
    repoUrl: null,
    demoUrl: null,
    featured: true,
  },
  {
    slug: "lecture-hall-occupancy",
    title: "Lecture Hall Occupancy Sensor",
    tagline: "A low-cost ESP32 rig that reports how full each lecture hall is before students walk over.",
    category: "embedded_systems_hardware",
    departmentSlug: "computer-science",
    courseCode: "CSC 415",
    teamDisplayName: "CSC 400L - Group 1",
    repoUrl: null,
    demoUrl: null,
    featured: false,
  },
];

export const opportunities: OpportunitySummary[] = [
  {
    slug: "siwes-2026-multinational",
    title: "SIWES Placement: Software Engineering Intern",
    orgName: "Multinational ICT Ltd",
    type: "siwes_it",
    departmentSlug: "software-engineering",
    location: "Lagos, Nigeria",
    deadline: "2026-12-15T23:59:00+01:00",
    applyUrl: "https://example.com/siwes-2026",
  },
  {
    slug: "faculty-research-grant",
    title: "Undergraduate Research Grant",
    orgName: "Faculty of Computing",
    type: "scholarship",
    departmentSlug: null,
    location: "University of Uyo",
    deadline: "2027-01-30T23:59:00+01:00",
    applyUrl: "https://example.com/research-grant",
  },
  {
    slug: "hackathon-sponsorship",
    title: "Hackathon Sponsorship and Mentorship",
    orgName: "Uyo Tech Collective",
    type: "sponsorship",
    departmentSlug: null,
    location: "Uyo, Akwa Ibom",
    deadline: null,
    applyUrl: "https://example.com/hackathon",
  },
  {
    slug: "graduate-trainee-programme",
    title: "Graduate Trainee Programme",
    orgName: "Sterling Bank",
    type: "job",
    departmentSlug: null,
    location: "Nationwide",
    deadline: "2026-12-31T23:59:00+01:00",
    applyUrl: "https://example.com/graduate-trainee",
  },
];

export const events: EventSummary[] = [
  {
    slug: "inauguration-4th-executive-council",
    title: "Inauguration of the 4th Executive Council",
    tagline: "Twelve officers take the oath of office and the mandate passes to a new administration.",
    startDate: "2026-10-09T12:00:00+01:00",
    endDate: "2026-10-09T16:30:00+01:00",
    venueName: "Faculty of Computing Auditorium",
    flyerUrl: "/images/inauguration-flyer.jpg",
  },
  {
    slug: "faculty-hackathon-2027",
    title: "Faculty Hackathon 2027",
    tagline: "Forty-eight hours, five departments, one shared problem set from the university.",
    startDate: "2027-02-19T08:00:00+01:00",
    endDate: "2027-02-21T18:00:00+01:00",
    venueName: "Faculty of Computing Auditorium",
    flyerUrl: null,
  },
];

export const posts: PostSummary[] = [
  {
    slug: "open-track-launch",
    title: "Open-Track goes live",
    excerpt:
      "The Software Directorate publishes every commitment the executive council made, with owners and progress, in one public board.",
    publishedAt: "2026-11-02T09:00:00+01:00",
    coverUrl: null,
    featured: true,
  },
  {
    slug: "siwes-orientation",
    title: "SIWES orientation holds for 400 level",
    excerpt:
      "Students across the five departments receive placement guidance, logbook requirements and supervisor expectations.",
    publishedAt: "2026-10-26T09:00:00+01:00",
    coverUrl: null,
    featured: false,
  },
];

export const goodwill: GoodwillSummary[] = [
  {
    authorName: "Prof. A. M. Ime",
    authorTitle: "Dean, Faculty of Computing",
    message:
      "The faculty exists for the students, and a chapter that documents its own work in public is one that can be held to a standard.",
  },
  {
    authorName: "Dr. U. E. Umoren",
    authorTitle: "Staff Adviser, NACOS UNIUYO",
    message:
      "Every set leaves behind a record. This portal is how the record survives the handover from one administration to the next.",
  },
];

export const deansMessage = {
  heading: "From the Dean's desk",
  body: "Computing at the University of Uyo is measured by what our students build and how honestly they report it. This portal is the faculty's own account of that work.",
  authorName: "Prof. A. M. Ime",
  authorTitle: "Dean, Faculty of Computing",
};
