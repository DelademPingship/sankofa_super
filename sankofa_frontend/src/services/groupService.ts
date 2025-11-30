/**
 * Group Service
 * Mirrors the mobile app's GroupService
 */

import { apiClient } from '../lib/apiClient';
import type { SusuGroup } from '../lib/types';

class GroupService {
  private cachedGroups: SusuGroup[] | null = null;

  /**
   * Get all groups for the current user
   */
  async getGroups(forceRefresh: boolean = false): Promise<SusuGroup[]> {
    if (!forceRefresh && this.cachedGroups) {
      return this.cachedGroups;
    }

    try {
      const response = await apiClient.get<SusuGroup[]>('/api/groups/');
      if (Array.isArray(response)) {
        this.cacheGroups(response);
        return response;
      }
    } catch (error) {
      console.error('[GroupService] Failed to fetch groups:', error);
      // Fall back to cached data on error
    }

    // If no groups exist, provide sample data for development
    if (!this.cachedGroups || this.cachedGroups.length === 0) {
      console.log('[GroupService] No groups found, providing sample data');
      const sampleGroups: SusuGroup[] = [
        {
          id: 'sample-1',
          name: 'Weekly Savings Circle',
          description: 'A group for weekly savings with rotating payouts',
          cycleStatus: 'active' as const,
          contributionAmount: 100,
          contributionFrequency: 'weekly' as const,
          totalMembers: 6,
          currentCycle: 3,
          nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          nextPayoutRecipient: 'Ama Boateng',
          totalPool: 600,
          heroImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'sample-2',
          name: 'Monthly Investment Group',
          description: 'Monthly contributions for long-term savings goals',
          cycleStatus: 'active' as const,
          contributionAmount: 500,
          contributionFrequency: 'monthly' as const,
          totalMembers: 4,
          currentCycle: 2,
          nextPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          nextPayoutRecipient: 'Kojo Owusu',
          totalPool: 2000,
          heroImage: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      this.cacheGroups(sampleGroups);
      return sampleGroups;
    }

    return this.cachedGroups || [];
  }

  /**
   * Get a single group by ID
   */
  async getGroupById(id: string): Promise<SusuGroup | null> {
    console.log('[GroupService] Getting group by ID:', id);
    
    // Check cache first
    if (this.cachedGroups) {
      const cached = this.cachedGroups.find((g) => g.id === id);
      if (cached) {
        console.log('[GroupService] Found group in cache:', cached);
        return cached;
      }
    }

    try {
      console.log('[GroupService] Fetching group from API:', id);
      const response = await apiClient.get<SusuGroup>(`/api/groups/${id}/`);
      if (response) {
        console.log('[GroupService] Found group from API:', response);
        this.upsertCachedGroup(response);
        return response;
      }
    } catch (error) {
      console.error('[GroupService] Failed to fetch group by ID:', error);
      // Check if it's a sample group ID
      if (id.startsWith('sample-') && this.cachedGroups) {
        const sampleGroup = this.cachedGroups.find(g => g.id === id);
        if (sampleGroup) {
          console.log('[GroupService] Returning sample group:', sampleGroup);
          return sampleGroup;
        }
      }
    }

    console.log('[GroupService] Group not found:', id);
    return null;
  }

  /**
   * Join a public group
   */
  async joinPublicGroup(
    groupId: string,
    introduction?: string,
    autoSave: boolean = false,
    remindersEnabled: boolean = true
  ): Promise<SusuGroup> {
    const payload: Record<string, unknown> = {};
    if (introduction) {
      payload.introduction = introduction;
    }
    if (autoSave) {
      payload.auto_save = autoSave;
    }
    if (!remindersEnabled) {
      payload.reminders_enabled = remindersEnabled;
    }

    const response = await apiClient.post<SusuGroup>(
      `/api/groups/${groupId}/join/`,
      Object.keys(payload).length > 0 ? payload : undefined
    );

    if (response) {
      this.upsertCachedGroup(response);
      return response;
    }

    throw new Error('Unexpected response from server.');
  }

  /**
   * Create a new group
   */
  async createGroup(data: {
    name: string;
    description?: string;
    contributionAmount: number;
    frequency: string;
    startDate: string;
    invites: Array<{ name: string; phoneNumber: string }>;
    requiresApproval?: boolean;
    isPublic?: boolean;
  }): Promise<SusuGroup> {
    const payload: Record<string, unknown> = {
      name: data.name.trim(),
      contribution_amount: data.contributionAmount.toFixed(2),
      frequency: data.frequency,
      start_date: data.startDate,
      target_member_count: data.invites.length + 1,
      invites: data.invites.map(invite => ({
        name: invite.name.trim(),
        phone_number: invite.phoneNumber.trim(),
      })),
      requires_approval: data.requiresApproval ?? true,
      is_public: data.isPublic ?? false,
      payout_order: `Rotating (${data.frequency})`,
    };

    if (data.description && data.description.trim()) {
      payload.description = data.description.trim();
    }

    const response = await apiClient.post<SusuGroup>('/api/groups/', payload);

    if (response) {
      // Prepend to cache
      if (this.cachedGroups) {
        this.cachedGroups.unshift(response);
      } else {
        this.cachedGroups = [response];
      }
      return response;
    }

    throw new Error('Unexpected response from server.');
  }

  /**
   * Clear cached groups
   */
  clearCache(): void {
    this.cachedGroups = null;
  }

  /**
   * Cache groups locally
   */
  private cacheGroups(groups: SusuGroup[]): void {
    this.cachedGroups = groups;
  }

  /**
   * Update or insert a group in the cache
   */
  private upsertCachedGroup(group: SusuGroup): void {
    if (!this.cachedGroups) {
      this.cachedGroups = [group];
      return;
    }

    const index = this.cachedGroups.findIndex((g) => g.id === group.id);
    if (index >= 0) {
      this.cachedGroups[index] = group;
    } else {
      this.cachedGroups.push(group);
    }
  }
}

export const groupService = new GroupService();
