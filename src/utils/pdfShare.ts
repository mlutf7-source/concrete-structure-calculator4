import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import cairoFontUrl from '../assets/fonts/Cairo-Regular.ttf?url';

const fontToBase64 = async () => {
  const res = await fetch(cairoFontUrl);
    const blob = await res.blob();
      return await new Promise<string>((resolve) => {
          const r = new FileReader();
              r.onloadend = () => resolve(String(r.result).split(',')[1]);
                  r.readAsDataURL(blob);
                    });
                    };

                    const txt = (doc: any, v: any) => {
                      const s = String(v ?? '').trim();
                        return doc.processArabic ? doc.processArabic(s) : s;
                        };

                        export const createPdfFromElement = async (elementId: string, title = 'تقرير المشروع') => {
                          const root = document.getElementById(elementId);
                            if (!root) {
                                alert('لم يتم العثور على منطقة التقرير');
                                    return;
                                      }

                                        const doc: any = new jsPDF('p', 'mm', 'a4');
                                          const fontBase64 = await fontToBase64();

                                            doc.addFileToVFS('Cairo-Regular.ttf', fontBase64);
                                              doc.addFont('Cairo-Regular.ttf', 'Cairo', 'normal');
                                                doc.setFont('Cairo');

                                                  let y = 15;

                                                    doc.setFontSize(16);
                                                      doc.text(txt(doc, title), 105, y, { align: 'center' });
                                                        y += 10;

                                                          const tables = Array.from(root.querySelectorAll('table'));

                                                            tables.forEach((table: any, index) => {
                                                                const section =
                                                                      table.closest('div')?.querySelector('h2,h3,strong,span')?.textContent ||
                                                                            `جدول ${index + 1}`;

                                                                                if (y > 260) {
                                                                                      doc.addPage();
                                                                                            y = 15;
                                                                                                }

                                                                                                    doc.setFontSize(11);
                                                                                                        doc.text(txt(doc, section), 200, y, { align: 'right' });
                                                                                                            y += 4;

                                                                                                                const rows = Array.from(table.querySelectorAll('tr')).map((tr: any) =>
                                                                                                                      Array.from(tr.querySelectorAll('th,td'))
                                                                                                                              .map((td: any) => txt(doc, td.textContent))
                                                                                                                                      .reverse()
                                                                                                                                          );

                                                                                                                                              if (rows.length > 0) {
                                                                                                                                                    autoTable(doc, {
                                                                                                                                                            head: [rows[0]],
                                                                                                                                                                    body: rows.slice(1),
                                                                                                                                                                            startY: y,
                                                                                                                                                                                    styles: {
                                                                                                                                                                                              font: 'Cairo',
                                                                                                                                                                                                        fontSize: 8,
                                                                                                                                                                                                                  halign: 'right',
                                                                                                                                                                                                                            cellPadding: 2,
                                                                                                                                                                                                                                    },
                                                                                                                                                                                                                                            headStyles: {
                                                                                                                                                                                                                                                      font: 'Cairo',
                                                                                                                                                                                                                                                                halign: 'right',
                                                                                                                                                                                                                                                                          fillColor: [0, 80, 158],
                                                                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                                                                          margin: { left: 8, right: 8 },
                                                                                                                                                                                                                                                                                                });

                                                                                                                                                                                                                                                                                                      y = doc.lastAutoTable.finalY + 8;
                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                            });

                                                                                                                                                                                                                                                                                                              const base64 = doc.output('datauristring').split(',')[1];

                                                                                                                                                                                                                                                                                                                const saved = await Filesystem.writeFile({
                                                                                                                                                                                                                                                                                                                    path: `${title.replace(/\s+/g, '_')}.pdf`,
                                                                                                                                                                                                                                                                                                                        data: base64,
                                                                                                                                                                                                                                                                                                                            directory: Directory.Cache,
                                                                                                                                                                                                                                                                                                                              });

                                                                                                                                                                                                                                                                                                                                await Share.share({
                                                                                                                                                                                                                                                                                                                                    title,
                                                                                                                                                                                                                                                                                                                                        text: title,
                                                                                                                                                                                                                                                                                                                                            url: saved.uri,
                                                                                                                                                                                                                                                                                                                                                dialogTitle: 'مشاركة التقرير',
                                                                                                                                                                                                                                                                                                                                                  });
                                                                                                                                                                                                                                                                                                                                                  };