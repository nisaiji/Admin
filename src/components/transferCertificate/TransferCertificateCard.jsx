import React, { useRef } from "react";
import ReactDOM from "react-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import schoolLogo from "../../assets/images/schoollogo.png";
import downloadBlue from "../../assets/images/darkmode/downloadblue.png";

const TransferCertificateCard = () => {
  const containerRef = useRef(null);

  const generateCardElement = () => (
    <div className="w-[800px] bg-white text-black p-10 shadow-md border border-gray-300">
      <h2 className="text-center text-2xl font-bold">IPS PUBLIC SCHOOL</h2>
      <div className="flex justify-center">
        <img src={schoolLogo} alt="schoolLogo" className="size-40" />
      </div>
      <div className="text-center mb-4">
        <p className="text-sm font-medium">
          Affiliation No.-2703137, School No.-2703137
        </p>
        <p className="text-sm">
          X-20, Rajendra nagar, Rau, Indore, Madhya Pradesh
        </p>
        <p className="text-sm">
          Phone No.- 7846785674, 7637884623 &nbsp; Email- ips@gmail.com
        </p>
      </div>
      <h3 className="text-center text-xl font-bold text-red-600 mb-4">
        TRANSFER CERTIFICATE
      </h3>

      <div className="text-md leading-8">
        <p>
          <strong>Full Name:</strong> Mahi Sharma
        </p>
        <p>
          <strong>Father’s Name:</strong> Ajay Sharma
        </p>
        <p>
          <strong>Date of Birth:</strong> DD/MM/YYYY
        </p>
        <p>
          <strong>Nationality:</strong> Indian
        </p>
        <p>
          <strong>Gender:</strong> Female
        </p>
        <p>
          <strong>Mother’s Name:</strong> Ajay Sharma
        </p>
        <p>
          <strong>Date of First Admission:</strong> DD/MM/YYYY
        </p>
        <p>
          <strong>School Board:</strong> MP BOARD
        </p>
        <p>
          <strong>Reason of Leaving:</strong> ________________
        </p>
        <p className="mt-3">
          Certified that the above information is in accordance with School
          Register.
        </p>
      </div>

      <div className="flex justify-between mt-10 text-sm font-medium">
        <p>
          <strong>Date:</strong> 20 April 2025
        </p>
        <p>
          <strong>Principal Signature</strong>
        </p>
      </div>
    </div>
  );

  const handleDownload = async () => {
    const container = containerRef.current;

    // Render the card into the container
    ReactDOM.render(generateCardElement(), container);

    // Wait a tick for rendering
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(container);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Transfer_Certificate_Mahi_Sharma.pdf");

    // Clean up
    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = "";
  };

  return (
    <div className="flex flex-col items-center">
      <div ref={containerRef} style={{ position: "absolute", top: -9999 }} />
      <button
        type="button"
        onClick={handleDownload}
        className="border border-borderBlue text-textBlue font-bold px-5 py-2 rounded-lg transition-all flex items-center gap-2"
      >
        <img
          src={downloadBlue}
          alt="download"
          className="size-5 object-contain"
        />
        Download
      </button>
    </div>
  );
};

export default TransferCertificateCard;
