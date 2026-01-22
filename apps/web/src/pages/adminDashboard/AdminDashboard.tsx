import { motion } from 'framer-motion';
import { useGetUsersQuery } from '../../app/store/api/usersApi';
import { useEffect, useMemo, useState } from 'react';
import Loader from '../../features/loader/Loader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PREFABS } from "../../config/prefabs";

interface Order {
  createdAt: string;
  order_item_total: number;
}

const AdminDashboard = () => {
  const hasEcommerce = Boolean(PREFABS.ecommerce);
  const { data: users, isLoading: isUsersLoading, error: userError} = useGetUsersQuery();
  const [ordersQuery, setOrdersQuery] = useState<any>(null);

  useEffect(() => {
    if (hasEcommerce) {
      import('../../app/store/api/ordersApi').then((mod) => {
        setOrdersQuery(mod.useGetOrdersQuery());
      });
    }
  }, [hasEcommerce]);

  const orders = ordersQuery?.data;
  const isOrdersLoading = ordersQuery?.isLoading;
  const orderError = ordersQuery?.error;

  const userGrowthData = useMemo(() => {
    if (!users || users.length === 0) return [];
    
    const sortedUsers = [...users].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const dailyData = new Map();
    let cumulativeCount = 0;

    sortedUsers.forEach(user => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      cumulativeCount++;
      dailyData.set(date, cumulativeCount);
    });

    return Array.from(dailyData.entries()).map(([date, count]) => ({
      date,
      users: count,
      displayDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [users]);

  const ordersData = useMemo(() => {
    if (!hasEcommerce || !orders || orders.length === 0) return [];

    const dailyOrders = new Map<string, { count: number; revenue: number }>();

    (orders as Order[]).forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const existing = dailyOrders.get(date) || { count: 0, revenue: 0 };

      dailyOrders.set(date, {
        count: existing.count + 1,
        revenue: existing.revenue + (order.order_item_total || 0),
      });
    });

    return Array.from(dailyOrders.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        date,
        orders: data.count,
        revenue: Math.round(data.revenue * 100) / 100,
        displayDate: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }));
  }, [orders, hasEcommerce]);

  const stats = useMemo(() => {
    const totalUsers = users?.length || 0;

    if (!hasEcommerce) {
      return { totalUsers };
    }

    const totalOrders = (orders as Order[])?.length || 0;
    const totalRevenue =
      (orders as Order[])?.reduce((sum, o) => sum + (o.order_item_total || 0), 0) || 0;

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalUsers,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    };
  }, [users, orders, hasEcommerce]);

  if (isUsersLoading || (hasEcommerce && isOrdersLoading)) {
    return (
      <div className="bg-neutral sup-min-nav relative z-0 p-4 flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  if (userError || (hasEcommerce && orderError)) {
    return (
      <div className="bg-neutral sup-min-nav relative z-0 flex flex-col justify-center items-center p-8">
        <h2 className="text-2xl font-semibold mb-2 text-red-500 font-primary">
          Critical Error
        </h2>
        <p className="text-neutral-500">
          Sorry, there was an error loading the admin data.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-neutral relative z-0 p-4 flex flex-col gap-6 flex-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
        </div>
        {hasEcommerce && (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Total Orders</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase">Avg Order Value</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">${stats.avgOrderValue}</p>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Growth Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={userGrowthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="displayDate" 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {hasEcommerce && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
                formatter={(value, name) => {
                  if (name === 'Revenue') return `$${value}`;
                  return value;
                }}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="orders" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Orders"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
};

export default AdminDashboard;