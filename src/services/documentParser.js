import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function extractText(file) {
  const fileType = file.type;

  try {
    if (fileType === 'application/pdf') {
      return await extractPDFText(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return await extractDOCXText(file);
    } else {
      throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('Error extracting text:', error);
    throw error;
  }
}

async function extractPDFText(file) {
  try {
    console.log('Extracting text from PDF file...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('ArrayBuffer obtained, size:', arrayBuffer.byteLength);

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log(`PDF loaded. Pages: ${pdf.numPages}`);

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      console.log(`Raw text items on page ${i}:`, textContent.items.length);
      if (textContent.items.length > 0) {
        console.log('Example item structure:', JSON.stringify(textContent.items[0]));
      }

      // Better text extraction that handles different item structures
      const pageText = textContent.items
        .map((item) => {
          if (item.str !== undefined) return item.str;
          // Some versions of PDF.js use 'chars' for individual characters
          if (item.chars) return item.chars.map((c) => c.str).join('');
          return '';
        })
        .join(' ');

      console.log(`Page ${i} text length: ${pageText.length}`);
      fullText += pageText + '\n';
    }

    const cleaned = cleanText(fullText);
    console.log('Total extracted text length:', cleaned.length);

    if (cleaned.length === 0 && pdf.numPages > 0) {
      console.warn('Text extraction returned nothing. The PDF might be an image/scan.');
      return 'This PDF appears to be a scanned image. Please upload a text-based PDF for detailed analysis.';
    }

    return cleaned;
  } catch (error) {
    console.error('Detailed PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

async function extractDOCXText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return cleanText(result.value);
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-ASCII characters except newline
    .trim();
}
