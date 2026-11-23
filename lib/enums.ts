/**
 * Domain enums shared by the Drizzle schema and the tRPC contracts, so adding
 * a category or a role is one edit rather than two that can drift apart.
 */

export const roleNames = ["user", "department_editor", "admin"] as const;

export const roleTiers = ["elected_exco", "aide", "dev_team", "alumni", "staff"] as const;

export const projectCategories = [
  "cybersecurity",
  "embedded_systems_hardware",
  "software_engineering",
  "artificial_intelligence_data",
  "information_systems_networking",
  "theoretical_computing_research",
  "interdisciplinary",
] as const;

export const opportunityTypes = [
  "siwes_it",
  "scholarship",
  "sponsorship",
  "partnership",
  "job",
] as const;

export const opportunityStatuses = ["draft", "submitted", "approved", "rejected"] as const;

export type RoleName = (typeof roleNames)[number];
export type RoleTier = (typeof roleTiers)[number];
export type ProjectCategory = (typeof projectCategories)[number];
export type OpportunityType = (typeof opportunityTypes)[number];
export type OpportunityStatus = (typeof opportunityStatuses)[number];
