import type { OpportunityType, ProjectCategory, RoleName } from "@/lib/enums";

export const projectCategoryLabels = {
  cybersecurity: "Cybersecurity",
  embedded_systems_hardware: "Embedded Systems & Hardware",
  software_engineering: "Software Engineering",
  artificial_intelligence_data: "AI & Data",
  information_systems_networking: "Information Systems & Networking",
  theoretical_computing_research: "Theoretical Computing & Research",
  interdisciplinary: "Interdisciplinary",
} satisfies Record<ProjectCategory, string>;

export const opportunityTypeLabels = {
  siwes_it: "SIWES / IT",
  scholarship: "Scholarship",
  sponsorship: "Sponsorship",
  partnership: "Partnership",
  job: "Job",
} satisfies Record<OpportunityType, string>;

export const roleLabels = {
  user: "Member",
  department_editor: "Department Coordinator",
  admin: "Faculty Administrator",
} satisfies Record<RoleName, string>;

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
