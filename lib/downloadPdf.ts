/**
 * PDF Download Utility using jsPDF + html2canvas
 * Captures a DOM element and saves it as a high-quality PDF.
 */

export async function downloadElementAsPdf(
    elementId: string,
    filename: string = 'student-report.pdf',
    options: { singlePage?: boolean; scale?: number } = {}
) {
    const { singlePage = true, scale = 2 } = options;
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');

    const element = document.getElementById(elementId);
    if (!element) throw new Error(`Element #${elementId} not found`);

    // Temporarily prepare element for capture
    const originalStyle = element.style.cssText;
    const currentWidth = element.offsetWidth;
    
    // Force a standard width for consistent PDF layout (A4 width at 96dpi is ~794px)
    element.style.width = '794px';
    element.style.maxWidth = 'none';

    try {
        const canvas = await html2canvas(element, {
            scale: scale,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 794,
            onclone: (doc) => {
                const clonedElement = doc.getElementById(elementId);
                if (clonedElement) {
                    clonedElement.style.width = '794px';
                    clonedElement.style.height = 'auto';
                }
            }
        });

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const imgWidthPx = canvas.width / scale;
        const imgHeightPx = canvas.height / scale;

        // Convert px to mm (1px = 0.264583mm at 96dpi)
        const pdfWidthMm = 210; // Fixed A4 width
        const pdfHeightMm = (imgHeightPx * pdfWidthMm) / imgWidthPx;

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: singlePage ? [pdfWidthMm, pdfHeightMm] : 'a4',
        });

        if (singlePage) {
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
        } else {
            const a4HeightMm = 297;
            let heightLeft = pdfHeightMm;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
            heightLeft -= a4HeightMm;

            while (heightLeft > 0) {
                position = heightLeft - pdfHeightMm;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidthMm, pdfHeightMm, undefined, 'FAST');
                heightLeft -= a4HeightMm;
            }
        }

        pdf.save(filename);
    } finally {
        element.style.cssText = originalStyle;
    }
}
