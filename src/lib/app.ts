/**
 * Product identity. The shell (logo, top bar, login, metadata) reads this, so
 * renaming the product is a one-file change.
 */
export const APP = {
  /** One-word Sanskrit product name, rendered as the wordmark. */
  name: "Grantha",
  devanagari: "ग्रन्थ",
  /** What the Sanskrit word means, shown once on the sign-in surface. */
  meaning: "treatise",
  descriptor: "Technical literature written from the engineering record",
  /** Zero-based index of the wordmark letter that takes the brand orange. */
  accentIndex: 2,
  loginHeadline: "Every sentence traceable to a record.",
  loginSubline: "Use and care guides, installation instructions and service manuals drafted from the product's own engineering record, then checked against it rule by rule.",
  loginNote: "The authoring desk is author-only.",
  /** Scope pill in the top bar, e.g. the tenant or dataset in view. */
  scope: "Northfield Appliances",
  operator: { name: "Demo Operator", initials: "DO" },
  home: "/dashboard",
  settingsHref: "/settings",
} as const;
