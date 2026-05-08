import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, CreditCard, Plus, ReceiptText, ShieldCheck, Wallet } from 'lucide-react';
import { ActionButton } from '../components/ActionButton';
import { walletApi } from '../services/api';

const initialTransactions = [
  { id: 't1', type: 'out', label: 'Miro Foot reservation', amount: 250, date: new Date().toISOString(), status: 'Paid' },
  { id: 't2', type: 'in', label: 'Wallet top-up', amount: 400, date: new Date(Date.now() - 86400000).toISOString(), status: 'Confirmed' }
];

export function WalletPage() {
  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hkick_transactions') || 'null') || initialTransactions;
    } catch {
      return initialTransactions;
    }
  });
  const [message, setMessage] = useState('');
  const [serverBalance, setServerBalance] = useState(null);

  const balance = useMemo(
    () => serverBalance ?? transactions.reduce((sum, transaction) => sum + (transaction.type === 'in' ? transaction.amount : -transaction.amount), 0),
    [serverBalance, transactions]
  );

  useEffect(() => {
    walletApi.get()
      .then((data) => {
        setTransactions(data.transactions.length ? data.transactions : initialTransactions);
        setServerBalance(data.transactions.length ? data.balance : null);
      })
      .catch(() => {});
  }, []);

  async function addFunds(amount) {
    try {
      const data = await walletApi.topUp(amount);
      const next = [data.transaction, ...transactions];
      setTransactions(next);
      setServerBalance(data.balance);
      localStorage.setItem('hkick_transactions', JSON.stringify(next));
      setMessage(`MAD ${amount} added to wallet.`);
      return;
    } catch {
      // local fallback keeps the MVP usable without a migrated database
    }

    const transaction = {
      id: `topup-${Date.now()}`,
      type: 'in',
      label: 'Wallet top-up',
      amount,
      date: new Date().toISOString(),
      status: 'Confirmed'
    };
    const next = [transaction, ...transactions];
    setTransactions(next);
    localStorage.setItem('hkick_transactions', JSON.stringify(next));
    setMessage(`MAD ${amount} added to wallet.`);
  }

  async function payDeposit() {
    if (balance < 80) {
      setMessage('Add funds before paying a match deposit.');
      return;
    }

    try {
      const data = await walletApi.deposit(80);
      const next = [data.transaction, ...transactions];
      setTransactions(next);
      setServerBalance(data.balance);
      localStorage.setItem('hkick_transactions', JSON.stringify(next));
      setMessage('Deposit reserved. Your captain can trust your spot.');
      return;
    } catch {
      // local fallback
    }

    const transaction = {
      id: `deposit-${Date.now()}`,
      type: 'out',
      label: 'Next match deposit',
      amount: 80,
      date: new Date().toISOString(),
      status: 'Reserved'
    };
    const next = [transaction, ...transactions];
    setTransactions(next);
    localStorage.setItem('hkick_transactions', JSON.stringify(next));
    setMessage('Deposit reserved. Your captain can trust your spot.');
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="relative overflow-hidden rounded-lg bg-ink p-6 text-white">
          <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1400&q=85" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/30" />
          <div className="relative">
            <p className="flex items-center gap-2 text-sm font-black uppercase text-limeball"><Wallet size={17} /> HKick Wallet</p>
            <h1 className="mt-3 text-5xl font-black leading-none">MAD {balance}</h1>
            <p className="mt-3 max-w-lg font-semibold text-white/70">
              Pay match deposits, track pitch reservations, and reduce no-shows with prepaid commitment.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionButton onClick={() => addFunds(200)}><Plus size={17} /> Add MAD 200</ActionButton>
              <ActionButton variant="ghost" onClick={payDeposit}><ShieldCheck size={17} /> Pay deposit</ActionButton>
            </div>
            {message && <p className="mt-4 rounded-lg bg-white/10 px-3 py-2 text-sm font-bold text-white/75">{message}</p>}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <WalletSignal icon={CreditCard} title="Deposits" text="Reserve serious players before kickoff." />
          <WalletSignal icon={ReceiptText} title="Expenses" text="Track terrain and match payments." />
          <WalletSignal icon={ShieldCheck} title="Trust" text="Build reliability from paid attendance." />
        </div>
      </section>

      <section className="rounded-lg border border-black/10 bg-white/80 p-4 dark:border-white/10 dark:bg-white/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-turf dark:text-limeball">Activity</p>
            <h2 className="text-2xl font-black">Wallet history</h2>
          </div>
          <span className="rounded-lg bg-limeball px-3 py-2 text-sm font-black text-ink">{transactions.length}</span>
        </div>

        <div className="mt-4 space-y-2">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-3 rounded-lg bg-black/[0.04] px-3 py-3 dark:bg-white/[0.06]">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${transaction.type === 'in' ? 'bg-limeball text-ink' : 'bg-ink text-limeball dark:bg-white/10'}`}>
                  {transaction.type === 'in' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-black">{transaction.label}</p>
                  <p className="text-xs font-bold uppercase text-black/45 dark:text-white/45">
                    {transaction.status} / {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className="font-black">{transaction.type === 'in' ? '+' : '-'} MAD {transaction.amount}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WalletSignal({ icon: Icon, title, text }) {
  return (
    <div className="rounded-lg border border-black/10 bg-white/75 p-4 dark:border-white/10 dark:bg-white/10">
      <Icon size={19} className="text-turf dark:text-limeball" />
      <h3 className="mt-2 font-black">{title}</h3>
      <p className="mt-1 text-sm font-medium text-black/55 dark:text-white/55">{text}</p>
    </div>
  );
}
