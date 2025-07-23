import './InvoiceApp.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import signatureImage from './stamp.png';
import toplogo from './mylogo.png';
import water from './watermark.png';
import benchmark from './benchmark.png';
import phoneIcon from './phone-icon.png';
import emailIcon from './email-icon.png';
import locationIcon from './location-icon.png';



const logoPath = require('./sanalogo2.png'); // Assuming 'sanalogo.png' is in the same directory

function InvoiceApp() {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "182501",
    date: "01-01-2025",
    clientName: "",
    address: "",
    items: [
      { name: "Add Item", price: 0, qty: 0, date: "15-01-2025" },
    ],
  });

  const numberToWords = (num) => {
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousands = ["", "Thousand", "Million", "Billion"];

    if (num === 0) return "Zero";
    
    let word = "";

    const helper = (num) => {
        let str = "";
        if (num < 10) str += ones[num];
        else if (num < 20) str += teens[num - 10];
        else if (num < 100) str += tens[Math.floor(num / 10)] + (num % 10 !== 0 ? " " + ones[num % 10] : "");
        else str += ones[Math.floor(num / 100)] + " Hundred " + (num % 100 !== 0 ? helper(num % 100) : "");
        return str.trim();
    };

    let i = 0;
    while (num > 0) {
        if (num % 1000 !== 0) {
            word = helper(num % 1000) + (thousands[i] ? " " + thousands[i] : "") + " " + word;
        }
        num = Math.floor(num / 1000);
        i++;
    }

    return word.trim();
};


  const sortedItems = [...invoiceData.items].sort((a, b) => {
    const dateA = new Date(a.date); // Convert to Date object
    const dateB = new Date(b.date);
    return dateA - dateB; // Sort in ascending order
  });
  console.log('Original Items:', invoiceData.items);
  console.log('Sorted Items:', sortedItems);

   // Product suggestions for autocomplete
   const productSuggestions = ["A3 Clr print", "A3 B/w print", "A4 clr print","A4 B/w print","Lamination", "Full card ", "Half card","Pvc card","Leaf Cover"];

   // Autocomplete state
   const [filteredSuggestions, setFilteredSuggestions] = useState([]);
   const [showSuggestions, setShowSuggestions] = useState(false);
 


  // const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setInvoiceData({ ...invoiceData, [field]: value });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...invoiceData.items];
    updatedItems[index][field] = field === 'qty' || field === 'price' ? parseFloat(value) || 0 : value;
    setInvoiceData({ ...invoiceData, items: updatedItems });
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
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((total, item) => total + item.price * item.qty, 0);
    
  };


   // Autocomplete logic
   const handleProductInputChange = (index, value) => {
    const filtered = productSuggestions.filter((product) =>
      product.toLowerCase().startsWith(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(true);

    handleItemChange(index, "name", value);
  };

  const handleSuggestionClick = (index, suggestion) => {
    handleItemChange(index, "name", suggestion);
    setFilteredSuggestions([]);
    setShowSuggestions(false);
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
  doc.addImage(toplogo, 'PNG', 0, 20, imgWidth, imgHeight);

        // Add watermark image
    const waterWidth = 130; // Adjust the width of the watermark
    const waterHeight = 130; // Adjust the height of the watermark
    const waterX = (pageWidth - waterWidth) / 2; // Center horizontally
    const waterY = (pageHeight - waterHeight) / 2; // Center vertically
    doc.addImage(water, 'PNG', waterX, waterY, waterWidth, waterHeight, '', 'NONE', 0.7); // Opacity set to 0.5 for watermark effect


  // Add watermark image
  const watermarkWidth = 10; // Adjust the width of the watermark
  const watermarkHeight = 60; // Adjust the height of the watermark

  // Calculate positions for multiple watermarks
  const watermarkX1 = 5; // Position of the first watermark
  const watermarkY1 = 110; // Position of the first watermark
  const watermarkX2 = 5; // Position of the second watermark
  const watermarkY2 = 200; // Position of the second watermark

  // Add watermarks
  doc.addImage(benchmark, 'PNG', watermarkX1, watermarkY1, watermarkWidth, watermarkHeight, 'NONE', 0.7);
  doc.addImage(benchmark, 'PNG', watermarkX2, watermarkY2, watermarkWidth, watermarkHeight, 'NONE', 0.7);

  // Add text and table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('INVOICE', 192, 35, null, null, 'right');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text(`Invoice No : ${invoiceData.invoiceNumber}`, 14, 60);
  doc.text(`Invoice Date : ${invoiceData.date}`, 145, 60);
  doc.text(`Invoice To :`, 14, 72);
  doc.text(`${invoiceData.clientName}`, 14, 80);
  doc.text(`${invoiceData.address}`, 14, 87);

  doc.autoTable({
    startY: 98,
    head: [['Product', 'Price', 'Qty', 'Total']],
    body: invoiceData.items.map((item) => [
      item.name,
      `${String.fromCharCode(8377)} ${item.price.toFixed(2)}`,  // Fix ₹ here
      item.qty,
      `${String.fromCharCode(8377)} ${(item.price * item.qty).toFixed(2)}`,  // Fix ₹ here
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      halign: 'center',
    },
    styles: {
      lineWidth: 0,
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
  doc.text(`Sub Total : ${String.fromCharCode(8377)} ${calculateTotal().toFixed(2)}`, 150, finalY + 10);
  doc.text(`Tax : 0.00%`, 150, finalY + 20);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total : ${String.fromCharCode(8377)} ${calculateTotal().toFixed(2)}`, 150, finalY + 30);

  const totalInWords = numberToWords(Math.floor(calculateTotal())) + " Dollars Only";
doc.setFont('helvetica', 'normal');
doc.setFontSize(10);
doc.text(`Amount in Words: (${totalInWords})`, 16, finalY + 30);


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
doc.addImage(phoneIcon, 'PNG', pageWidth - 175, footerY - 12, iconSize, iconSize);
doc.text('+91 9894699939 | 7826080350', 15, footerY, null, null, 'left'); // First line
// doc.text('+91 7826080350', 25, footerY + 5, null, null, 'left'); // Second line

// Divider Line 1
doc.setDrawColor(0);
doc.line(pageWidth / 3, footerY - 4, pageWidth / 3, footerY + 4); // Vertical line 1

// Location Section
doc.addImage(locationIcon, 'PNG', pageWidth / 2 - 4, footerY - 12, iconSize, iconSize);
doc.text('102, Nethaji Rd, Near Municipality', pageWidth / 2, footerY, null, null, 'center'); // First line
doc.text('Opp Canara Bank ATM, Ambur', pageWidth / 2, footerY + 5, null, null, 'center'); // Second line

// Divider Line 2
doc.line((pageWidth / 3) * 2, footerY - 4, (pageWidth / 3) * 2, footerY + 4); // Vertical line 2

// Email Section
doc.addImage(emailIcon, 'PNG', pageWidth - 40, footerY - 12, iconSize, iconSize);
doc.text('sanacomputers88@gmail.com', pageWidth - 15, footerY, null, null, 'right');

// Save the PDF
doc.save('Sana_Invoice.pdf');

};

  
  return (
    <div className="container mt-5">
      <div className="card p-4">
      <div className="text-center mb-4 bg-dark rounded" >    
        <img src={logoPath} alt="Sana Computer Logo" style={{ maxWidth: '400px' }} /> 
      </div>
        <h1 className="text-center text-uppercase">Invoice</h1>
        <div className="form-floating mb-3">
        <input type="text" className="form-control" id="floatingInput" placeholder="Invoice number"  
          onChange={(e) => handleChange("invoiceNumber", e.target.value)} 
       />
         <label type="floatingInput">Invoice Number</label>
    </div>
        <div className="form-floating mb-3">
        <input type="date" className="form-control" id="floatingInput" placeholder="Date" value={invoiceData.date}
              onChange={(e) => handleChange("date", e.target.value)}/>
          <label type="floatingInput">Date</label>
        </div>
        <div className="form-floating mb-3 ">
          <input type="client name" className="form-control" id="floatingInput" placeholder="Client name" value={invoiceData.clientName} onChange={(e) => handleChange("clientName", e.target.value)} />
          <label type="floatingInput">Client Name</label>
        </div>
        <div className="form-floating mb-3">
          <input type="Address" className="form-control" id="floatingInput" placeholder="Mobile Number" value={invoiceData.address} onChange={(e) => handleChange("address", e.target.value)} />
          <label type="Address">Mobile Number</label>
        </div>
        
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
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      className="form-control"
                      value={item.name}
                      onChange={(e) => handleProductInputChange(index, e.target.value)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // Delay to allow click on suggestion
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <ul
                        style={{
                          position: "absolute",
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          width: "100%",
                          zIndex: 10,
                          maxHeight: "150px",
                          overflowY: "auto",
                          listStyleType: "none",
                          padding: "5px",
                          margin: 0,
                        }}
                      >
                        {filteredSuggestions.map((suggestion, suggestionIndex) => (
                          <li
                            key={suggestionIndex}
                            onClick={() => handleSuggestionClick(index, suggestion)}
                            style={{
                              padding: "5px",
                              cursor: "pointer",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </td>
                {/* <td><input type="text" className="form-control" value={item.name} onChange={(e) => handleItemChange(index, "name", e.target.value)} /></td> */}
                <td><input type="number" className="form-control text-center" value={item.price} onChange={(e) => handleItemChange(index, "price", e.target.value)} /></td>
                <td><input type="number" className="form-control text-center" value={item.qty} onChange={(e) => handleItemChange(index, "qty", e.target.value)} /></td>
                <td>₹{(item.price * item.qty).toFixed(2)}</td>
                <td><button className="btn btn-dark" onClick={() => deleteItem(index)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn btn-secondary" onClick={addItem}>Add Item</button>
        <div className="mt-4 text-end">
          <h5>Total: ₹{calculateTotal().toFixed(2)}</h5>
        </div>
        <div className="mt-3 text-center">
          <button className="btn btn-warning" onClick={downloadPDF}>Download PDF</button>
        </div>
      </div>
    </div>
  );
}

export default InvoiceApp;

