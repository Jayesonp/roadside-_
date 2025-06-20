import { corsHeaders } from "@shared/cors.ts";

interface ActivityItem {
  id: string;
  type:
    | "emergency"
    | "registration"
    | "payment"
    | "completion"
    | "assignment"
    | "location"
    | "notification"
    | "system"
    | "security";
  title: string;
  description: string;
  timestamp: string;
  priority: "high" | "medium" | "low";
  user?: string;
  location?: string;
  amount?: string;
}

// Simulate real-time activity data
const generateRealtimeActivities = (): ActivityItem[] => {
  const currentTime = new Date();
  const activities: ActivityItem[] = [];

  // Generate random activities based on current time
  const activityTypes = [
    {
      type: "emergency" as const,
      titles: ["Emergency Request", "Panic Button Activated", "SOS Signal"],
      descriptions: [
        "Battery jump start requested",
        "Tire change needed urgently",
        "Vehicle breakdown reported",
        "Accident assistance required",
      ],
      priority: "high" as const,
    },
    {
      type: "registration" as const,
      titles: ["New User Registration", "Premium Upgrade", "Account Created"],
      descriptions: [
        "joined as Premium Member",
        "upgraded to Pro account",
        "completed registration process",
      ],
      priority: "medium" as const,
    },
    {
      type: "payment" as const,
      titles: [
        "Payment Processed",
        "Subscription Renewed",
        "Transaction Complete",
      ],
      descriptions: [
        "Monthly subscription payment received",
        "Service payment processed",
        "Premium membership renewed",
      ],
      priority: "low" as const,
    },
    {
      type: "completion" as const,
      titles: ["Service Completed", "Request Fulfilled", "Task Finished"],
      descriptions: [
        "Tire change service completed successfully",
        "Battery jump completed",
        "Towing service finished",
      ],
      priority: "medium" as const,
    },
    {
      type: "assignment" as const,
      titles: ["Technician Assigned", "Service Allocated", "Request Assigned"],
      descriptions: [
        "assigned to towing service request",
        "allocated to emergency response",
        "dispatched to customer location",
      ],
      priority: "medium" as const,
    },
  ];

  const users = [
    "Sarah Mitchell",
    "Mike Johnson",
    "Emily Wilson",
    "Alex Thompson",
    "Mike Chen",
    "John Davis",
    "Lisa Rodriguez",
    "David Kim",
    "Anna Brown",
    "Chris Taylor",
    "Maria Garcia",
    "James Wilson",
  ];

  const locations = [
    "Downtown Area",
    "Highway 101",
    "Mall Parking",
    "Office Building",
    "Residential Area",
    "Shopping Center",
    "Airport Terminal",
    "Industrial Zone",
  ];

  const amounts = ["$29.99", "$49.99", "$19.99", "$89.99", "$39.99", "$59.99"];

  // Generate 5-10 recent activities
  const activityCount = Math.floor(Math.random() * 6) + 5;

  for (let i = 0; i < activityCount; i++) {
    const activityType =
      activityTypes[Math.floor(Math.random() * activityTypes.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const title =
      activityType.titles[
        Math.floor(Math.random() * activityType.titles.length)
      ];
    const description =
      activityType.descriptions[
        Math.floor(Math.random() * activityType.descriptions.length)
      ];

    // Calculate timestamp (within last 2 hours)
    const minutesAgo = Math.floor(Math.random() * 120) + 1;
    const timestamp =
      minutesAgo < 60
        ? `${minutesAgo} min ago`
        : `${Math.floor(minutesAgo / 60)}h ${minutesAgo % 60}m ago`;

    const activity: ActivityItem = {
      id: `ACT-${Date.now()}-${i}`,
      type: activityType.type,
      title,
      description: `${description} by ${user}`,
      timestamp,
      priority: activityType.priority,
      user,
      location: Math.random() > 0.3 ? location : undefined,
      amount:
        activityType.type === "payment"
          ? amounts[Math.floor(Math.random() * amounts.length)]
          : undefined,
    };

    activities.push(activity);
  }

  // Sort by most recent first
  return activities.sort((a, b) => {
    const aMinutes = parseInt(a.timestamp.split(" ")[0]);
    const bMinutes = parseInt(b.timestamp.split(" ")[0]);
    return aMinutes - bMinutes;
  });
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { limit = 10, offset = 0 } = await req.json().catch(() => ({}));

    // Generate real-time activities
    const allActivities = generateRealtimeActivities();
    const paginatedActivities = allActivities.slice(offset, offset + limit);

    return new Response(
      JSON.stringify({
        activities: paginatedActivities,
        total: allActivities.length,
        hasMore: offset + limit < allActivities.length,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch activity feed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
