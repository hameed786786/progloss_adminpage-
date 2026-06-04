import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/app/TopBar";
import { Surface, SectionTitle } from "@/components/app/Surface";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  PieChart,
  Pie,
  Line,
  LineChart,
} from "recharts";
import { useState } from "react";
import {
  useAnalytics,
  useCustomers,
  useStaff,
  useApartments,
  useWorkOrders,
  useGateways,
  usePayments,
} from "@/lib/hooks/api";
import { AsyncState } from "@/components/app/AsyncState";
import { TrendingUp, Users, Wrench, RefreshCw, Home } from "lucide-react";

export const Route = createFileRoute("/_app/analytics")({ component: Analytics });

const tabs = ["Revenue", "Customers", "Staff", "Subscriptions", "Apartments"];
const tabIcons = [TrendingUp, Users, Wrench, RefreshCw, Home];

const tooltipStyle = {
  background: "white",
  border: "1px solid oklch(0.92 0.008 250)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
};
const axis = { fontSize: 11, fill: "oklch(0.52 0.02 256)" };

const pieColors = [
  "oklch(0.62 0.14 230)", // Blue
  "oklch(0.48 0.16 258)", // Indigo
  "oklch(0.55 0.21 25)",  // Red
  "oklch(0.74 0.15 75)",   // Amber
  "oklch(0.62 0.14 160)",  // Teal
  "oklch(0.60 0.15 10)",   // Rose
];

function Analytics() {
  const [tab, setTab] = useState(0);

  const { data: analyticsData = {}, isLoading: isAnalyticsLoading, error: analyticsError } = useAnalytics();
  const { data: customersData = [], isLoading: isCustomersLoading, error: customersError } = useCustomers();
  const { data: staffData = [], isLoading: isStaffLoading, error: staffError } = useStaff();
  const { data: apartmentsData = [], isLoading: isApartmentsLoading, error: apartmentsError } = useApartments();
  const { data: workOrdersData = [], isLoading: isWorkOrdersLoading, error: workOrdersError } = useWorkOrders();
  const { data: gatewaysData, isLoading: isGatewaysLoading, error: gatewaysError } = useGateways();
  const { data: paymentsData = [], isLoading: isPaymentsLoading, error: paymentsError } = usePayments();

  const isLoading =
    isAnalyticsLoading ||
    isCustomersLoading ||
    isStaffLoading ||
    isApartmentsLoading ||
    isWorkOrdersLoading ||
    isGatewaysLoading ||
    isPaymentsLoading;

  const error =
    analyticsError ||
    customersError ||
    staffError ||
    apartmentsError ||
    workOrdersError ||
    gatewaysError ||
    paymentsError;

  const revenueTrend = analyticsData.revenueTrend || [];
  const subscriptionGrowth = analyticsData.subscriptionGrowth || [];

  // ==========================================
  // 1. REVENUE SECTION COMPUTATIONS
  // ==========================================
  const revenueTrendWithChurn = revenueTrend.map((item: any, idx: number) => {
    const churnVal = item.churn ?? (subscriptionGrowth[idx] ? parseFloat(((subscriptionGrowth[idx].churn / 1000) * 100).toFixed(1)) : 1.2);
    return {
      ...item,
      churn: churnVal
    };
  });

  const revContribPieData = apartmentsData.map((a: any, i: number) => ({
    n: a.name.split(" ")[0],
    v: a.mrr,
    c: pieColors[i % pieColors.length]
  }));

  const gatewayVolumeData = (gatewaysData?.gateways || []).map((g: any) => ({
    name: g.name,
    volume: g.volume || 0
  }));

  // ==========================================
  // 2. CUSTOMERS SECTION COMPUTATIONS
  // ==========================================
  let currentActive = 1200;
  const customerTrend = subscriptionGrowth.map((sg: any) => {
    currentActive += (sg.new - sg.churn);
    return {
      m: sg.m,
      value: currentActive
    };
  });

  const planCounts = customersData.reduce((acc: Record<string, number>, cust) => {
    if (cust.plan && cust.status === 'active') {
      acc[cust.plan] = (acc[cust.plan] || 0) + 1;
    }
    return acc;
  }, {});

  const planPieData = Object.entries(planCounts).map(([n, v], i) => ({
    n,
    v,
    c: pieColors[i % pieColors.length]
  }));

  const safePlanPieData = planPieData.length > 0 ? planPieData : [
    { n: "Eco Weekly", v: 412, c: "oklch(0.62 0.14 230)" },
    { n: "Premium", v: 638, c: "oklch(0.48 0.16 258)" },
    { n: "Royal", v: 281, c: "oklch(0.55 0.21 25)" },
    { n: "Fleet", v: 47, c: "oklch(0.74 0.15 75)" },
  ];

  const customerDistData = apartmentsData.map((a: any) => ({
    name: a.name.replace(/Gate \d|Vista \d|Heights|Sadaf \d|Sanibel|Villa \d+/g, "").trim(),
    value: a.residents
  }));

  // ==========================================
  // 3. STAFF SECTION COMPUTATIONS
  // ==========================================
  const staffChartData = staffData.map((s: any) => {
    const hrStr = s.hours || "";
    const hoursNum = parseFloat(hrStr.replace(/[^\d.]/g, "")) || 0;
    const completedWashes = workOrdersData.filter(
      (wo: any) => wo.tech === s.name && wo.status === "completed"
    ).length;
    const totalWashes = workOrdersData.filter((wo: any) => wo.tech === s.name).length;

    return {
      name: s.name.split(" ")[0],
      hours: hoursNum,
      washes: totalWashes,
      completedWashes,
    };
  });

  const attendanceCounts = staffData.reduce((acc: Record<string, number>, s: any) => {
    const state = s.attendanceState || "On time";
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {});

  const attendanceColors = ["oklch(0.62 0.14 160)", "oklch(0.74 0.15 75)", "oklch(0.60 0.15 10)"];
  const attendancePieData = Object.entries(attendanceCounts).map(([n, v], i) => ({
    n,
    v,
    c: attendanceColors[i % attendanceColors.length]
  }));

  const safeAttendancePieData = attendancePieData.length > 0 ? attendancePieData : [
    { n: "On time", v: 5, c: "oklch(0.62 0.14 160)" },
    { n: "Late", v: 1, c: "oklch(0.74 0.15 75)" },
    { n: "Absent", v: 1, c: "oklch(0.60 0.15 10)" },
  ];

  const zoneCounts = staffData.reduce((acc: Record<string, number>, s: any) => {
    const zone = s.zone && s.zone !== "—" ? s.zone : "Unassigned";
    acc[zone] = (acc[zone] || 0) + 1;
    return acc;
  }, {});

  const zoneChartData = Object.entries(zoneCounts).map(([name, count]) => ({
    name,
    count
  }));

  const woStatusCounts = workOrdersData.reduce((acc: Record<string, number>, wo: any) => {
    const status = wo.status || "queued";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const woStatusChartData = Object.entries(woStatusCounts).map(([name, count]) => ({
    name,
    count
  }));

  // ==========================================
  // 4. SUBSCRIPTIONS SECTION COMPUTATIONS
  // ==========================================
  const freqCounts: Record<string, number> = {};
  for (const c of customersData) {
    if (c.plan) {
      let freq = "Monthly";
      if (c.plan.includes("Weekly")) freq = "Weekly";
      else if (c.plan.includes("Bi-weekly")) freq = "Bi-weekly";
      freqCounts[freq] = (freqCounts[freq] || 0) + 1;
    }
  }

  const freqPieData = Object.entries(freqCounts).map(([n, v], i) => ({
    n,
    v,
    c: pieColors[i % pieColors.length]
  }));

  const safeFreqPieData = freqPieData.length > 0 ? freqPieData : [
    { n: "Weekly", v: 412, c: "oklch(0.62 0.14 230)" },
    { n: "Bi-weekly", v: 638, c: "oklch(0.48 0.16 258)" },
    { n: "Monthly", v: 328, c: "oklch(0.74 0.15 75)" },
  ];

  const subSignupTrend = subscriptionGrowth.map((sg: any) => ({
    m: sg.m,
    value: sg.new
  }));

  const subActiveTrend = subscriptionGrowth.map((sg: any, idx: number) => {
    let sum = 900;
    for (let i = 0; i <= idx; i++) {
      sum += (subscriptionGrowth[i].new - subscriptionGrowth[i].churn);
    }
    return { m: sg.m, value: sum };
  });

  // ==========================================
  // 5. APARTMENTS SECTION COMPUTATIONS
  // ==========================================
  const apartmentsChartData = apartmentsData.map((a: any) => ({
    ...a,
    shortName: a.name.replace(/Gate \d|Vista \d|Heights|Sadaf \d|Sanibel|Villa \d+/g, "").trim() || a.name
  }));

  const sizePieData = apartmentsData.map((a: any, i: number) => ({
    n: a.name.split(" ")[0],
    v: a.units,
    c: pieColors[i % pieColors.length]
  }));

  const occupancyChartData = apartmentsChartData.map((a: any) => ({
    name: a.shortName,
    occupancy: a.occupancy
  }));

  const complaintsChartData = apartmentsChartData.map((a: any) => ({
    name: a.shortName,
    complaints: a.complaints
  }));

  // ==========================================
  // DYNAMIC CHART RENDERING LOGIC
  // ==========================================

  const renderMainChart = () => {
    switch (tab) {
      case 0: // Revenue
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.48 0.16 258)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.48 0.16 258)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
              <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `AED ${v}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`AED ${val}k`, "Revenue (MRR)"]} />
              <Area type="monotone" dataKey="mrr" stroke="oklch(0.48 0.16 258)" strokeWidth={2.5} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 1: // Customers
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={customerTrend}>
              <defs>
                <linearGradient id="colorCust" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.62 0.14 160)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.62 0.14 160)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
              <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => [val, "Active Customers"]} />
              <Area type="monotone" dataKey="value" stroke="oklch(0.62 0.14 160)" strokeWidth={2.5} fill="url(#colorCust)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 2: // Staff
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={staffChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
              <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="hours" name="Hours Worked" fill="oklch(0.74 0.15 75)" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="washes" name="Assigned Washes" fill="oklch(0.48 0.16 258)" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 3: // Subscriptions
        return (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={subscriptionGrowth}>
              <defs>
                <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.62 0.14 160)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.62 0.14 160)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorChurn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.60 0.15 10)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="oklch(0.60 0.15 10)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
              <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="new" name="New Signups" stroke="oklch(0.62 0.14 160)" strokeWidth={2.5} fill="url(#colorNew)" />
              <Area type="monotone" dataKey="churn" name="Cancellations" stroke="oklch(0.60 0.15 10)" strokeWidth={2.5} fill="url(#colorChurn)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 4: // Apartments
        return (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={apartmentsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
              <XAxis dataKey="shortName" tick={axis} axisLine={false} tickLine={false} />
              <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `AED ${v}`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val, name) => {
                if (name === "mrr") return [`AED ${val.toLocaleString()}`, "Monthly Revenue"];
                return [val, name];
              }} />
              <Bar dataKey="mrr" name="mrr" fill="oklch(0.48 0.16 258)" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderRightWidget = () => {
    let title = "";
    let subtitle = "";
    let dataList: any[] = [];

    switch (tab) {
      case 0:
        title = "Revenue Contribution";
        subtitle = "MRR share by building";
        dataList = revContribPieData;
        break;
      case 1:
        title = "Plan Mix";
        subtitle = "Active subscription types";
        dataList = safePlanPieData;
        break;
      case 2:
        title = "Technician Attendance";
        subtitle = "Punctuality distribution";
        dataList = safeAttendancePieData;
        break;
      case 3:
        title = "Billing Frequency";
        subtitle = "Weekly vs monthly mix";
        dataList = safeFreqPieData;
        break;
      case 4:
        title = "Size Distribution";
        subtitle = "Total residential units";
        dataList = sizePieData;
        break;
    }

    return (
      <Surface>
        <SectionTitle title={title} sub={subtitle} />
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={dataList}
              dataKey="v"
              nameKey="n"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {dataList.map((d, i) => (
                <Cell key={i} fill={d.c} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-2 space-y-1.5 text-[12px] max-h-[140px] overflow-y-auto pr-1">
          {dataList.map((d) => (
            <div key={d.n} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.c }} />
                {d.n}
              </div>
              <span className="tabular-nums font-bold">
                {tab === 0 ? `AED ${d.v.toLocaleString()}` : d.v.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Surface>
    );
  };

  const renderBottomLeftWidget = () => {
    switch (tab) {
      case 0: // Revenue -> Gateway volume
        return (
          <Surface>
            <SectionTitle title="Gateway Volume" sub="Total transaction volume handled (AED)" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={gatewayVolumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `AED ${v}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`AED ${val.toLocaleString()}`, "Volume"]} />
                <Bar dataKey="volume" fill="oklch(0.48 0.16 258)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Surface>
        );
      case 1: // Customers -> New vs churn
        return (
          <Surface>
            <SectionTitle title="New vs churn" sub="Subscription movement" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={subscriptionGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="new" name="New Signups" fill="oklch(0.62 0.14 160)" radius={[6, 6, 0, 0]} maxBarSize={22} />
                <Bar dataKey="churn" name="Cancellations" fill="oklch(0.60 0.15 10)" radius={[6, 6, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </Surface>
        );
      case 2: // Staff -> Techs per zone
        return (
          <Surface>
            <SectionTitle title="Technicians by Zone" sub="Staff counts across operations zones" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={zoneChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Technicians" fill="oklch(0.74 0.15 75)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Surface>
        );
      case 3: // Subscriptions -> Signups trend
        return (
          <Surface>
            <SectionTitle title="New Subscriptions" sub="Monthly signups trend" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={subSignupTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="New Subscriptions" fill="oklch(0.62 0.14 230)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Surface>
        );
      case 4: // Apartments -> Occupancy
        return (
          <Surface>
            <SectionTitle title="Occupancy Rate" sub="Active resident occupancy (%)" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={occupancyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val}%`, "Occupancy"]} />
                <Bar dataKey="occupancy" fill="oklch(0.62 0.14 160)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Surface>
        );
      default:
        return null;
    }
  };

  const renderBottomRightWidget = () => {
    switch (tab) {
      case 0: // Revenue -> Churn rate
        return (
          <Surface>
            <SectionTitle title="Churn Rate" sub="Monthly percentage revenue loss" />
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueTrendWithChurn}>
                <defs>
                  <linearGradient id="colorChurnRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.60 0.15 10)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="oklch(0.60 0.15 10)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => [`${val}%`, "Churn Rate"]} />
                <Area type="monotone" dataKey="churn" stroke="oklch(0.60 0.15 10)" strokeWidth={2.5} fill="url(#colorChurnRate)" />
              </AreaChart>
            </ResponsiveContainer>
          </Surface>
        );
      case 1: // Customers -> Customer Distribution
        return (
          <Surface>
            <SectionTitle title="Customer distribution" sub="Residents serviced by community" />
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={customerDistData}>
                <defs>
                  <linearGradient id="colorCustDist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.62 0.14 160)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="oklch(0.62 0.14 160)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => [val, "Residents"]} />
                <Area type="monotone" dataKey="value" stroke="oklch(0.62 0.14 160)" strokeWidth={2.5} fill="url(#colorCustDist)" />
              </AreaChart>
            </ResponsiveContainer>
          </Surface>
        );
      case 2: // Staff -> Work order states
        return (
          <Surface>
            <SectionTitle title="Work Order Statuses" sub="Total washes by status categories" />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={woStatusChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Washes" fill="oklch(0.48 0.16 258)" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Surface>
        );
      case 3: // Subscriptions -> Active subscriptions
        return (
          <Surface>
            <SectionTitle title="Active Subscription Base" sub="Total cumulative subscriptions" />
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={subActiveTrend}>
                <defs>
                  <linearGradient id="colorSubActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.62 0.14 230)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="oklch(0.62 0.14 230)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="m" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="value" name="Active Subscriptions" stroke="oklch(0.62 0.14 230)" strokeWidth={2.5} fill="url(#colorSubActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </Surface>
        );
      case 4: // Apartments -> Complaints
        return (
          <Surface>
            <SectionTitle title="Logged Complaints" sub="Total resident complaints by building" />
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={complaintsChartData}>
                <defs>
                  <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.60 0.15 10)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="oklch(0.60 0.15 10)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.93 0.008 250)" vertical={false} />
                <XAxis dataKey="name" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(val) => [val, "Complaints"]} />
                <Area type="monotone" dataKey="complaints" stroke="oklch(0.60 0.15 10)" strokeWidth={2.5} fill="url(#colorComp)" />
              </AreaChart>
            </ResponsiveContainer>
          </Surface>
        );
      default:
        return null;
    }
  };

  const getSubTitle = () => {
    switch (tab) {
      case 0:
        return "Monthly revenue (MRR) · last 6 months";
      case 1:
        return "Active customer growth · last 6 months";
      case 2:
        return "Hours worked and completed washes by technician";
      case 3:
        return "Monthly new registrations vs cancellations";
      case 4:
        return "Monthly recurring revenue by building";
      default:
        return "Monthly · last 6 months";
    }
  };

  return (
    <>
      <TopBar
        title="Analytics Hub"
        subtitle="Cross-module insights · May 2026 · UAE"
        actions={
          <button className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-[12.5px] font-bold hover:bg-accent">
            Last 30 days
          </button>
        }
      />
      <AsyncState isLoading={isLoading} error={error as Error | null}>
        <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-4">
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-card w-fit overflow-x-auto max-w-full">
            {tabs.map((t, i) => {
              const Icon = tabIcons[i];
              return (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-[12.5px] font-bold transition-all whitespace-nowrap ${
                    tab === i
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t}
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <Surface className="xl:col-span-2">
              <SectionTitle title={`${tabs[tab]} distribution`} sub={getSubTitle()} />
              {renderMainChart()}
            </Surface>
            {renderRightWidget()}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {renderBottomLeftWidget()}
            {renderBottomRightWidget()}
          </div>
        </div>
      </AsyncState>
    </>
  );
}
