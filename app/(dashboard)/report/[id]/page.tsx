'use client';

import { useState, use } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStudent } from '@/lib/hooks/useStudents';
import { useReports } from '@/lib/hooks/useReports';
import { useClasses } from '@/lib/hooks/useClasses';
import { useTeacher } from '@/lib/hooks/useTeachers';
import { Button } from '@/components/ui/button';
import { Download, Loader2, ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { ApiReport } from '@/lib/hooks/useReports';
import type { ApiClass } from '@/lib/hooks/useClasses';

export default function StudentReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: studentId } = use(params);
    const { user } = useAuth();
    const [downloading, setDownloading] = useState(false);

    const { data: student, isLoading: loadingStudent } = useStudent(studentId);
    const { data: reportsData, isLoading: loadingReports } = useReports({ studentId });
    const { data: classesData, isLoading: loadingClasses } = useClasses({ studentId });
    const { data: teacher } = useTeacher(user?._id ?? '');

    const reports = reportsData?.reports ?? [];
    const classes = classesData?.classes ?? [];

    const isLoading = loadingStudent || loadingReports || loadingClasses;

    const completedClasses = classes.filter(c => c.status === 'completed').length;
    const avgUnderstanding = reports.length > 0
        ? (reports.reduce((s, r) => s + r.understandingLevel, 0) / reports.length).toFixed(1)
        : 'N/A';

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const { downloadElementAsPdf } = await import('@/lib/downloadPdf');
            await downloadElementAsPdf(
                'student-report-content',
                `report-${student?.name?.replace(/\s+/g, '-') ?? 'student'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`
            );
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => window.print();

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-sm text-gray-500">Generating report...</p>
            </div>
        </div>
    );

    const reportDate = format(new Date(), 'dd MMMM yyyy');
    const teacherName = teacher?.name ?? user?.name ?? 'Teacher';
    const teacherQual = teacher?.qualification ?? '';
    const teacherPhone = teacher?.phone ?? '';
    const teacherSubjects = (teacher?.subjects ?? user?.subjects ?? []).join(', ');

    return (
        <div className="min-h-screen" style={{ background: 'var(--background)' }}>
            {/* Action bar — hidden on print */}
            <div className="no-print sticky top-0 z-10 border-b px-6 py-3 flex items-center justify-between backdrop-blur-sm"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <Link href="/progress-reports" className="flex items-center gap-2 text-sm hover:text-blue-600 transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                    <ArrowLeft className="w-4 h-4" /> Back to Reports
                </Link>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                        <Printer className="w-4 h-4" /> Print
                    </Button>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        onClick={handleDownload}
                        disabled={downloading}
                    >
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {downloading ? 'Generating...' : 'Download PDF'}
                    </Button>
                </div>
            </div>

            {/* Report Content */}
            <div className="py-8 px-4 flex justify-center">
                <div
                    id="student-report-content"
                    className="pdf-content"
                    style={{
                        width: '794px',
                        minHeight: '1123px',
                        background: '#ffffff',
                        color: '#1a1a2e',
                        fontFamily: "'Inter', 'Georgia', 'Times New Roman', serif",
                        borderRadius: '0',
                        overflow: 'visible',
                        position: 'relative',
                    }}
                >
                    {/* ── Header Band ───────────────────────────────────────────── */}
                    <div style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)', padding: '0 0 0 0', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative circles */}
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                        <div style={{ position: 'absolute', bottom: -20, left: 160, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

                        <div style={{ padding: '32px 40px 24px', position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                        {/* Logo mark */}
                                        <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.3)' }}>
                                            <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>SL</span>
                                        </div>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: 0.5 }}>SRV Learning</div>
                                            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase' }}>Student Progress Report</div>
                                        </div>
                                    </div>
                                    <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: 0.3 }}>Student Progress Report</h1>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, margin: '4px 0 0', fontStyle: 'italic' }}>
                                        Comprehensive Academic Performance Summary
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Report Date</div>
                                        <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{reportDate}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginTop: 4 }}>Academic Year 2024–25</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Blue accent bar */}
                        <div style={{ height: 4, background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #34d399)' }} />
                    </div>

                    <div style={{ padding: '32px 40px' }}>

                        {/* ── Student & Teacher Info Grid ──────────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
                            {/* Student Card */}
                            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                                <div style={{ background: '#f0f7ff', padding: '10px 16px', borderBottom: '1.5px solid #e2e8f0' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#1e40af' }}>Student Information</span>
                                </div>
                                <div style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 8, background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                                            {(student?.name ?? '?').split(' ').map(n => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{student?.name ?? 'N/A'}</div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>{student?.class ?? ''}</div>
                                        </div>
                                    </div>
                                    <InfoRow label="School" value={student?.school ?? 'N/A'} />
                                    <InfoRow label="Subject" value={student?.subject ?? 'N/A'} />
                                    <InfoRow label="Email" value={student?.email ?? 'N/A'} />
                                    <InfoRow label="Parent" value={student?.parentName ?? 'N/A'} />
                                    <InfoRow label="Phone" value={student?.parentPhone ?? 'N/A'} />
                                    <InfoRow label="Enrolled" value={student?.startDate ? format(new Date(student.startDate), 'dd MMM yyyy') : 'N/A'} />
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>Status</span>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: student?.status === 'active' ? '#16a34a' : '#dc2626', background: student?.status === 'active' ? '#f0fdf4' : '#fef2f2', padding: '2px 10px', borderRadius: 20, border: `1px solid ${student?.status === 'active' ? '#bbf7d0' : '#fecaca'}`, textTransform: 'capitalize' }}>
                                            {student?.status ?? 'active'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Teacher Card */}
                            <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                                <div style={{ background: '#faf5ff', padding: '10px 16px', borderBottom: '1.5px solid #e2e8f0' }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#7c3aed' }}>Teacher Information</span>
                                </div>
                                <div style={{ padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 42, height: 42, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
                                            {teacherName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{teacherName}</div>
                                            <div style={{ fontSize: 12, color: '#64748b' }}>{teacherQual}</div>
                                        </div>
                                    </div>
                                    <InfoRow label="Subjects" value={teacherSubjects || 'N/A'} />
                                    <InfoRow label="Phone" value={teacherPhone || 'N/A'} />
                                    <InfoRow label="City" value={teacher?.city ?? 'N/A'} />
                                    <InfoRow label="Experience" value={teacher?.experience !== undefined ? `${teacher.experience} years` : 'N/A'} />
                                </div>
                            </div>
                        </div>

                        {/* ── Performance Summary Cards ────────────────────────────── */}
                        <div style={{ marginBottom: 28 }}>
                            <SectionTitle color="#1e40af">Performance Overview</SectionTitle>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 12 }}>
                                {[
                                    { label: 'Classes Attended', value: completedClasses, unit: `/ ${classes.length} total`, color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
                                    { label: 'Avg Understanding', value: avgUnderstanding, unit: '/ 5.0', color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
                                ].map(s => (
                                    <div key={s.label} style={{ background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 10, padding: '14px 14px 12px' }}>
                                        <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                                        <div style={{ fontSize: 10, color: s.color, opacity: 0.7, marginBottom: 2 }}>{s.unit}</div>
                                        <div style={{ fontSize: 11, color: '#475569', fontWeight: 600 }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Understanding Level Bar ──────────────────────────────── */}
                        {reports.length > 0 && (
                            <div style={{ marginBottom: 28, border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', background: '#f8fafc' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>Understanding Level Trend</span>
                                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 400 }}>Across {reports.length} session{reports.length !== 1 ? 's' : ''}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 60 }}>
                                    {reports.slice(0, 10).map((r, i) => (
                                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                            <div style={{ width: '100%', borderRadius: '4px 4px 0 0', background: `linear-gradient(180deg, #3b82f6, #1d4ed8)`, height: `${(r.understandingLevel / 5) * 48}px`, minHeight: 6, transition: 'height 0.3s' }} />
                                            <span style={{ fontSize: 9, color: '#64748b' }}>{i + 1}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Session 1</span>
                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Level: 1 ← → 5</span>
                                    <span style={{ fontSize: 10, color: '#94a3b8' }}>Latest</span>
                                </div>
                            </div>
                        )}

                        {/* ── Progress Reports ─────────────────────────────────────── */}
                        {reports.length > 0 && (
                            <div style={{ marginBottom: 28 }}>
                                <SectionTitle color="#1e40af">Session-wise Progress Reports</SectionTitle>
                                <div style={{ marginTop: 12, border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '80px 90px 1fr 1fr 60px', background: '#1e3a8a', padding: '10px 14px' }}>
                                        {['Date', 'Subject', 'Topic Covered', 'Homework Given', 'Level'].map(h => (
                                            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</div>
                                        ))}
                                    </div>
                                    {reports.map((r, i) => (
                                        <div key={r._id} style={{ display: 'grid', gridTemplateColumns: '80px 90px 1fr 1fr 60px', padding: '10px 14px', background: i % 2 === 0 ? '#fff' : '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: 11, color: '#475569' }}>{format(new Date(r.date), 'dd MMM yy')}</div>
                                            <div style={{ fontSize: 11, color: '#475569' }}>{r.subject}</div>
                                            <div style={{ fontSize: 11, color: '#1e293b', paddingRight: 8 }}>{r.topicCovered}</div>
                                            <div style={{ fontSize: 11, color: '#475569', paddingRight: 8 }}>{r.homeworkGiven}</div>
                                            <div style={{ display: 'flex', gap: 2 }}>
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <span key={s} style={{ fontSize: 10, color: s <= r.understandingLevel ? '#f59e0b' : '#d1d5db' }}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Remarks Section ──────────────────────────────────────── */}
                        {reports.length > 0 && (
                            <div style={{ marginBottom: 28 }}>
                                <SectionTitle color="#1e40af">Teacher&apos;s Remarks</SectionTitle>
                                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {reports.map((r, i) => (
                                        <div key={r._id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '4px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '10px 14px' }}>
                                            <div style={{ fontSize: 10, color: '#92400e', fontWeight: 700, marginBottom: 4 }}>
                                                Session {i + 1} — {format(new Date(r.date), 'dd MMMM yyyy')} · {r.subject}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#78350f', fontStyle: 'italic' }}>&ldquo;{r.remarks}&rdquo;</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Class Sessions Table ─────────────────────────────────── */}
                        {classes.length > 0 && (
                            <div style={{ marginBottom: 28 }}>
                                <SectionTitle color="#1e40af">Class Session History</SectionTitle>
                                <div style={{ marginTop: 12, border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '90px 100px 1fr 60px 70px 80px', background: '#0f172a', padding: '10px 14px' }}>
                                        {['Date', 'Time', 'Topic', 'Duration', 'Amount', 'Status'].map(h => (
                                            <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.8, textTransform: 'uppercase' }}>{h}</div>
                                        ))}
                                    </div>
                                    {classes.map((c, i) => (
                                        <div key={c._id} style={{ display: 'grid', gridTemplateColumns: '90px 100px 1fr 60px 70px 80px', padding: '9px 14px', background: i % 2 === 0 ? '#fff' : '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                                            <div style={{ fontSize: 11, color: '#475569' }}>{format(new Date(c.date), 'dd MMM yy')}</div>
                                            <div style={{ fontSize: 11, color: '#475569' }}>{c.time}</div>
                                            <div style={{ fontSize: 11, color: '#1e293b' }}>{c.topic}</div>
                                            <div style={{ fontSize: 11, color: '#475569' }}>{c.duration}m</div>
                                            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>₹{c.amount}</div>
                                            <div>
                                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: c.status === 'completed' ? '#f0fdf4' : c.status === 'scheduled' ? '#fff7ed' : '#fef2f2', color: c.status === 'completed' ? '#16a34a' : c.status === 'scheduled' ? '#ea580c' : '#dc2626', border: `1px solid ${c.status === 'completed' ? '#bbf7d0' : c.status === 'scheduled' ? '#fed7aa' : '#fecaca'}`, textTransform: 'capitalize' }}>
                                                    {c.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{ display: 'grid', gridTemplateColumns: '90px 100px 1fr 60px 70px 80px', padding: '10px 14px', background: '#f0f9ff', borderTop: '2px solid #bae6fd' }}>
                                        <div style={{ gridColumn: '1 / 5', fontSize: 12, fontWeight: 700, color: '#0c4a6e' }}>Total ({classes.length} sessions)</div>
                                        <div style={{ fontSize: 13, fontWeight: 800, color: '#16a34a' }}>₹{classes.reduce((s, c) => s + c.amount, 0).toLocaleString('en-IN')}</div>
                                        <div />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Payment Summary REMOVED ── */}

                        {/* ── Signature Section ────────────────────────────────────── */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, marginTop: 16, paddingTop: 24, borderTop: '1.5px dashed #e2e8f0' }}>
                            {[
                                { label: "Teacher's Signature", name: teacherName },
                                { label: "Principal's Signature", name: '' },
                                { label: "Parent's Signature", name: student?.parentName ?? '' },
                            ].map(s => (
                                <div key={s.label} style={{ textAlign: 'center' }}>
                                    <div style={{ height: 48, borderBottom: '1.5px solid #334155', marginBottom: 8, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 6 }}>
                                        {s.name && <span style={{ fontSize: 14, color: '#334155', fontStyle: 'italic', fontFamily: 'cursive' }}>{s.name}</span>}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase' }}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* ── Footer ───────────────────────────────────────────────── */}
                        <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>
                                Generated by SRV Learning · {reportDate}
                            </div>
                            <div style={{ fontSize: 10, color: '#94a3b8' }}>
                                CONFIDENTIAL — For Official Use Only
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print styles */}
            <style>{`
        @media print {
          .no-print { display: none !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #student-report-content { box-shadow: none !important; }
        }
      `}</style>
        </div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
            <span style={{ color: '#94a3b8', minWidth: 60 }}>{label}</span>
            <span style={{ color: '#1e293b', fontWeight: 600, textAlign: 'right', maxWidth: 160, wordBreak: 'break-word' }}>{value}</span>
        </div>
    );
}

function SectionTitle({ children, color }: { children: React.ReactNode; color: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 4, height: 18, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: 14, fontWeight: 800, color, letterSpacing: 0.3 }}>{children}</span>
        </div>
    );
}
