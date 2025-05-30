
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SalesTable } from '@/components/bouzid-store/sales-table';
import type { Product, Sale } from '@/lib/types'; // Sale now refers to a transaction
import { DollarSign, TrendingUp, Package, AlertTriangle, List, ArrowLeft } from 'lucide-react';
import { useSalesStorage } from '@/hooks/use-sales-storage';
import { isLowStock } from '@/lib/product-utils';
import {
  startOfDay, endOfDay,
  isSameDay,
} from 'date-fns';
// import { arSA } from 'date-fns/locale'; // arSA locale not strictly needed for these calculations
import { cn } from '@/lib/utils';

interface SalesDashboardProps {
  products: Product[];
}

export function SalesDashboard({ products }: SalesDashboardProps) {
  const { sales: salesTransactions, isSalesLoaded } = useSalesStorage(); // sales is now array of Sale transactions

  const [todayRefDate, setTodayRefDate] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newCurrentDate = new Date();
      if (!isSameDay(todayRefDate, newCurrentDate)) {
        setTodayRefDate(newCurrentDate);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [todayRefDate]);

  const dailyStats = useMemo(() => {
    if (!isSalesLoaded) return {
      todaySalesValue: 0,
      todayProfit: 0,
    };

    const todayStart = startOfDay(todayRefDate);
    const todayEnd = endOfDay(todayRefDate);

    const transactionsToday = salesTransactions.filter(t =>
      t.sale_timestamp >= todayStart.getTime() && t.sale_timestamp <= todayEnd.getTime()
    );

    const todaySalesValue = transactionsToday.reduce((sum, t) => sum + t.total_transaction_amount, 0);

    const todayProfit = transactionsToday.reduce((sum, t) => {
      const transactionProfit = (t.items || []).reduce((itemSum, item) => {
        const profitPerItem = (item.retailPricePerUnitSnapshot - (item.wholesalePricePerUnitSnapshot || 0)) * item.quantitySold;
        return itemSum + (Number.isNaN(profitPerItem) ? 0 : profitPerItem);
      },0);
      return sum + transactionProfit;
    }, 0);

    return {
      todaySalesValue,
      todayProfit,
    };
  }, [salesTransactions, isSalesLoaded, todayRefDate]);

  const totalProductsInStock = products.length;
  const lowStockProductsCount = useMemo(() => products.filter(p => isLowStock(p)).length, [products]);

  const recentSalesTransactions = useMemo(() => {
    if (!isSalesLoaded) return [];
    // SalesTable now expects Sale[] and flattens items internally
    return salesTransactions
      .sort((a, b) => b.sale_timestamp - a.sale_timestamp)
      .slice(0, 5);
  }, [salesTransactions, isSalesLoaded]);


  if (!isSalesLoaded || !products) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background">
        <p className="text-foreground text-xl">جار تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-4 pb-8 px-4">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبيعات اليوم</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyStats.todaySalesValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} د.ج</div>
            <p className="text-xs text-muted-foreground">إجمالي قيمة المبيعات لليوم الحالي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أرباح اليوم</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
                "text-2xl font-bold",
                dailyStats.todayProfit > 0 && "text-emerald-600",
                dailyStats.todayProfit < 0 && "text-destructive"
              )}
            >
              {dailyStats.todayProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} د.ج
            </div>
            <p className="text-xs text-muted-foreground">إجمالي الأرباح المحققة اليوم</p>
          </CardContent>
        </Card>

        <Link href="/products?filter=all" className="block cursor-pointer group">
          <Card className="transition-colors group-hover:bg-muted/30 group-hover:border-primary/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">عدد المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProductsInStock}</div>
              <p className="text-xs text-muted-foreground">إجمالي المنتجات المتوفرة في المخزون</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/products?filter=low-stock" className="block cursor-pointer group">
         <Card className="transition-colors group-hover:bg-muted/30 group-hover:border-primary/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">منتجات منخفضة المخزون</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockProductsCount}</div>
              <p className="text-xs text-muted-foreground">عدد المنتجات التي مخزونها منخفض</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <List className="me-2 h-5 w-5 text-primary" />
            أحدث عمليات البيع
          </CardTitle>
          <CardDescription>
            أحدث 5 عمليات بيع (منتجات فردية) تم تسجيلها.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 md:p-4">
          {/* SalesTable expects Sale[] where Sale now contains items. It flattens them. */}
          <SalesTable sales={recentSalesTransactions} showCaption={false} />
        </CardContent>
        <div className="p-4 pt-2 text-center">
          <Button asChild variant="link" className="text-primary">
            <Link href="/sales">
              عرض كل سجل المبيعات
              <ArrowLeft className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
