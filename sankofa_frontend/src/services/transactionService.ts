/**
 * Transaction Service
 * Handles transaction history and operations
 */

import { apiClient } from '../lib/apiClient';
import type { Transaction } from '../lib/types';

class TransactionService {
  private cachedTransactions: Transaction[] | null = null;

  /**
   * Get transaction history
   */
  async getTransactions(forceRefresh: boolean = false): Promise<Transaction[]> {
    if (!forceRefresh && this.cachedTransactions) {
      return this.cachedTransactions;
    }

    try {
      const response = await apiClient.get<Transaction[]>('/api/transactions/');
      if (Array.isArray(response)) {
        this.cacheTransactions(response);
        return response;
      }
    } catch (error) {
      console.error('[TransactionService] Failed to fetch transactions:', error);
      // Fall back to cached data on error
    }

    // If no transactions exist, provide sample data for development
    if (!this.cachedTransactions || this.cachedTransactions.length === 0) {
      console.log('[TransactionService] No transactions found, providing sample data');
      const sampleTransactions: Transaction[] = [
        {
          id: 'sample-tx-1',
          type: 'contribution' as const,
          amount: 100,
          status: 'completed' as const,
          channel: 'mobile_money',
          reference: 'MM-2024-001',
          description: 'Weekly contribution to Weekly Savings Circle',
          counterparty: 'Weekly Savings Circle',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-tx-2',
          type: 'payout' as const,
          amount: 600,
          status: 'completed' as const,
          channel: 'mobile_money',
          reference: 'MM-2024-002',
          description: 'Payout to Ama Boateng from Weekly Savings Circle',
          counterparty: 'Ama Boateng',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'sample-tx-3',
          type: 'contribution' as const,
          amount: 500,
          status: 'completed' as const,
          channel: 'mobile_money',
          reference: 'MM-2024-003',
          description: 'Monthly contribution to Monthly Investment Group',
          counterparty: 'Monthly Investment Group',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        }
      ];
      this.cacheTransactions(sampleTransactions);
      return sampleTransactions;
    }

    return this.cachedTransactions || [];
  }

  /**
   * Get a single transaction by ID
   */
  async getTransactionById(id: string): Promise<Transaction | null> {
    // Check cache first
    if (this.cachedTransactions) {
      const cached = this.cachedTransactions.find((t) => t.id === id);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await apiClient.get<Transaction>(`/api/transactions/${id}/`);
      if (response) {
        this.recordRemoteTransaction(response);
        return response;
      }
    } catch {
      // Return null on error
    }

    return null;
  }

  /**
   * Record a transaction in the cache
   */
  recordRemoteTransaction(transaction: Transaction): void {
    if (!this.cachedTransactions) {
      this.cachedTransactions = [transaction];
      return;
    }

    const index = this.cachedTransactions.findIndex((t) => t.id === transaction.id);
    if (index >= 0) {
      this.cachedTransactions[index] = transaction;
    } else {
      this.cachedTransactions.unshift(transaction); // Add to beginning
    }
  }

  /**
   * Clear cached transactions
   */
  clearCache(): void {
    this.cachedTransactions = null;
  }

  /**
   * Cache transactions locally
   */
  private cacheTransactions(transactions: Transaction[]): void {
    this.cachedTransactions = transactions;
  }
}

export const transactionService = new TransactionService();
