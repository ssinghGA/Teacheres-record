'use client';

import { useReports } from '@/lib/hooks/useReports';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function StudentReportsPage() {
    const { data: reportsData, isLoading } = useReports();
    
    const myReports = reportsData?.reports ?? [];
    const sortedReports = [...myReports].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Progress Reports</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>
                    Review your teacher's feedback and performance ratings.
                </p>
            </div>

            {sortedReports.length === 0 ? (
                <Card className="border-0 shadow-sm" style={{ background: 'var(--card)' }}>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <TrendingUp className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
                        <p className="text-sm text-muted-foreground text-center">Your teacher has not published any progress reports yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedReports.map((report) => (
                        <Card key={report._id} className="shadow-sm border hover:shadow-md transition-shadow relative overflow-hidden" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                            <div className="absolute top-0 right-0 p-3">
                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                                    <span className="text-amber-500 font-bold text-xs">★</span>
                                    <span className="font-bold text-sm text-amber-700 dark:text-amber-400">{report.understandingLevel}/5</span>
                                </div>
                            </div>
                            <CardHeader className="pb-3 pr-20">
                                <CardTitle className="text-lg text-emerald-700 dark:text-emerald-400">{report.subject}</CardTitle>
                                <CardDescription className="font-medium text-foreground">{format(new Date(report.date), 'MMMM d, yyyy')}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Topic Covered</p>
                                    <p className="text-sm bg-muted/50 p-2.5 rounded-lg border border-border/50">{report.topicCovered}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Homework</p>
                                    <p className="text-sm bg-muted/50 p-2.5 rounded-lg border border-border/50">{report.homeworkGiven || 'None assigned'}</p>
                                </div>
                                {report.remarks && (
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">Teacher Remarks</p>
                                        <p className="text-sm italic bg-emerald-50 dark:bg-emerald-900/10 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                            "{report.remarks}"
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
