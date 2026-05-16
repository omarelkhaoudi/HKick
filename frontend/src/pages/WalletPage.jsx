import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Plus,
  ReceiptText,
  ShieldCheck,
  Wallet,
  Zap,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionButton } from "../components/ActionButton";
import { walletApi } from "../services/api";

const initialTransactions = [
  {
    id: "t1",
    type: "out",
    label: "Miro Foot reservation",
    amount: 250,
    date: new Date().toISOString(),
    status: "Paid",
  },
  {
    id: "t2",
    type: "in",
    label: "Wallet top-up",
    amount: 400,
    date: new Date(Date.now() - 86400000).toISOString(),
    status: "Confirmed",
  },
];

export function WalletPage() {
  const [transactions, setTransactions] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("hkick_transactions") || "null") ||
        initialTransactions
      );
    } catch {
      return initialTransactions;
    }
  });
  const [message, setMessage] = useState("");
  const [serverBalance, setServerBalance] = useState(null);

  const balance = useMemo(
    () =>
      serverBalance ??
      transactions.reduce(
        (sum, transaction) =>
          sum +
          (transaction.type === "in"
            ? transaction.amount
            : -transaction.amount),
        0,
      ),
    [serverBalance, transactions],
  );

  useEffect(() => {
    walletApi
      .get()
      .then((data) => {
        setTransactions(
          data.transactions.length ? data.transactions : initialTransactions,
        );
        setServerBalance(data.transactions.length ? data.balance : null);
      })
      .catch(() => {});
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  async function addFunds(amount) {
    let next;
    try {
      const data = await walletApi.topUp(amount);
      next = [data.transaction, ...transactions];
      setServerBalance(data.balance);
    } catch {
      const transaction = {
        id: `topup-${Date.now()}`,
        type: "in",
        label: "Wallet top-up",
        amount,
        date: new Date().toISOString(),
        status: "Confirmed",
      };
      next = [transaction, ...transactions];
    }
    setTransactions(next);
    localStorage.setItem("hkick_transactions", JSON.stringify(next));
    showMessage(`MAD ${amount} added to wallet.`);
  }

  async function payDeposit() {
    if (balance < 80) {
      showMessage("Add funds before paying a match deposit.");
      return;
    }

    let next;
    try {
      const data = await walletApi.deposit(80);
      next = [data.transaction, ...transactions];
      setServerBalance(data.balance);
    } catch {
      const transaction = {
        id: `deposit-${Date.now()}`,
        type: "out",
        label: "Next match deposit",
        amount: 80,
        date: new Date().toISOString(),
        status: "Reserved",
      };
      next = [transaction, ...transactions];
    }
    setTransactions(next);
    localStorage.setItem("hkick_transactions", JSON.stringify(next));
    showMessage("Deposit reserved. Your captain can trust your spot.");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-xl mx-auto pb-12"
    >
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-black tracking-tight">
          Wallet
        </h1>
      </header>

      {/* Main Wallet Card */}
      <motion.section
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-[2.5rem] p-8 text-white glass-panel border border-white/10 shadow-2xl transition-all"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-obsidian via-[#0f1a14] to-[#042614] z-0" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald/20 blur-[100px] rounded-full pointer-events-none z-0" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 z-0 mix-blend-overlay" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <p className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-emerald">
              <Wallet size={18} /> HKick Pay
            </p>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse shadow-glow" />
              <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
                Active
              </span>
            </div>
          </div>

          <div>
            <p className="text-white/50 font-bold uppercase tracking-widest text-xs mb-1">
              Total Balance
            </p>
            <h1 className="font-display text-6xl font-black leading-none tracking-tight flex items-start gap-2">
              <span className="text-2xl mt-2 text-emerald">MAD</span>
              {balance.toLocaleString()}
            </h1>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addFunds(200)}
              className="flex-1 min-w-[140px] bg-gradient-to-br from-emerald to-[#00A643] text-obsidian font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-glow hover:shadow-[0_0_25px_rgba(0,242,96,0.6)] transition-shadow"
            >
              <Plus size={20} /> Top Up
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={payDeposit}
              className="flex-1 min-w-[140px] bg-white/5 border border-white/10 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors shadow-inner"
            >
              <ShieldCheck size={20} className="text-cyan" /> Deposit
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 bg-surfaceLight/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2 z-20 shadow-2xl"
            >
              <div className="w-2 h-2 rounded-full bg-emerald shadow-glow" />
              <span className="text-xs font-bold text-white whitespace-nowrap">
                {message}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Stats/Signals */}
      <div className="grid grid-cols-3 gap-3">
        <WalletSignal
          icon={CreditCard}
          title="Deposits"
          text="Reserve spots"
          delay={0.1}
        />
        <WalletSignal
          icon={ReceiptText}
          title="Expenses"
          text="Track payments"
          delay={0.2}
        />
        <WalletSignal
          icon={TrendingUp}
          title="Trust"
          text="Build reliability"
          delay={0.3}
        />
      </div>

      {/* History */}
      <section className="glass-panel rounded-3xl p-6 border border-white/5 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-black">Recent Activity</h2>
          <button className="text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-white transition-colors">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction, i) => (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={transaction.id}
              className="group flex items-center justify-between gap-4 rounded-2xl bg-surface/50 border border-white/5 hover:border-emerald/30 p-4 transition-all hover:bg-surface"
            >
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110 ${transaction.type === "in" ? "bg-emerald/10 text-emerald border border-emerald/20" : "bg-surfaceLight text-white border border-white/10"}`}
                >
                  {transaction.type === "in" ? (
                    <ArrowDownLeft size={22} />
                  ) : (
                    <ArrowUpRight size={22} />
                  )}
                </span>
                <div>
                  <p className="font-bold text-base text-white group-hover:text-emerald transition-colors">
                    {transaction.label}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 mt-1">
                    {transaction.status} •{" "}
                    {new Date(transaction.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p
                className={`font-display text-lg font-black whitespace-nowrap ${transaction.type === "in" ? "text-emerald drop-shadow-[0_0_8px_rgba(0,242,96,0.3)]" : "text-white"}`}
              >
                {transaction.type === "in" ? "+" : "-"} {transaction.amount}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}

function WalletSignal({ icon: Icon, title, text, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-white/5 bg-surface/50 p-4 glass-panel hover:border-cyan/30 transition-all text-center flex flex-col items-center justify-center group"
    >
      <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center mb-3 group-hover:bg-cyan/20 transition-colors">
        <Icon
          size={20}
          className="text-cyan drop-shadow-md group-hover:scale-110 transition-transform"
        />
      </div>
      <h3 className="font-bold text-sm text-white">{title}</h3>
      <p className="mt-1 text-[10px] font-medium text-white/50 uppercase tracking-wider">
        {text}
      </p>
    </motion.div>
  );
}
