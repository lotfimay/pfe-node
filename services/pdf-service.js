const PDFDocument = require("./pdfkit-tables");
const fs = require("fs");
const { header } = require("express/lib/response");

function buildPDF(dataCallback, endCallback, invoice) {
  const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  generateheader(doc , invoice);
  tablehead(doc);
  generateInvoiceTable(doc, invoice);
  doc.end();
}
function generateheader(doc , invoice){
    doc
        .image("header.png", 40, 0, { width: 550, alignContent: 'center',})
        .font('Times-Roman')
        .fontSize(22)
        .text("Faculté d'informatique", 230, 140,{width: 350})
        .fontSize(18)
        .text("Convocation des surveillances d’examen", 300,180, {width: 450, borderTopWidth: 2, borderTopColor: 'black'})
        .fontSize(16)
        .text(`Semestre ${invoice.semestre} Session ${invoice.session}         Année Universitaire : ${invoice.annee_universitaire}`, 20,220, {width: 450})
        .fontSize(14)
        .text(`Mr. ${invoice.Enseignant.nom_enseignant} ${invoice.Enseignant.prenom_enseignant}`, 270, 270)
        .fontSize(12)
        .text("Vous êtes affecté pour Surveiller:", 110, 300)
        .moveDown();
}
function tablehead(doc){
    doc
    .fontSize(15)
    .text("Date", 100, 355)
    .text("Horaire", 210, 355)
    .text("Module", 320, 355)
    .text("Salles", 450, 355)
    .moveDown();
}
function generateTableRow(doc, y, c1, c2, c3, c4) {
	doc.fontSize(12)
		.text(c1, 100, y)
		.text(c2, 210, y)
		.text(c3, 320, y, { width: 120})
		.text(c4, 450, y, { width: 120})
}
function generateInvoiceTable(doc, invoice) {
	let i,
		invoiceTableTop = 360;

	for (i = 0; i < invoice.surveillances.length; i++) {
		const item = invoice.surveillances[i];
		const position = invoiceTableTop + (i + 1) * 30;
		generateTableRow(
			doc,
			position,
			item.date,
			item.start_time,
			item.code_module,
			item.locaux_presentation,
		);
	}
}

module.exports = { buildPDF };