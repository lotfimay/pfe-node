const PDFDocument = require("./pdfkit-tables");
const fs = require("fs");
const { header } = require("express/lib/response");

function PVexamen(dataCallback, endCallback, invoice) {
  const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  generateheader(doc);
  tablehead(doc);
  generateInvoiceTable(doc, invoice);
  doc.end();
}
function generateheader(doc){
    doc.fill('#808080').stroke();
    doc
        .image("header.png", 40, 0, { width: 550, alignContent: 'center',})
        .font('Times-Roman')
        .fontSize(22)
        .text("Faculté d'informatique", 230, 140,{width: 350})
        .fill('#000').stroke()
        .fontSize(20)
        .text("P.V d'examen", 250,180, {width: 450})
        .fontSize(16)
        .text("Semestre 1 Session 1         Année Universitaire : 2021 / 2022", 20,320, {width: 450})
        .fontSize(14)
        .moveDown();
    doc.rect(250, 220, 300, 85).fillAndStroke('#fff', '#808080');
    doc.fill('#808080').stroke();
    doc.fontSize(14);
    doc.text("Mr. NomEnseignant", 270, 230, {lineBreak: false} );
    doc.text("Responsable de module : ", 270, 255, {lineBreak: false} );
    doc.text("L2 section A", 270, 280, {lineBreak: false} );
}
function tablehead(doc){
    doc.fontSize(12);
    doc.fill('#000').stroke();
    doc.rect(80, 350, 150, 40).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Date 10-15-2020 a 10:15", 90, 360, {lineBreak: false} );
    doc.rect(230, 350, 160, 40).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Locaux: 315D+151D+105D", 240, 360, {lineBreak: false} );
    doc.rect(390, 350, 160, 40).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Module: ALGO", 400, 355, {lineBreak: false} );
    doc.text("Section: A", 400, 375, {lineBreak: false} );
    doc.rect(80, 390, 150, 30).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Surveillants", 130, 400, {lineBreak: false} );
    doc.rect(230, 390, 160, 30).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Emargement", 280, 400, {lineBreak: false} );
    doc.rect(390, 390, 160, 30).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Nombre d’étudiants présents", 400, 400, {lineBreak: false} );
    doc.rect(80, 420, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 420, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 420, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(80, 450, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 450, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 450, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(80, 480, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 480, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 480, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(80, 510, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 510, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 510, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(80, 540, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 540, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 540, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(80, 570, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 570, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 570, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(80, 600, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 600, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 600, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(80, 630, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 630, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 630, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(80, 660, 150, 30).fillAndStroke('#fff', '#000');
    doc.rect(230, 660, 160, 30).fillAndStroke('#fff', '#000');
    doc.rect(390, 660, 160, 30).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Total: ", 400, 700, {lineBreak: false} );
    doc.text("Signature du Responsable du Module", 400, 720, {lineBreak: false} );
    doc.fill('#000').stroke();
    doc.text("Observations et Remarques: ", 60, 700, {lineBreak: false} );
    doc.fill('#000').stroke();
    doc.text("............................................................................................................. ", 60, 720, {lineBreak: false} );
    doc.text("............................................................................................................. ", 60, 740, {lineBreak: false} );
    doc.text(".............................................................................................................", 60, 760, {lineBreak: false} );
    doc.fill('#000').stroke();
    doc.fontSize(14);
}
function generateTableRow(doc, y, c1, c2, c3, c4) {
	doc.fontSize(9)
		.text(c1, 85, y)
}
function generateInvoiceTable(doc, invoice) {
	let i,
		invoiceTableTop = 400;

	for (i = 0; i < invoice.items.length; i++) {
		const item = invoice.items[i];
		const position = invoiceTableTop + (i + 1) * 30;
		generateTableRow(
			doc,
			position,
			item.Nom,
		);
	}
}

module.exports = { PVexamen };