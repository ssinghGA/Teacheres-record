/**
 * PDF Download Utility using jsPDF + html2canvas
 * Captures a DOM element and saves it as a high-quality PDF.
 */

export async function downloadElementAsPdf(
    elementId: string,
    filename: string = 'student-report.pdf'
) {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element #${elementId} not found`);

    // Temporarily expand element for capture
    const originalStyle = element.style.cssText;
    element.style.width = '794px'; // A4 width in px at 96dpi

    const canvas = await html2canvas(element, {
        scale: 2,           // 2x for high-res
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
    });

    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Convert canvas px → mm (96dpi → 25.4mm/inch)
    const ratio = pdfWidth / (imgWidth / 2);
    const totalHeightMm = (imgHeight / 2) * ratio;

    // Multi-page support if content is longer than one A4
    let yPos = 0;
    let pageNum = 0;
    while (yPos < totalHeightMm) {
        if (pageNum > 0) pdf.addPage();
        pdf.addImage(
            imgData,
            'JPEG',
            0,
            -yPos,
            pdfWidth,
            (imgHeight / imgWidth) * pdfWidth * (imgWidth / (imgWidth / 2))
        );
        yPos += pdfHeight;
        pageNum++;
    }

    pdf.save(filename);
}
