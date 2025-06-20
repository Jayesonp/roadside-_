import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const { dataType, format, data, filters } = await req.json();

    if (!dataType || !format || !data) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    let exportData: string;
    let contentType: string;
    let filename: string;

    if (format === "csv") {
      exportData = generateCSV(dataType, data);
      contentType = "text/csv";
      filename = `${dataType}_export_${new Date().toISOString().split("T")[0]}.csv`;
    } else if (format === "pdf") {
      exportData = await generatePDF(dataType, data);
      contentType = "application/pdf";
      filename = `${dataType}_export_${new Date().toISOString().split("T")[0]}.pdf`;
    } else {
      return new Response(JSON.stringify({ error: "Unsupported format" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(exportData, {
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return new Response(
      JSON.stringify({ error: "Export failed", details: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

function generateCSV(dataType: string, data: any[]): string {
  if (!data || data.length === 0) {
    return "No data available";
  }

  let headers: string[];
  let rows: string[][];

  switch (dataType) {
    case "emergency_requests":
      headers = [
        "ID",
        "User",
        "Service Type",
        "Location",
        "Status",
        "Time",
        "Membership",
      ];
      rows = data.map((item) => [
        item.id || "",
        item.user?.name || "",
        item.serviceType || "",
        item.location || "",
        item.status || "",
        item.time || "",
        item.user?.membershipType || "",
      ]);
      break;

    case "customers":
    case "technicians":
    case "partners":
    case "admins":
      headers = [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Status",
        "Created At",
        "Last Active",
      ];
      rows = data.map((item) => [
        item.id || "",
        item.name || "",
        item.email || "",
        item.phone || "",
        item.status || "",
        item.createdAt || "",
        item.lastActive || "",
      ]);

      // Add type-specific columns
      if (dataType === "customers") {
        headers.push("Membership", "Location", "Total Services", "Total Spent");
        rows = rows.map((row, index) => [
          ...row,
          data[index].membershipType || "",
          data[index].location || "",
          data[index].totalServices?.toString() || "",
          data[index].totalSpent || "",
        ]);
      } else if (dataType === "technicians") {
        headers.push(
          "Tech ID",
          "Rating",
          "Specialties",
          "Online",
          "Completed Jobs",
          "Earnings",
        );
        rows = rows.map((row, index) => [
          ...row,
          data[index].techId || "",
          data[index].rating || "",
          data[index].specialties?.join("; ") || "",
          data[index].isOnline ? "Yes" : "No",
          data[index].completedJobs?.toString() || "",
          data[index].earnings || "",
        ]);
      } else if (dataType === "partners") {
        headers.push(
          "Company",
          "Domain",
          "Plan",
          "Active Users",
          "Monthly Revenue",
        );
        rows = rows.map((row, index) => [
          ...row,
          data[index].companyName || "",
          data[index].domain || "",
          data[index].plan || "",
          data[index].activeUsers?.toString() || "",
          data[index].monthlyRevenue || "",
        ]);
      } else if (dataType === "admins") {
        headers.push("Role", "Permissions", "Last Login");
        rows = rows.map((row, index) => [
          ...row,
          data[index].role || "",
          data[index].permissions?.join("; ") || "",
          data[index].lastLogin || "",
        ]);
      }
      break;

    case "system_alerts":
      headers = [
        "ID",
        "Title",
        "Message",
        "Severity",
        "Category",
        "Status",
        "Priority",
        "Timestamp",
        "Source",
      ];
      rows = data.map((item) => [
        item.id || "",
        item.title || "",
        item.message || "",
        item.severity || "",
        item.category || "",
        item.status || "",
        item.priority || "",
        item.timestamp || "",
        item.source || "",
      ]);
      break;

    default:
      headers = Object.keys(data[0] || {});
      rows = data.map((item) =>
        headers.map((header) => item[header]?.toString() || ""),
      );
  }

  // Escape CSV values
  const escapeCSV = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const csvContent = [
    headers.map(escapeCSV).join(","),
    ...rows.map((row) => row.map(escapeCSV).join(",")),
  ].join("\n");

  return csvContent;
}

async function generatePDF(dataType: string, data: any[]): Promise<string> {
  // Simple HTML to PDF conversion using basic HTML structure
  // In a real implementation, you might use a library like Puppeteer or jsPDF

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${dataType.replace("_", " ").toUpperCase()} Export</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .metadata { color: #666; font-size: 12px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>${dataType.replace("_", " ").toUpperCase()} Export Report</h1>
      <div class="metadata">
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Records: ${data.length}</p>
      </div>
      ${generateHTMLTable(dataType, data)}
    </body>
    </html>
  `;

  // For now, return the HTML content as base64
  // In production, you would convert this to actual PDF
  const encoder = new TextEncoder();
  const htmlBytes = encoder.encode(htmlContent);
  return btoa(String.fromCharCode(...htmlBytes));
}

function generateHTMLTable(dataType: string, data: any[]): string {
  if (!data || data.length === 0) {
    return "<p>No data available</p>";
  }

  let headers: string[];
  let rows: string[][];

  switch (dataType) {
    case "emergency_requests":
      headers = ["ID", "User", "Service Type", "Location", "Status", "Time"];
      rows = data.map((item) => [
        item.id || "",
        item.user?.name || "",
        item.serviceType || "",
        item.location || "",
        item.status || "",
        item.time || "",
      ]);
      break;

    case "customers":
    case "technicians":
    case "partners":
    case "admins":
      headers = ["Name", "Email", "Status", "Created At"];
      rows = data.map((item) => [
        item.name || "",
        item.email || "",
        item.status || "",
        item.createdAt || "",
      ]);
      break;

    case "system_alerts":
      headers = ["Title", "Severity", "Category", "Status", "Timestamp"];
      rows = data.map((item) => [
        item.title || "",
        item.severity || "",
        item.category || "",
        item.status || "",
        item.timestamp || "",
      ]);
      break;

    default:
      headers = Object.keys(data[0] || {});
      rows = data.map((item) =>
        headers.map((header) => item[header]?.toString() || ""),
      );
  }

  const tableHTML = `
    <table>
      <thead>
        <tr>
          ${headers.map((header) => `<th>${header}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (row) => `
          <tr>
            ${row.map((cell) => `<td>${cell}</td>`).join("")}
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;

  return tableHTML;
}
