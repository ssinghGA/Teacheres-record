import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface FiltersProps {
    search: string;
    setSearch: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    subjectFilter: string;
    setSubjectFilter: (val: string) => void;
    quickDateFilter: string;
    setQuickDateFilter: (val: string) => void;
    uniqueSubjects: string[];
}

export default function Filters({
    search, setSearch,
    statusFilter, setStatusFilter,
    subjectFilter, setSubjectFilter,
    quickDateFilter, setQuickDateFilter,
    uniqueSubjects
}: FiltersProps) {

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by student, topic, or date..."
                        className="pl-9 h-10 w-full"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <Select value={subjectFilter} onValueChange={v => setSubjectFilter(v ?? 'all')}>
                    <SelectTrigger className="w-full sm:w-40 h-10">
                        <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {uniqueSubjects.map(sub => (
                            <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? 'all')}>
                    <SelectTrigger className="w-full sm:w-40 h-10">
                        <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="rescheduled">Rescheduled</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2 font-medium">Quick Filters:</span>
                {['all', 'today', 'this_week', 'this_month'].map(filter => (
                    <Button
                        key={filter}
                        variant={quickDateFilter === filter ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setQuickDateFilter(filter)}
                        className="h-8 rounded-full px-4 text-xs"
                    >
                        {filter === 'all' ? 'All Time' :
                            filter === 'today' ? 'Today' :
                                filter === 'this_week' ? 'This Week' : 'This Month'}
                    </Button>
                ))}
            </div>
        </div>
    );
}
