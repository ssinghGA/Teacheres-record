'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('ellipsis');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }

            if (currentPage < totalPages - 2) pages.push('ellipsis');
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-card/50">
            <div className="text-xs text-muted-foreground">
                Page <span className="font-medium text-foreground">{currentPage}</span> of{' '}
                <span className="font-medium text-foreground">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 mx-1">
                    {getPageNumbers().map((page, i) => (
                        page === 'ellipsis' ? (
                            <div key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </div>
                        ) : (
                            <Button
                                key={`page-${page}`}
                                variant={currentPage === page ? 'default' : 'ghost'}
                                size="sm"
                                className={`h-8 w-8 text-xs ${currentPage === page ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                                onClick={() => onPageChange(page as number)}
                            >
                                {page}
                            </Button>
                        )
                    ))}
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
