import { ExpensesHeader } from "@/components/expenses/expenses-header";
import { ExpensesProvider } from "@/components/expenses/expenses-store";

export default function ExpensesLayout({ children }: LayoutProps<"/expenses">) {
  return (
    <ExpensesProvider>
      <div className="flex min-h-screen flex-col">
        <ExpensesHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </ExpensesProvider>
  );
}
