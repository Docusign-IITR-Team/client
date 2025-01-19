import { NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(request: Request) {
  try {
    const { content, fileName } = await request.json();

    // Create new jsPDF instance
    const doc = new jsPDF();

    // Split content into lines that fit the page width
    const lines = doc.splitTextToSize(content, 180); // 180 is a good width for A4

    // Add text to PDF
    doc.setFontSize(12);
    let y = 20; // Starting y position
    let pageHeight = doc.internal.pageSize.height - 20; // Page height minus margins

    // Add lines page by page
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight) {
        doc.addPage();
        y = 20; // Reset Y position
      }
      doc.text(lines[i], 15, y);
      y += 7; // Line height
    }

    // Get PDF as array buffer
    const pdfBuffer = doc.output('arraybuffer');

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
