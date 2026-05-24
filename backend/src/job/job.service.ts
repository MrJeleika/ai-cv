import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Profile } from '../profile/profile.service';

interface CvExperience {
  company: string;
  title: string;
  period: string;
  subtitle?: string;
  bullets: string[];
}

interface CvProject {
  name: string;
  tech?: string[];
  bullets: string[];
}

interface CvEducation {
  school: string;
  degree: string;
  period: string;
  location?: string;
  coursework?: string;
}

interface CvData {
  summary?: string;
  technicalStrengths?: string[];
  experience?: CvExperience[];
  projects?: CvProject[];
  education?: CvEducation[];
}

const LEFT = 50;
const RIGHT = 50;
const PAGE_W = 595; // A4 width in pt
const CONTENT_W = PAGE_W - LEFT - RIGHT;

@Injectable()
export class JobService {
  async generateCoverLetterPDF(
    text: string,
    _companyName: string,
  ): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.fontSize(12);
    doc.text(text, { align: 'left', lineGap: 5 });
    doc.end();
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }

  async generateCustomCoverLetterPDF(
    text: string,
    _companyName: string,
  ): Promise<Buffer> {
    return this.generateCoverLetterPDF(text, _companyName);
  }

  async generateCVPDF(cvData: CvData, profile: Profile): Promise<Buffer> {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 36, bottom: 36, left: LEFT, right: RIGHT },
    });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // === Header — centred name + contact line
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .text((profile.full_name ?? '').toUpperCase(), LEFT, doc.y, {
        align: 'center',
        width: CONTENT_W,
      });
    doc.moveDown(0.2);

    const contactBits = [
      profile.email,
      profile.location,
      profile.phone,
      ...(profile.links ?? []).map((l) => l.label),
    ].filter((s): s is string => !!s && s.length > 0);
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(contactBits.join(' • '), LEFT, doc.y, {
        align: 'center',
        width: CONTENT_W,
      });
    doc.moveDown(0.6);

    // === Sections
    if (cvData.technicalStrengths && cvData.technicalStrengths.length > 0) {
      sectionHeader(doc, 'TECHNICAL STRENGTHS');
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .text(cvData.technicalStrengths.join(', '), LEFT, doc.y, {
          width: CONTENT_W,
          lineGap: 2,
        });
      doc.moveDown(0.7);
    }

    if (cvData.summary) {
      sectionHeader(doc, 'SUMMARY');
      doc
        .font('Helvetica')
        .fontSize(10.5)
        .text(cvData.summary, LEFT, doc.y, {
          width: CONTENT_W,
          lineGap: 2,
          align: 'left',
        });
      doc.moveDown(0.7);
    }

    if (cvData.experience && cvData.experience.length > 0) {
      sectionHeader(doc, 'WORK EXPERIENCE');
      cvData.experience.forEach((job, i) => {
        roleHeader(doc, job.title, job.company, job.period);
        if (job.subtitle) {
          doc
            .font('Helvetica-Oblique')
            .fontSize(10)
            .text(job.subtitle, LEFT, doc.y, { width: CONTENT_W });
        }
        doc.moveDown(0.25);
        bullets(doc, job.bullets ?? []);
        if (i < cvData.experience!.length - 1) doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
    }

    if (cvData.projects && cvData.projects.length > 0) {
      sectionHeader(doc, 'PROJECTS');
      cvData.projects.forEach((project, i) => {
        projectHeader(doc, project.name, project.tech);
        doc.moveDown(0.2);
        bullets(doc, project.bullets ?? []);
        if (i < cvData.projects!.length - 1) doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
    }

    if (cvData.education && cvData.education.length > 0) {
      sectionHeader(doc, 'EDUCATION');
      cvData.education.forEach((edu) => {
        // School + location right-aligned
        const startY = doc.y;
        doc.font('Helvetica-Bold').fontSize(11).text(edu.school, LEFT, startY);
        if (edu.location) {
          doc
            .font('Helvetica')
            .fontSize(10)
            .text(edu.location, LEFT, startY, {
              width: CONTENT_W,
              align: 'right',
            });
        }
        const afterTitleY = doc.y;
        // Degree + period
        doc
          .font('Helvetica-Oblique')
          .fontSize(10)
          .text(edu.degree, LEFT, afterTitleY);
        doc
          .font('Helvetica-Oblique')
          .fontSize(10)
          .text(edu.period, LEFT, afterTitleY, {
            width: CONTENT_W,
            align: 'right',
          });
        if (edu.coursework) {
          doc.moveDown(0.2);
          doc
            .font('Helvetica-Oblique')
            .fontSize(10)
            .text(`Coursework: ${edu.coursework}`, LEFT, doc.y, {
              width: CONTENT_W,
              lineGap: 2,
            });
        }
        doc.moveDown(0.4);
      });
    }

    doc.end();
    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}

// =========================================================================
// Helpers
// =========================================================================

function sectionHeader(doc: PDFKit.PDFDocument, label: string) {
  doc.font('Helvetica-Bold').fontSize(12).text(label, LEFT, doc.y);
  // Underline rule
  const y = doc.y;
  doc
    .lineWidth(0.5)
    .strokeColor('#000000')
    .moveTo(LEFT, y - 1)
    .lineTo(LEFT + CONTENT_W, y - 1)
    .stroke();
  doc.moveDown(0.15);
}

function roleHeader(
  doc: PDFKit.PDFDocument,
  title: string,
  company: string,
  period: string,
) {
  const startY = doc.y;
  // Bold title + " | " + italic company on the left
  doc.font('Helvetica-Bold').fontSize(11).text(title, LEFT, startY, {
    continued: true,
  });
  doc.font('Helvetica').fontSize(11).text(' | ', { continued: true });
  doc.font('Helvetica-Oblique').fontSize(11).text(company);
  // Period right-aligned on the same line
  doc.font('Helvetica').fontSize(10).text(period, LEFT, startY, {
    width: CONTENT_W,
    align: 'right',
  });
}

function projectHeader(
  doc: PDFKit.PDFDocument,
  name: string,
  tech?: string[],
) {
  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .text(name, LEFT, doc.y, {
      continued: !!(tech && tech.length > 0),
    });
  if (tech && tech.length > 0) {
    doc.font('Helvetica').fontSize(11).text(' | ', { continued: true });
    doc.font('Helvetica-Oblique').fontSize(11).text(tech.join(', '));
  }
}

function bullets(doc: PDFKit.PDFDocument, items: string[]) {
  doc.font('Helvetica').fontSize(10.5);
  items.forEach((b) => {
    doc.text(`• ${b}`, LEFT + 6, doc.y, {
      width: CONTENT_W - 6,
      lineGap: 2,
    });
    doc.moveDown(0.1);
  });
}
