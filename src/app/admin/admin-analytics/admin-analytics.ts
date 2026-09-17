import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';




@Component({
  selector: 'app-admin-analytics',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './admin-analytics.html'
})
export class AdminAnalytics implements OnInit {
  private http = inject(HttpClient);

  stats = signal<DashboardStats | null>(null);
  isLoading = signal<boolean>(true);

  public barChartType: ChartType = 'bar';
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#fb7185',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` შემოსავალი: ₾${context?.parsed?.y?.toLocaleString()}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#a1a1aa' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { 
          color: '#a1a1aa',
          callback: (value) => '₾' + value 
        }
      }
    }
  };

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: '#f43f5e', 
        hoverBackgroundColor: '#fb7185',
        borderRadius: 8,
        barThickness: 28
      }
    ]
  };

  ngOnInit(): void {
    this.fetchAnalytics();
  }

  fetchAnalytics(): void {
    this.http.get<DashboardStats>('http://localhost:8090/api/admin/analytics/dashboard')
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.setupChart(data.monthlyRevenues);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('ანალიტიკის წამოღება ჩავარდა:', err);
          this.isLoading.set(false);
        }
      });
  }

  private setupChart(monthlyData: MonthlyRevenue[]): void {
    const sorted = [...monthlyData].reverse();

    this.barChartData.labels = sorted.map(item => item.yearMonth);
    this.barChartData.datasets[0].data = sorted.map(item => item.totalRevenue);
  }
}