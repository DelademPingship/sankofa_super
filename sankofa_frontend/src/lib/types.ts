/**
 * Core type definitions
 * Mirrors models from sankofa_app
 */

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  walletBalance: number;
  walletUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SusuGroup {
  id: string;
  name: string;
  description?: string;
  // API response fields
  memberIds: string[];
  memberNames: string[];
  invites: any[];
  ownerId?: string;
  ownerName?: string;
  ownedByPlatform?: boolean;
  targetMemberCount: number;
  contributionAmount: number;
  cycleNumber: number;
  totalCycles: number;
  nextPayoutDate?: string;
  payoutOrder?: string;
  isPublic: boolean;
  frequency: string;
  location?: string;
  requiresApproval: boolean;
  createdAt: string;
  updatedAt: string;
  // Computed fields for frontend compatibility
  totalMembers?: number;
  contributionFrequency?: string;
  cycleStatus?: string;
  totalPool?: number;
  nextPayoutRecipient?: string;
  heroImage?: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  // Frontend compatibility fields
  name?: string;
  savedAmount?: number;
  targetDate?: string;
  status?: 'active' | 'completed' | 'paused';
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'payout' | 'transfer';
  amount: number;
  fee?: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  channel?: string;
  reference?: string;
  description?: string;
  counterparty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  category?: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface WalletOperationResult {
  transaction: Transaction;
  walletBalance: number;
  walletUpdatedAt: string;
  platformBalance?: number;
}

export interface RegistrationResult {
  phoneNumber: string;
  message?: string;
  user?: User;
}

export interface OtpVerificationResult {
  access: string;
  refresh: string;
  user: User;
}
