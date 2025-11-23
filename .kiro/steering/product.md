# Product Overview

Sankofa is a digital susu (rotating savings and credit association) platform for Ghana and West Africa. It modernizes traditional community savings groups with mobile-first technology.

## Core Features

- **Mobile Money Integration**: Deposits and withdrawals via Ghana mobile money networks
- **Susu Groups**: Users create or join savings circles with scheduled contributions and rotating payouts
- **Personal Savings Goals**: Individual goal tracking with milestone notifications
- **Real-time Updates**: WebSocket-based notifications for group activity
- **KYC Verification**: Ghana Card capture and verification for compliance
- **Dispute Resolution**: Built-in support desk with SLA tracking

## User Roles

- **Members**: Regular users who join groups, save, and transact
- **Group Admins**: Create and manage private groups, invite members
- **Platform Staff**: Operations team managing users, approving transactions, resolving disputes

## Clients

- **sankofa_app**: Flutter mobile app (iOS/Android) - primary user interface
- **sankofa_admin**: React admin console for platform operations
- **sankofa_frontend**: React web app mirroring mobile experience (in progress)
- **sankofa_backend**: Django REST API serving all clients

## Key Workflows

1. **Onboarding**: Phone OTP → KYC submission → Wallet activation
2. **Group Participation**: Browse/join groups → Schedule contributions → Receive payouts
3. **Savings**: Set goals → Make contributions → Track milestones → Collect savings
4. **Transactions**: Deposit funds → Contribute to groups/goals → Withdraw to mobile money
