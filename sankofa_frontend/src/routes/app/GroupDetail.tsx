import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, CalendarDaysIcon, UsersIcon, Wallet2Icon } from 'lucide-react';
import { groupService } from '../../services/groupService';
import { transactionService } from '../../services/transactionService';
import type { SusuGroup, Transaction } from '../../lib/types';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<SusuGroup | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroupData = async () => {
      if (!id) return;
      
      try {
        const [groupData, transactionsData] = await Promise.all([
          groupService.getGroupById(id),
          transactionService.getTransactions()
        ]);
        
        setGroup(groupData);
        // Filter transactions for this group (using description as workaround since groupId doesn't exist)
        setTransactions(transactionsData.filter(t => t.description?.includes(id) || t.counterparty === groupData.name).slice(0, 5));
      } catch (error) {
        console.error('Failed to load group data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Loading group details...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Group not found.</p>
        <Link to="/app/groups" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeftIcon size={16} /> Back to groups
        </Link>
      </div>
    );
  }

  const roster = ['Ama Boateng', 'Yaw Mensah', 'Akosua Agyeman', 'Kojo Owusu', 'Efua Serwaa', 'Nana Addo'];
  const groupTransactions = transactions.filter((transaction) => transaction.type !== 'deposit');

  return (
    <div className="space-y-8">
      <Link to="/app/groups" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
        <ArrowLeftIcon size={16} /> Back to groups
      </Link>
      <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 p-8">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{group.name}</h1>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{group.cycleStatus}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Transparent susu circle with GH₵{group.contributionAmount} contributions and rotating payout schedule. This mirrors the
            mobile detail view with roster, activity, and payout insights.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-600 shadow-inner dark:bg-slate-900/60 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">Contribution rhythm</p>
              <p className="mt-1">{group.contributionFrequency} payments via mobile money auto-debit.</p>
            </div>
            <div className="rounded-2xl bg-slate-50/80 p-4 text-sm text-slate-600 shadow-inner dark:bg-slate-900/60 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white">Next payout</p>
              <p className="mt-1">{group.nextPayoutDate || 'TBD'} • {group.nextPayoutRecipient || 'TBD'}</p>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 dark:border-slate-700 dark:bg-slate-900/70">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming payout</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{group.nextPayoutDate || 'TBD'}</p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-primary/10 p-4 text-sm text-primary">
              <CalendarDaysIcon size={18} />
              <span>{group.nextPayoutRecipient || 'Next member'} receives next. Confirm mobile money details 24h prior.</span>
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-r-3xl">
          <img src={group.heroImage} alt={group.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 space-y-3 rounded-3xl bg-white/90 p-6 text-sm text-slate-600 shadow-xl backdrop-blur dark:bg-slate-900/80 dark:text-slate-300">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <UsersIcon size={16} /> {group.totalMembers} members
            </div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Wallet2Icon size={16} /> Pool GH₵{group.totalPool.toLocaleString()}
            </div>
            <p>Contribution GH₵{group.contributionAmount} {group.contributionFrequency} via wallet auto-debit.</p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Roster</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {roster.map((name, index) => (
              <li key={name} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/70">
                <span>{index + 1}. {name}</span>
                <span className="text-xs font-semibold text-primary">Payout week {index + 1}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {groupTransactions.map((transaction) => (
              <div key={transaction.id} className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{transaction.type}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{transaction.createdAt} • {transaction.reference}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">GH₵{transaction.amount.toLocaleString()} ({transaction.status})</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default GroupDetail;
