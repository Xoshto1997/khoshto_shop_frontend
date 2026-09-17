interface MonthlyRevenue {
  yearMonth: string;
  totalRevenue: number;
  orderCount: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalPaidOrders: number;
  currentMonthRevenue: number;
  monthlyRevenues: MonthlyRevenue[];
}