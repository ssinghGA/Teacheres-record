import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, CheckCircle, CalendarClock, IndianRupee } from "lucide-react";

interface StatsCardsProps {
    totalClasses: number;
    completedClasses: number;
    scheduledClasses: number;
    totalEarnings: number;
}

export default function StatsCards({ totalClasses, completedClasses, scheduledClasses, totalEarnings }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="shadow-sm border border-border bg-card">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Classes</p>
                        <p className="text-2xl font-bold text-foreground">{totalClasses}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border border-border bg-card">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                        <p className="text-2xl font-bold text-foreground">{completedClasses}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border border-border bg-card">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Scheduled</p>
                        <p className="text-2xl font-bold text-foreground">{scheduledClasses}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                        <CalendarClock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border border-border bg-card">
                <CardContent className="p-5 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</p>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            ₹{totalEarnings.toLocaleString('en-IN')}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
