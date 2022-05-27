const PDFDocument = require("./pdfkit-tables");
const fs = require("fs");
const { header } = require("express/lib/response");

function Emploi(dataCallback, endCallback, invoice) {
  const doc =  new PDFDocument(
    {
        layout : 'landscape'
    }
);

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  generateheader(doc , invoice);
  tablehead(doc , invoice.exams.length);
  generateInvoiceTable(doc, invoice);
  doc.end();
}
function generateheader(doc , invoice){
    doc
        .image("logo2.png", 60, 40, { width: 120, alignContent: 'center',})
        .image("logo2.png", 600, 40, { width: 120, alignContent: 'center',})
        .font('Times-Roman')
        .fontSize(22)
        .fill('#000').stroke()
        .text("FACULTE D'INFORMATIQUE", 240, 80,{width: 350, fontWeight: 'bold'})
        .fontSize(20)
        .text("Planning des premières épreuves", 240, 110,{width: 350, fontWeight: 'bold'})
        .text("de moyenne durée", 300, 130,{width: 350, fontWeight: 'bold'})
        .fill('#000').stroke()
        .fontSize(16)
        .text(`Semestre ${invoice.semestre}        Année Universitaire : ${invoice.annee_universitaire}`, 210,180, {width: 450})
        .fontSize(14)
        .moveDown();
}
function tablehead(doc , size){
    let i = 0;
    let y = 240;
    doc.fontSize(12);
    doc.rect(60, 220, 100, 20).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Année", 90, 225, {lineBreak: false} );
    doc.rect(160, 220, 100, 20).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Section", 190, 225, {lineBreak: false} );
    doc.rect(260, 220, 100, 20).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Date", 300, 225, {lineBreak: false} );
    doc.rect(360, 220, 110, 20).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Horaire", 395, 225, {lineBreak: false} );
    doc.rect(470, 220, 130, 20).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Module", 510, 225, {lineBreak: false} );
    doc.rect(600, 220, 150, 20).fillAndStroke('#fff', '#000');
    doc.fill('#000').stroke();
    doc.text("Locaux", 650, 225, {lineBreak: false} );
    
    for(i=0; i<size;i++){
    
        
        doc.rect(260,y,100,20).fillAndStroke('#fff', '#000');
        doc.rect(360,y,110,20).fillAndStroke('#fff', '#000');
        doc.rect(470,y,130,20).fillAndStroke('#fff', '#000');
        doc.rect(600,y,150,20).fillAndStroke('#fff', '#000');
        y=y+20;
    }

    doc.rect(60,240,100,y - 240).fillAndStroke('#fff', '#000');
    doc.rect(160,240,100,y - 240).fillAndStroke('#fff', '#000');
}
function generateTableRow(doc, y, c1, c2, c3, c4, c5, c6) {
    doc.fill('#000').stroke();
	doc.fontSize(12)
		.text(c1, 65, y)
        .text(c2, 165, y)
        .text(c3, 265, y)
        .text(c4, 365, y)
        .text(c5, 480, y)
        .text(c6, 605, y)
}
function generateInvoiceTable(doc, invoice) {
	let i,
		invoiceTableTop = 225;

	for (i = 0; i < invoice.exams.length; i++) {
		const item = invoice.exams[i];
		const position = invoiceTableTop + (i + 1) * 20;
        if(i != 0){

            generateTableRow(
                doc,
                position,
                '',
                '',
                item.Creneau.date,
                item.Creneau.start_time,
                item.code_module,
                item.locaux_presentation
            );

        }
        else{
		generateTableRow(
			doc,
			position,
			invoice.section.niveau,
            invoice.section.code_specialite + ' ' +invoice.section.nom_section,
            item.Creneau.date,
            item.Creneau.start_time,
            item.code_module,
            item.locaux_presentation
		);
        }
	}
}

module.exports = { Emploi };