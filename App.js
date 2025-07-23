import './InvoiceApp.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import signatureImage from './stamp.png';
import toplogo from './mylogo.jpg';
import water from './watermark.jpg';
import benchmark from './benchmark.jpg';
import phoneIcon from './phone-icon.jpg';
import emailIcon from './email-icon.jpg';
import locationIcon from './location-icon.jpg';


const logoPath = require('./sanalogo2.png');

function InvoiceApp() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    date: "01-01-2025",
    clientName: "",
    mobileNumber: "",
    items: [{ name: "Add Item", price: 0, qty: 0, date: "15-01-2025" }],
  });

  
  useEffect(() => {
    generateInvoiceNumber();
  }, []);

  const generateInvoiceNumber = () => {
    let lastInvoiceNum = localStorage.getItem('lastInvoiceNumber');

    if (!lastInvoiceNum) {
      lastInvoiceNum = 100; // Starting number
    } else {
      lastInvoiceNum = parseInt(lastInvoiceNum) + 1;
    }

    localStorage.setItem('lastInvoiceNumber', lastInvoiceNum);

    const invoiceNum = `2504-${lastInvoiceNum}`;
    setInvoiceData((prevData) => ({
      ...prevData,
      invoiceNumber: invoiceNum,
    }));
  };

  const [activeSuggestions, setActiveSuggestions] = useState({});
  const productSuggestions = [
    "A3 Clr print", "A3 B/w print", "A4 clr print",
    "A4 B/w print", "Lamination", "Full card", 
    "Half card", "Pvc card", "Leaf Cover"
  ];

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = field === 'qty' || field === 'price' ? parseFloat(value) || 0 : value;
    setInvoiceData({ ...invoiceData, items: updatedItems });
  };

  const handleNameChange = (index, value) => {
    handleItemChange(index, 'name', value);
    const filtered = productSuggestions.filter((product) =>
      product.toLowerCase().includes(value.toLowerCase())
    );
    setActiveSuggestions({ ...activeSuggestions, [index]: filtered });
  };

  const selectSuggestion = (index, suggestion) => {
    handleItemChange(index, 'name', suggestion);
    const updatedSuggestions = { ...activeSuggestions };
    delete updatedSuggestions[index];
    setActiveSuggestions(updatedSuggestions);
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, { name: "Add Item", price: 0, qty: 0 }],
    });
  };

  const deleteItem = (index) => {
    const updatedItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData({ ...invoiceData, items: updatedItems });
    const updatedSuggestions = { ...activeSuggestions };
    delete updatedSuggestions[index];
    setActiveSuggestions(updatedSuggestions);
  };


  const calculateTotal = () =>
    invoiceData.items.reduce((total, item) => total + item.price * item.qty, 0);


  const numberToWords = (num) => {
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
    const convert = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
  
    return num === 0 ? 'Zero' : convert(num);
  };
  



  //Download Section

const downloadPDF = async () => {
  // const doc = new jsPDF();
  const doc = new jsPDF({ compress: true });

  // Sort items by date in ascending order
  const sortedItems = [...invoiceData.items].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB; // Ascending order
  });

  console.log('Original Items:', invoiceData.items);
  console.log('Sorted Items:', sortedItems);


  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add company logo at the top
  const imgWidth = 70;
  const imgHeight = 20;
  doc.addImage(toplogo, 'JPEG', 0, 20, imgWidth, imgHeight);

        // Add watermark image
    const waterWidth = 130; // Adjust the width of the watermark
    const waterHeight = 130; // Adjust the height of the watermark
    const waterX = (pageWidth - waterWidth) / 2; // Center horizontally
    const waterY = (pageHeight - waterHeight) / 2; // Center vertically
    doc.addImage(water, 'JPEG', waterX, waterY, waterWidth, waterHeight, '', 'NONE', 0.7); // Opacity set to 0.5 for watermark effect


  // Add watermark image
  const watermarkWidth = 10; // Adjust the width of the watermark
  const watermarkHeight = 60; // Adjust the height of the watermark

  // Calculate positions for multiple watermarks
  const watermarkX1 = 5; // Position of the first watermark
  const watermarkY1 = 110; // Position of the first watermark
  const watermarkX2 = 5; // Position of the second watermark
  const watermarkY2 = 200; // Position of the second watermark

  // Add watermarks
  doc.addImage(benchmark, 'JPEG', watermarkX1, watermarkY1, watermarkWidth, watermarkHeight, 'NONE', 0.7);
  doc.addImage(benchmark, 'JPEG', watermarkX2, watermarkY2, watermarkWidth, watermarkHeight, 'NONE', 0.7);

  // Add text and table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('INVOICE', 192, 35, null, null, 'right');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);

  // Set line width (default is 0.200)
  doc.setLineWidth(0.2); // Increase thickness — you can try 1 for even bolder

  // Draw the outer table lines
  doc.rect(14, 60, 182, 24); // Outer box
  doc.line(110, 60, 110, 84); // Vertical divider
  doc.line(14, 72, 196, 72);  // Horizontal divider

  doc.text(`Invoice No : ${invoiceData.invoiceNumber}`, 115, 68);
  doc.text(`Invoice Date : ${invoiceData.date}`, 115, 80);
  doc.text(`Company Name :`, 18, 68);
  doc.text(`${invoiceData.clientName}`, 53, 68);
  doc.text(`Address :`, 18, 80);
  doc.text(`${invoiceData.mobileNumber}`, 38, 80);

  doc.autoTable({ 
    startY: 96,
    head: [['Product', 'Price', 'Qty', 'Total']],
    body: invoiceData.items.map((item) => [

      item.name,
      `${item.price.toFixed(2)}`, // Display Rupee symbol
      item.qty,
      `${(item.price * item.qty).toFixed(2)}`,
       ]),
    theme: 'plain',
    headStyles: {
      fillColor: [21, 21, 21],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      halign: 'center',
      minCellHeight: 8, // Increases row height
    },
    styles: {
      lineWidth: 0,
      cellPadding: 4, // Adds space inside each cell
    },
    didDrawCell: (data) => {
      const { cell } = data;
      const { x, y, width, height } = cell;

      if (data.section === 'body' || data.section === 'head') {
        // Top border
        data.doc.line(x, y, x + width, y);

        // Bottom border
        data.doc.line(x, y + height, x + width, y + height);
      }
    },
  });

  const finalY = doc.lastAutoTable.finalY || 70;
  // doc.text(`Sub Total : $ ${String.fromCharCode(8377)} ${calculateTotal().toFixed(2)}`, 150, finalY + 10);
  doc.setFontSize(10);
  doc.text(`Tax : 0.00%`, 150, finalY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total : Rs ${calculateTotal().toFixed(2)}`, 150, finalY + 20);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Amount in Words : ${numberToWords(Math.floor(calculateTotal()))} Rupees Only`, 16, finalY + 10);


  doc.addImage(signatureImage, 'PNG', 90, doc.lastAutoTable.finalY + 36, 26, 24); 

  doc.setFont('helvetica', 'normal');
  doc.setFontSize('helvetica', 12);

// Footer Section
const footerY = pageHeight - 20; // Adjust for correct positioning

// Draw Footer Box
doc.setDrawColor(0);
doc.setLineWidth(0.5);
doc.rect(10, footerY - 15, pageWidth - 20, 25); // Footer box

// Add black top bar
const barWidth = 90; // Width of the black rectangle
doc.setFillColor(0, 0, 0);
doc.rect((pageWidth - barWidth) / 2, footerY - 17.5, barWidth, 2.5, 'F'); // Properly centered black rectangle

// Set Font 
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);

// Icons and Text Alignment
const iconSize = 6;

// Phone Section
doc.addImage(phoneIcon, 'JPEG', pageWidth - 175, footerY - 12, iconSize, iconSize);
doc.text('+91 9894699939 | 7826080350', 15, footerY, null, null, 'left'); // First line
// doc.text('+91 7826080350', 25, footerY + 5, null, null, 'left'); // Second line

// Divider Line 1
doc.setDrawColor(0);
doc.line(pageWidth / 3, footerY - 4, pageWidth / 3, footerY + 4); // Vertical line 1

// Location Section
doc.addImage(locationIcon, 'JPEG', pageWidth / 2 - 4, footerY - 12, iconSize, iconSize);
doc.text('102, Nethaji Rd, Near Municipality', pageWidth / 2, footerY, null, null, 'center'); // First line
doc.text('Opp Canara Bank ATM, Ambur', pageWidth / 2, footerY + 5, null, null, 'center'); // Second line

// Divider Line 2
doc.line((pageWidth / 3) * 2, footerY - 4, (pageWidth / 3) * 2, footerY + 4); // Vertical line 2

// Email Section
doc.addImage(emailIcon, 'JPEG', pageWidth - 40, footerY - 12, iconSize, iconSize);
doc.text('sanacomputers88@gmail.com', pageWidth - 15, footerY, null, null, 'right');

// Save the PDF
doc.save('Sana_Invoice.pdf');

};


  return (
    <div className="container mt-5">
      <div className="card p-4">
        <div className="text-center mb-4 bg-dark rounded">
          <img src={logoPath} alt="Sana Computer Logo" style={{ maxWidth: '400px' }} />
        </div>
        <h1 className="text-center text-uppercase">Invoice</h1>
        {/* Invoice Details */}
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Invoice number"
            value={invoiceData.invoiceNumber}
            onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
          />
          <label>Invoice Number</label>
        </div>
        {/* Other inputs */}
        <div className="form-floating mb-3">
          <input
            type="date"
            className="form-control"
            value={invoiceData.date}
            onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
          />
          <label>Date</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Client name"
            value={invoiceData.clientName}
            onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
          />
          <label>Company Name</label>
        </div>
        <div className="form-floating mb-3">
  <input
    type="text"
    className="form-control"
    placeholder="Mobile Number"
    value={invoiceData.mobileNumber}
    onChange={(e) => setInvoiceData({ ...invoiceData, mobileNumber: e.target.value })}
  />
  <label>Address</label>
</div>
        {/* Invoice Table */}
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.items.map((item, index) => (
              <tr key={index}>
                <td>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={item.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                    />
                    {activeSuggestions[index] && activeSuggestions[index].length > 0 && (
                      <ul
                        style={{
                          position: 'absolute',
                          textAlign: 'left',
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          width: '100%',
                          zIndex: 10,
                          listStyleType: 'none',
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        {activeSuggestions[index].map((suggestion, i) => (
                          <li
                            key={i}
                            style={{
                              padding: '5px 10px',
                              cursor: 'pointer',
                            }}
                            onClick={() => selectSuggestion(index, suggestion)}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control text-center"
                    value={item.qty}
                    onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                  />
                </td>
                <td>₹{(item.price * item.qty).toFixed(2)}</td>
                <td>
                  <button className="btn btn-dark" onClick={() => deleteItem(index)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-secondary" onClick={addItem}>
          Add Item
        </button>
        <div className="mt-4 text-end">
          <h5>Total: ₹{calculateTotal().toFixed(2)}</h5>
          <p>Amount in Words: {numberToWords(Math.floor(calculateTotal()))} Rupees Only</p>
        </div>
        <div className="mt-3 text-center">
          <button className="btn btn-warning" onClick={downloadPDF}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceApp;
