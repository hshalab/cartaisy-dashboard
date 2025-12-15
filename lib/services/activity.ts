import { connectToDatabase } from '@/lib/db';
import { Activity, IActivity } from '@/models/Activity';
import { User } from '@/models/User';

export interface ActivityInput {
  storeId: string;
  userId: string;
  action: 'create' | 'update' | 'delete' | 'activate' | 'deactivate';
  resourceType: IActivity['resourceType'];
  resourceId: string;
  resourceName?: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ActivityFilters {
  storeId: string;
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityWithUser {
  id: string;
  storeId: string;
  userId: string;
  user: {
    name: string | null;
    email: string;
  };
  action: string;
  resourceType: string;
  resourceId: string;
  resourceName: string | null;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface ActivityStats {
  totalChanges7Days: number;
  totalChanges24Hours: number;
  mostActiveUser: {
    userId: string;
    name: string | null;
    email: string;
    count: number;
  } | null;
  mostEditedType: {
    resourceType: string;
    count: number;
  } | null;
  actionBreakdown: {
    action: string;
    count: number;
  }[];
}

/**
 * Log a new activity
 */
export async function logActivity(data: ActivityInput): Promise<IActivity> {
  await connectToDatabase();

  const activity = new Activity({
    storeId: data.storeId,
    userId: data.userId,
    action: data.action,
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    resourceName: data.resourceName,
    changes: data.changes,
    metadata: data.metadata,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  });

  await activity.save();
  return activity;
}

/**
 * Get activities with filters and pagination
 */
export async function getActivities(
  filters: ActivityFilters
): Promise<{ activities: ActivityWithUser[]; total: number }> {
  await connectToDatabase();

  const query: Record<string, any> = { storeId: filters.storeId };

  if (filters.userId) {
    query.userId = filters.userId;
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.resourceType) {
    query.resourceType = filters.resourceType;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  if (filters.search) {
    query.resourceName = { $regex: filters.search, $options: 'i' };
  }

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  const [activities, total] = await Promise.all([
    Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean(),
    Activity.countDocuments(query),
  ]);

  // Fetch user details for all activities
  const userIds = [...new Set(activities.map((a) => a.userId))];
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id name email')
    .lean();

  const userMap = new Map(
    users.map((u: any) => [u._id.toString(), { name: u.name, email: u.email }])
  );

  const activitiesWithUsers: ActivityWithUser[] = activities.map((activity: any) => ({
    id: activity._id.toString(),
    storeId: activity.storeId,
    userId: activity.userId,
    user: userMap.get(activity.userId) || { name: null, email: 'Unknown User' },
    action: activity.action,
    resourceType: activity.resourceType,
    resourceId: activity.resourceId,
    resourceName: activity.resourceName || null,
    changes: activity.changes,
    metadata: activity.metadata,
    ipAddress: activity.ipAddress,
    createdAt: activity.createdAt.toISOString(),
  }));

  return { activities: activitiesWithUsers, total };
}

/**
 * Get activities by a specific user
 */
export async function getActivitiesByUser(
  storeId: string,
  userId: string,
  limit = 50
): Promise<ActivityWithUser[]> {
  const { activities } = await getActivities({
    storeId,
    userId,
    limit,
  });
  return activities;
}

/**
 * Get activity history for a specific resource
 */
export async function getActivitiesByResource(
  storeId: string,
  resourceType: string,
  resourceId: string,
  limit = 20
): Promise<ActivityWithUser[]> {
  await connectToDatabase();

  const activities = await Activity.find({
    storeId,
    resourceType,
    resourceId,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Fetch user details
  const userIds = [...new Set(activities.map((a) => a.userId))];
  const users = await User.find({ _id: { $in: userIds } })
    .select('_id name email')
    .lean();

  const userMap = new Map(
    users.map((u: any) => [u._id.toString(), { name: u.name, email: u.email }])
  );

  return activities.map((activity: any) => ({
    id: activity._id.toString(),
    storeId: activity.storeId,
    userId: activity.userId,
    user: userMap.get(activity.userId) || { name: null, email: 'Unknown User' },
    action: activity.action,
    resourceType: activity.resourceType,
    resourceId: activity.resourceId,
    resourceName: activity.resourceName || null,
    changes: activity.changes,
    metadata: activity.metadata,
    ipAddress: activity.ipAddress,
    createdAt: activity.createdAt.toISOString(),
  }));
}

/**
 * Get activity statistics for a store
 */
export async function getActivityStats(storeId: string): Promise<ActivityStats> {
  await connectToDatabase();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Run all queries in parallel
  const [
    totalChanges7Days,
    totalChanges24Hours,
    userActivityAgg,
    resourceTypeAgg,
    actionAgg,
  ] = await Promise.all([
    // Total changes in last 7 days
    Activity.countDocuments({
      storeId,
      createdAt: { $gte: sevenDaysAgo },
    }),

    // Total changes in last 24 hours
    Activity.countDocuments({
      storeId,
      createdAt: { $gte: twentyFourHoursAgo },
    }),

    // Most active user in last 7 days
    Activity.aggregate([
      { $match: { storeId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),

    // Most edited resource type in last 7 days
    Activity.aggregate([
      { $match: { storeId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$resourceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]),

    // Action breakdown in last 7 days
    Activity.aggregate([
      { $match: { storeId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  // Get most active user details
  let mostActiveUser: ActivityStats['mostActiveUser'] = null;
  if (userActivityAgg.length > 0) {
    const user = await User.findById(userActivityAgg[0]._id)
      .select('name email')
      .lean();
    if (user) {
      mostActiveUser = {
        userId: userActivityAgg[0]._id,
        name: (user as any).name || null,
        email: (user as any).email,
        count: userActivityAgg[0].count,
      };
    }
  }

  // Format most edited type
  const mostEditedType: ActivityStats['mostEditedType'] =
    resourceTypeAgg.length > 0
      ? {
          resourceType: resourceTypeAgg[0]._id,
          count: resourceTypeAgg[0].count,
        }
      : null;

  // Format action breakdown
  const actionBreakdown = actionAgg.map((item: any) => ({
    action: item._id,
    count: item.count,
  }));

  return {
    totalChanges7Days,
    totalChanges24Hours,
    mostActiveUser,
    mostEditedType,
    actionBreakdown,
  };
}

/**
 * Get team members for filter dropdown
 */
export async function getTeamMembersForFilter(
  storeId: string
): Promise<{ id: string; name: string | null; email: string }[]> {
  await connectToDatabase();

  const users = await User.find({ storeId })
    .select('_id name email')
    .lean();

  return users.map((u: any) => ({
    id: u._id.toString(),
    name: u.name || null,
    email: u.email,
  }));
}
