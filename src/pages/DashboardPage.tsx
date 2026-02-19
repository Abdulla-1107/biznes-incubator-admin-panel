import { LayoutDashboard, Rocket, GraduationCap, Wrench, CalendarDays, FileText, Mail } from "lucide-react";
import { StatsCard } from "@/shared/ui/StatsCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const barData = [
  { month: "Yan", count: 12 },
  { month: "Fev", count: 19 },
  { month: "Mar", count: 8 },
  { month: "Apr", count: 15 },
  { month: "May", count: 22 },
  { month: "Iyun", count: 30 },
];

const pieData = [
  { name: "Yangi", value: 18, color: "hsl(205, 85%, 50%)" },
  { name: "Ko'rilmoqda", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Qabul qilingan", value: 25, color: "hsl(152, 69%, 40%)" },
  { name: "Rad etilgan", value: 5, color: "hsl(0, 72%, 51%)" },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Boshqaruv paneli"
        description="BiznesIncubator admin panelga xush kelibsiz"
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard title="Startuplar" value={42} icon={Rocket} trend="+12% bu oy" trendUp />
        <StatsCard title="Mentorlar" value={18} icon={GraduationCap} trend="+3 yangi" trendUp />
        <StatsCard title="Xizmatlar" value={24} icon={Wrench} />
        <StatsCard title="Tadbirlar" value={8} icon={CalendarDays} trend="2 ta kelasi hafta" trendUp />
        <StatsCard title="Yangi arizalar" value={15} icon={FileText} trend="+5 bugun" trendUp />
        <StatsCard title="Contactlar" value={7} icon={Mail} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Tadbirlar (oylar bo'yicha)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Arizalar holati</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--card-foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 justify-center mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
