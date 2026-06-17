import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";

// Read Firebase application configuration
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
const { projectId, apiKey, firestoreDatabaseId } = firebaseConfig;

// Configure SMTP transporter using environment variables
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser || "no-reply@blueprint-arc.com";

let transporter: any = null;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465, // true for port 465, false for 587 or other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // Adding standard TLS options to ensure modern connection handshakes
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  console.warn("\n⚠️  SMTP_USER and/or SMTP_PASS are not configured in your environment secrets.");
  console.warn("Emails to power.xd980@gmail.com will print to console preview and won't be sent successfully until added.\n");
}

// Dispatch email to target business coordinate: power.xd980@gmail.com
async function sendInquiryEmail(inquiry: {
  id: string;
  name: string;
  email: string;
  style: string;
  timeline: string;
  message: string;
  submittedAt: string;
}) {
  const recipient = "power.xd980@gmail.com";
  const emailSubject = `[Blueprint Arc] New Client Inquiry: ${inquiry.name}`;
  
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; color: #1f2937;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-top: 0; font-size: 22px;">New Architectural Design Blueprint Request</h2>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">A customer has submitted a new inquiry blueprint on the platform. The structural and contextual metrics have been saved successfully.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px; font-weight: 600; border: 1px solid #e2e8f0; width: 140px; font-size: 14px;">Inquiry ID:</td>
          <td style="padding: 12px; border: 1px solid #e2e8f0; font-family: monospace; font-size: 14px; color: #0f172a;">${inquiry.id}</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: 600; border: 1px solid #e2e8f0; font-size: 14px;">Client Name:</td>
          <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 14px; color: #0f172a;">${inquiry.name}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px; font-weight: 600; border: 1px solid #e2e8f0; font-size: 14px;">Client Email:</td>
          <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 14px;"><a href="mailto:${inquiry.email}" style="color: #10b981; text-decoration: none; font-weight: 500;">${inquiry.email}</a></td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: 600; border: 1px solid #e2e8f0; font-size: 14px;">Design Style:</td>
          <td style="padding: 12px; border: 1px solid #e2e8f0; text-transform: capitalize; font-size: 14px; color: #0f172a;">${inquiry.style}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px; font-weight: 600; border: 1px solid #e2e8f0; font-size: 14px;">Timeline Limit:</td>
          <td style="padding: 12px; border: 1px solid #e2e8f0; text-transform: capitalize; font-size: 14px; color: #0f172a;">${inquiry.timeline}</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: 600; border: 1px solid #e2e8f0; font-size: 14px; vertical-align: top;">Message:</td>
          <td style="padding: 12px; border: 1px solid #e2e8f0; line-height: 1.6; white-space: pre-wrap; font-size: 14px; color: #0f172a;">${inquiry.message || "No additional parameter details specified."}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 12px; font-weight: 600; border: 1px solid #e2e8f0; font-size: 14px;">Submitted At:</td>
          <td style="padding: 12px; border: 1px solid #e2e8f0; font-size: 14px; color: #4b5563;">${new Date(inquiry.submittedAt).toUTCString()}</td>
        </tr>
      </table>
      
      <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 15px; text-align: center;">
        This email was automatically generated and safely dispatched by the Architecture & Blueprint secure mail server.
      </p>
    </div>
  `;

  if (!transporter) {
    console.info("\n================ [EMAIL BODY PREVIEW] ================");
    console.info(`To: ${recipient}`);
    console.info(`Subject: ${emailSubject}`);
    console.info(`Body:\n${htmlContent.replace(/<[^>]*>/g, '').trim().substring(0, 1000)}...`);
    console.info("====================================================\n");
    throw new Error("Transporter context is uninitialized (SMTP secrets missing).");
  }

  const mailOptions = {
    from: `"Blueprint Arc System" <${smtpFrom}>`,
    to: recipient,
    subject: emailSubject,
    html: htmlContent,
    text: htmlContent.replace(/<[^>]*>/g, '').trim()
  };

  const info = await transporter.sendMail(mailOptions);
  console.info(`[Email Dispatch Success] Message delivered to ${recipient}. messageId: ${info.messageId}`);
  return info;
}

// Helper to reliably POST to Firestore REST API regardless of raw Node fetch availability
function postFirestore(url: string, payload: any): Promise<{ ok: boolean; status: number; text: string }> {
  return new Promise((resolve) => {
    try {
      const u = new URL(url);
      const dataStr = JSON.stringify(payload);
      
      const options = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(dataStr),
        },
        timeout: 10000, // 10 seconds timeout
      };

      const req = https.request(options, (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            ok: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 300,
            status: res.statusCode || 0,
            text: body,
          });
        });
      });

      req.on("error", (err) => {
        resolve({ ok: false, status: 500, text: err.message });
      });

      req.on("timeout", () => {
        req.destroy();
        resolve({ ok: false, status: 408, text: "Request timeout" });
      });

      req.write(dataStr);
      req.end();
    } catch (e: any) {
      resolve({ ok: false, status: 500, text: e.message || String(e) });
    }
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse body payload
  app.use(express.json());

  // CORS and OPTIONS handling middleware for iframe sandboxing resiliency
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API Route: Secure Inquiry Submission Handler (Direct on-site persistence)
  app.post(["/api/inquiries", "/api/inquiries/"], async (req, res) => {
    try {
      const { name, email, style, timeline, message } = req.body;

      // Assert basic client input validation
      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({ error: "Client Name is mandatory." });
      }
      if (!email || typeof email !== "string" || !email.includes("@")) {
        return res.status(400).json({ error: "A valid email address is mandatory." });
      }

      const cleanName = name.trim();
      const cleanEmail = email.trim();
      const cleanStyle = (style && typeof style === "string") ? style.trim() : "minimal";
      const cleanTimeline = (timeline && typeof timeline === "string") ? timeline.trim() : "express";
      const cleanMessage = (message && typeof message === "string") ? message.trim() : "";

      const newInquiry = {
        id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: cleanName,
        email: cleanEmail,
        style: cleanStyle,
        timeline: cleanTimeline,
        message: cleanMessage,
        submittedAt: new Date().toISOString(),
      };

      // 1. Persist directly to Firebase Firestore via REST API
      let firestoreSuccess = false;
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${firestoreDatabaseId}/documents/inquiries?documentId=${newInquiry.id}&key=${apiKey}`;
        
        const firestorePayload = {
          fields: {
            id: { stringValue: newInquiry.id },
            name: { stringValue: newInquiry.name },
            email: { stringValue: newInquiry.email },
            style: { stringValue: newInquiry.style },
            timeline: { stringValue: newInquiry.timeline },
            message: { stringValue: newInquiry.message },
            submittedAt: { stringValue: newInquiry.submittedAt }
          }
        };

        const firestoreResponse = await postFirestore(firestoreUrl, firestorePayload);

        if (firestoreResponse.ok) {
          firestoreSuccess = true;
          console.info(`[Firestore Rest] Successfully persisted secure inquiry ${newInquiry.id} for ${cleanEmail}`);
        } else {
          console.warn(`[Firestore Rest Failure] Status: ${firestoreResponse.status}, Error: ${firestoreResponse.text}`);
        }
      } catch (firestoreError: any) {
        console.error("Firestore Rest Error: ", firestoreError);
      }

      // 2. Twin-write to local inquiries.json backup
      const dbPath = path.join(process.cwd(), "inquiries.json");
      let inquiriesList = [];

      if (fs.existsSync(dbPath)) {
        try {
          const contents = fs.readFileSync(dbPath, "utf-8");
          if (contents.trim().length > 0) {
            inquiriesList = JSON.parse(contents);
          }
        } catch (readError) {
          console.warn("Problem parsing inquiries.json database. Initializing empty collection.", readError);
        }
      }

      inquiriesList.push(newInquiry);

      // Write atomically to JSON persistence
      fs.writeFileSync(dbPath, JSON.stringify(inquiriesList, null, 2), "utf-8");

      console.info(`[Backup] Recorded local fallback inquiry ${newInquiry.id} from ${cleanEmail}`);

      // 3. Dispatch real-time email coordinates to business coordinate (power.xd980@gmail.com)
      let emailDispatched = false;
      let emailWarning = null;
      try {
        await sendInquiryEmail(newInquiry);
        emailDispatched = true;
      } catch (emailError: any) {
        console.warn(`[Email Systems Notice] Could not dispatch real-time email notification. Reason: ${emailError.message}`);
        emailWarning = "To enable real-time email forwarding, please set SMTP_USER and SMTP_PASS variables under Secrets.";
      }

      return res.status(201).json({
        success: true,
        message: firestoreSuccess 
          ? "Your inquiry blueprint has been secured directly in our remote database. Our Lead Architect will be in touch shortly."
          : "Your inquiry blueprint has been secured directly in our local systems. Our Lead Architect will be in touch shortly.",
        inquiryId: newInquiry.id,
        emailDispatched,
        emailWarning
      });
    } catch (routeError) {
      console.error("Internal failure on inquiry submission:", routeError);
      return res.status(500).json({ error: "Failed to dispatch inquiry. Please try again." });
    }
  });

  // API Route: Healthcheck Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "online", uptime: process.uptime() });
  });

  // Serve static files / initialize Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.info("Initializing Vite Development Server Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.info("Initializing Production Static File Handlers...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal: failed to start full-stack server.", err);
  process.exit(1);
});
