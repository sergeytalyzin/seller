export type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: Date;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ExpenseInput = {
  title: string;
  category: string;
  amount: number;
  date: Date;
  comment: string | null;
};
