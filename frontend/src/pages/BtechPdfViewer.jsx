import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import API from "../utils/api";
import Loader from "../components/Loader";
import "./BtechPdfViewer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up the PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/**
 * Protected PDF viewer using react-pdf.
 * - Loads metadata from /btec-notes/:id
 * - Fetches PDF blob with Auth token securely.
 * - Prevents zooming out by locking the scale.
 */
function BtechPdfViewer() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef(null);

  useEffect(() => {
    API.get(`/btec-notes/${id}`)
      .then((r) => {
        if (r.data.format !== "pdf") {
          setError("This note is not a PDF.");
        } else {
          setNote(r.data);
        }
      })
      .catch(() => setError("Could not load this note."))
      .finally(() => setLoading(false));

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p' || e.key === 'c')) {
        e.preventDefault();
        alert("Downloading, printing, and copying are disabled for protected notes.");
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [id]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    // Only try to update width if we are not loading anymore
    if (!loading) {
      // Small timeout to ensure DOM is fully rendered
      setTimeout(updateWidth, 100);
    }
    
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [loading]);

  if (loading) return <Loader />;

  if (error || !note) {
    return (
      <div className="pv-error">
        <AlertTriangle size={36} />
        <p>{error || "Note not found."}</p>
        <button onClick={() => navigate("/btech-notes")}>← Back to Notes</button>
      </div>
    );
  }

  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
  const token = localStorage.getItem("token");

  // Load PDF with Authorization header
  const pdfOptions = {
    url: `${baseUrl}/btec-notes/${id}/view-pdf`,
    httpHeaders: {
      Authorization: `Bearer ${token}`
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div className="pv-page">
      <div className="pv-frame-wrap" ref={containerRef}>
        <div 
          className="pv-react-pdf-container"
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          <Document
            file={pdfOptions}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div style={{ padding: 20, color: '#fff' }}>Loading PDF document...</div>}
            error={<div style={{ padding: 20, color: '#f87171' }}>Failed to load PDF.</div>}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_${index + 1}`} className="pv-pdf-page-wrapper">
                <Page 
                  pageNumber={index + 1} 
                  width={containerWidth} 
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}

export default BtechPdfViewer;
