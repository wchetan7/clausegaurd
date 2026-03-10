const CONTRACT_KEYWORDS = [
  "agreement", "terms", "clause", "party", "parties",
  "obligations", "renewal", "termination", "signed",
  "contract", "herein", "hereby", "whereas", "indemnif",
  "liability", "governing law", "jurisdiction", "effective date",
  "confidential", "non-disclosure", "warranty", "breach",
];

/**
 * Returns true if the text appears to be a contract/legal document.
 * Checks for presence of contract-related keywords.
 */
export function isLikelyContract(text: string): boolean {
  const lower = text.toLowerCase();
  const matchCount = CONTRACT_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  // Require at least 3 different keywords to consider it a contract
  return matchCount >= 3;
}

export const NOT_A_CONTRACT_MSG =
  "This doesn't appear to be a contract. Please upload a vendor or service agreement PDF.";
