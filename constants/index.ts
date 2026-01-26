/**
 * Application constants
 * Static values and configuration
 */

// Request status labels
export const REQUEST_STATUS_LABELS: Record<string, string> = {
  REQUESTED: 'Requested',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  VERIFIED: 'Verified',
  CLOSED: 'Closed',
  PAID: 'Paid',
};

// Service categories
export const SERVICE_CATEGORIES = {
  INSTALLMENTS: 'Installments',
  PROPERTIES: 'Properties',
  LOANS: 'Loans',
  INSURANCE: 'Insurance',
} as const;

