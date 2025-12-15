import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1";

// Mock data for when backend is unavailable
const getMockData = () => ({
  data: {
    sales: {
      totalRevenue: 48250.0,
      totalOrders: 156,
      averageOrderValue: 309.29,
      totalItemsSold: 423,
      currency: "USD",
    },
    topSellingProducts: [
      {
        productId: "1",
        title: "Premium Wireless Headphones",
        totalSold: 45,
        totalRevenue: 8955,
        image: "",
      },
      {
        productId: "2",
        title: "Smart Watch Pro",
        totalSold: 38,
        totalRevenue: 11362,
        image: "",
      },
      {
        productId: "3",
        title: "Laptop Stand Aluminum",
        totalSold: 52,
        totalRevenue: 3640,
        image: "",
      },
      {
        productId: "4",
        title: "USB-C Hub 7-in-1",
        totalSold: 67,
        totalRevenue: 4690,
        image: "",
      },
      {
        productId: "5",
        title: "Mechanical Keyboard RGB",
        totalSold: 29,
        totalRevenue: 4350,
        image: "",
      },
    ],
    customers: {
      totalCustomers: 1234,
      newCustomers: 89,
      returningCustomers: 67,
      repeatPurchaseRate: 42.5,
    },
    salesTrends: [
      { date: "2025-11-21", orders: 18, revenue: 5580 },
      { date: "2025-11-22", orders: 24, revenue: 7440 },
      { date: "2025-11-23", orders: 31, revenue: 9610 },
      { date: "2025-11-24", orders: 22, revenue: 6820 },
      { date: "2025-11-25", orders: 28, revenue: 8680 },
      { date: "2025-11-26", orders: 19, revenue: 5890 },
      { date: "2025-11-27", orders: 14, revenue: 4230 },
    ],
    recentOrders: [
      {
        orderId: "1",
        orderNumber: "1001",
        customer: "John Doe",
        totalPrice: 299.99,
        status: "completed",
        placedAt: "2025-11-27T10:30:00Z",
      },
      {
        orderId: "2",
        orderNumber: "1002",
        customer: "Jane Smith",
        totalPrice: 459.5,
        status: "processing",
        placedAt: "2025-11-27T09:15:00Z",
      },
      {
        orderId: "3",
        orderNumber: "1003",
        customer: "Bob Wilson",
        totalPrice: 129.0,
        status: "pending",
        placedAt: "2025-11-26T16:45:00Z",
      },
      {
        orderId: "4",
        orderNumber: "1004",
        customer: "Alice Brown",
        totalPrice: 789.99,
        status: "completed",
        placedAt: "2025-11-26T14:20:00Z",
      },
      {
        orderId: "5",
        orderNumber: "1005",
        customer: "Charlie Davis",
        totalPrice: 199.99,
        status: "completed",
        placedAt: "2025-11-26T11:00:00Z",
      },
    ],
    lowStockProducts: [
      {
        productId: "1",
        title: "Wireless Mouse",
        image: "",
        quantity: 5,
        threshold: 20,
      },
      {
        productId: "2",
        title: "Phone Case Premium",
        image: "",
        quantity: 8,
        threshold: 25,
      },
      {
        productId: "3",
        title: "Screen Protector",
        image: "",
        quantity: 12,
        threshold: 30,
      },
    ],
    engagement: {
      totalSessions: 4523,
      uniqueUsers: 2891,
      avgSessionDuration: 245,
      screenViews: 18420,
      mostViewedScreens: [
        { screen: "Home", views: 5230 },
        { screen: "Products", views: 4120 },
        { screen: "Cart", views: 2890 },
      ],
    },
    topViewedProducts: [],
    topSearches: [
      { query: "wireless headphones", count: 234, avgResultsCount: 45 },
      { query: "laptop stand", count: 189, avgResultsCount: 32 },
      { query: "usb hub", count: 156, avgResultsCount: 28 },
      { query: "keyboard", count: 142, avgResultsCount: 67 },
      { query: "mouse pad", count: 98, avgResultsCount: 23 },
    ],
    platformBreakdown: [
      { platform: "ios", count: 1456, percentage: 45.2 },
      { platform: "android", count: 1234, percentage: 38.3 },
      { platform: "web", count: 532, percentage: 16.5 },
    ],
    hourlyActivity: [
      { hour: 0, events: 120 },
      { hour: 1, events: 85 },
      { hour: 2, events: 45 },
      { hour: 3, events: 32 },
      { hour: 4, events: 28 },
      { hour: 5, events: 42 },
      { hour: 6, events: 89 },
      { hour: 7, events: 156 },
      { hour: 8, events: 234 },
      { hour: 9, events: 345 },
      { hour: 10, events: 412 },
      { hour: 11, events: 389 },
      { hour: 12, events: 356 },
      { hour: 13, events: 378 },
      { hour: 14, events: 423 },
      { hour: 15, events: 456 },
      { hour: 16, events: 489 },
      { hour: 17, events: 512 },
      { hour: 18, events: 478 },
      { hour: 19, events: 445 },
      { hour: 20, events: 389 },
      { hour: 21, events: 312 },
      { hour: 22, events: 234 },
      { hour: 23, events: 178 },
    ],
  },
});

export async function GET(request: NextRequest) {
  // Return mock data directly for now
  return NextResponse.json(getMockData());
}
