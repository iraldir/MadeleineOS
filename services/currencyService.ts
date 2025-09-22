export interface CoinTransaction {
  id: string;
  amount: number;
  type: 'earn' | 'spend';
  timestamp: number;
}

class CurrencyService {
  private readonly STORAGE_KEY = 'madeleine_coins';
  private coins: number = 0;
  private listeners: Set<(coins: number) => void> = new Set();
  private transactionListeners: Set<(transaction: CoinTransaction) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadCoins();
    }
  }

  private loadCoins(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    this.coins = stored ? parseInt(stored, 10) : 10; // Start with 10 coins
    if (isNaN(this.coins)) {
      this.coins = 10;
    }
  }

  private saveCoins(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, this.coins.toString());
    }
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.coins));
  }

  private notifyTransaction(transaction: CoinTransaction): void {
    this.transactionListeners.forEach(listener => listener(transaction));
  }

  getCoins(): number {
    return this.coins;
  }

  addCoins(amount: number): void {
    if (amount > 0) {
      this.coins += amount;
      this.saveCoins();
      
      const transaction: CoinTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: amount,
        type: 'earn',
        timestamp: Date.now()
      };
      this.notifyTransaction(transaction);
    }
  }

  spendCoins(amount: number): boolean {
    if (amount > 0 && this.coins >= amount) {
      this.coins -= amount;
      this.saveCoins();
      
      const transaction: CoinTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        amount: amount,
        type: 'spend',
        timestamp: Date.now()
      };
      this.notifyTransaction(transaction);
      
      return true;
    }
    return false;
  }

  canAfford(amount: number): boolean {
    return this.coins >= amount;
  }

  subscribe(listener: (coins: number) => void): () => void {
    this.listeners.add(listener);
    listener(this.coins); // Send current value immediately
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeToTransactions(listener: (transaction: CoinTransaction) => void): () => void {
    this.transactionListeners.add(listener);
    return () => {
      this.transactionListeners.delete(listener);
    };
  }

  reset(): void {
    this.coins = 10;
    this.saveCoins();
  }
}

export const currencyService = new CurrencyService();