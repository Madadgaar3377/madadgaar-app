/**
 * Global TypeScript types
 * Shared types across the application
 */

// Request status types
export type RequestStatus =
  | 'REQUESTED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'VERIFIED'
  | 'CLOSED'
  | 'PAID';

// Service types
export type ServiceCategory = 'INSTALLMENTS' | 'PROPERTIES' | 'LOANS' | 'INSURANCE';

// Add more types as needed

