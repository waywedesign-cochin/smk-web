import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DirectorLedgerTotals } from "@/redux/features/directorledger/directorSlice";
import { de } from "date-fns/locale";

interface LedgerSummaryProps {
  totals: DirectorLedgerTotals | null;
}

export function LedgerSummary({ totals }: LedgerSummaryProps) {
  if (!totals) return null;

  const summaryData = [
    {
      title: "Students Paid",
      value: totals.studentsPaid,
      color: "from-blue-100 to-blue-200",
      lightBg: "bg-blue-50",
      textColor: "text-blue-100",
      description: "Student paid to director bank account",
    },
    {
      title: "Cash in Hand",
      value: totals.cashInHand,
      color: "from-green-100 to-green-200",
      lightBg: "bg-green-50",
      textColor: "text-green-200",
      description: "Cash taken form branch in hand",
    },
    {
      title: "Other Expenses",
      value: totals.otherExpenses,
      color: "from-red-200 to-red-300",
      lightBg: "bg-red-50",
      textColor: "text-red-300",
      description: "Payments for director Expenses",
    },
    {
      title: "To Bank ",
      value: totals.institutionGaveBank,
      color: "from-purple-200 to-purple-100",
      lightBg: "bg-purple-50",
      textColor: "text-purple-100",
      description: "Payments form Institution to director bank account",
    },
    {
      title: "Period Balance",
      value: totals.periodBalance,
      color:
        totals.periodBalance >= 0
          ? "from-emerald-200 to-emerald-100"
          : "from-orange-200 to-orange-100",
      lightBg: totals.periodBalance >= 0 ? "bg-emerald-50" : "bg-orange-50",
      textColor:
        totals.periodBalance >= 0 ? "text-emerald-100" : "text-orange-100",
      description: "Closing balance of the period",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
      {summaryData.map((item) => (
        <Card
          key={item.title}
          className={`${item.lightBg} bg-white/10 border border-white/10 backdrop-blur-md text-white`}
        >
          <CardHeader className="pb-2">
            <CardTitle className={`text-sm font-medium ${item.textColor}`}>
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${item.textColor}`}>
              {item.value.toLocaleString()} ₹
            </div>
            <p className="text-xs mt-2 text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
