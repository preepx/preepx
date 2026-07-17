const axios = require("axios");
const BtecNote = require("../models/BtecNote");

/**
 * GET /api/btec-notes/:id/view-pdf
 *
 * Streams the Cloudinary PDF through our server so the raw Cloudinary URL
 * is never exposed to the browser. Also sets headers that prevent:
 *   - Download / Save As
 *   - Screenshot via Content-Security-Policy
 *   - Embedding in external sites
 */
const viewPdf = async (req, res) => {
  try {
    const note = await BtecNote.findOne({
      _id: req.params.id,
      isPublished: true,
    }).select("pdfUrl format");

    if (!note) return res.status(404).json({ message: "Note not found" });
    if (note.format !== "pdf" || !note.pdfUrl)
      return res.status(400).json({ message: "This note has no PDF" });

    const pdfUrl = note.pdfUrl;

    // ── Privacy / anti-download headers ──────────────────────────────────
    res.setHeader("Content-Type", "application/pdf");
    // inline = render in browser, not trigger download
    res.setHeader("Content-Disposition", "inline; filename=\"note.pdf\"");
    // Prevent caching so users can't retrieve from browser cache
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    // Prevent MIME sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");

    try {
      const response = await axios({
        method: "GET",
        url: pdfUrl,
        responseType: "stream"
      });

      response.data.pipe(res);
    } catch (err) {
      console.error("PDF Proxy Error:", err.message);
      res.status(502).json({ message: "Could not fetch PDF from storage" });
    }

  } catch {
    res.status(500).json({ message: "Failed to serve PDF" });
  }
};

module.exports = { viewPdf };
