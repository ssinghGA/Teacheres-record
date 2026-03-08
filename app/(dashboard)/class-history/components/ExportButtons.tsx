import { Button } from "@/components/ui/button";
import { Download, FileText, FileSpreadsheet, FileIcon } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type ApiClass } from "@/lib/hooks/useClasses";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonsProps {
    data: ApiClass[];
}

export default function ExportButtons({ data }: ExportButtonsProps) {
    const getStudentName = (c: ApiClass) =>
        typeof c.studentId === 'object' ? c.studentId.name : 'N/A';

    const prepareData = () => {
        return data.map(c => ({
            Student: getStudentName(c),
            Subject: c.subject,
            Topic: c.topic,
            Date: format(new Date(c.date), 'dd MMM yyyy'),
            Time: c.time,
            Duration: `${c.duration} min`,
            Amount: `₹${c.amount}`,
            Status: c.status
        }));
    };

    const exportCSV = () => {
        const ws = XLSX.utils.json_to_sheet(prepareData());
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "class_history.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(prepareData());
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Class History");
        XLSX.writeFile(wb, "class_history.xlsx");
    };

    const exportPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Class History Report", 14, 22);

        doc.setFontSize(11);
        doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 30);

        const tableData = data.map(c => [
            getStudentName(c),
            c.subject,
            c.topic,
            `${format(new Date(c.date), 'dd MMM yyyy')} ${c.time}`,
            `${c.duration} min`,
            `Rs. ${c.amount}`,
            c.status.toUpperCase()
        ]);

        autoTable(doc, {
            startY: 40,
            head: [['Student', 'Subject', 'Topic', 'Date & Time', 'Duration', 'Amount', 'Status']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [59, 130, 246] },
        });

        doc.save("class_history.pdf");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2">
                <Download className="w-4 h-4" />
                Export
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={exportCSV} className="cursor-pointer gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportExcel} className="cursor-pointer gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportPDF} className="cursor-pointer gap-2">
                    <FileIcon className="w-4 h-4 text-rose-500" />
                    Export as PDF
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
