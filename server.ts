import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

function parseFirestoreFields(fields: any) {
  const result: any = {};
  if (!fields) return result;
  for (const key of Object.keys(fields)) {
    const valObj = fields[key];
    if (valObj.stringValue !== undefined) {
      result[key] = valObj.stringValue;
    } else if (valObj.booleanValue !== undefined) {
      result[key] = valObj.booleanValue;
    } else if (valObj.integerValue !== undefined) {
      result[key] = parseInt(valObj.integerValue, 10);
    } else if (valObj.doubleValue !== undefined) {
      result[key] = parseFloat(valObj.doubleValue);
    }
  }
  return result;
}

const PROJECT_ID = "poetic-bulwark-0lkqp";
const DATABASE_ID = "ai-studio-mansamahadevtemp-dfa5bfd5-4cfe-474b-a85e-099a51ba9310";

async function getEventMetadata(eventId: string) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/festival_banners/${eventId}`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const fields = parseFirestoreFields(data.fields);
      return {
        title: fields.title || "मंसा महादेव मंदिर",
        description: fields.description || "दैनिक श्रृंगार दर्शन, आरती वीडियो, उत्सव, सुंदरकांड, मंदिर दर्शन दीर्घा (गैलरी) एवं मंदिर की सम्पूर्ण जानकारी।",
        imageUrl: fields.imageUrl || "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=1200&auto=format&fit=crop"
      };
    }
  } catch (err) {
    console.error("Error fetching event metadata in server:", err);
  }
  return null;
}

async function getSocialShareSettings() {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/${DATABASE_ID}/documents/settings/social_share`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      const fields = parseFirestoreFields(data.fields);
      return {
        title: fields.websiteTitle || "मंसा महादेव मंदिर",
        description: fields.websiteDescription || "दैनिक श्रृंगार दर्शन, आरती वीडियो, उत्सव, सुंदरकांड, मंदिर दर्शन दीर्घा (गैलरी) एवं मंदिर की सम्पूर्ण जानकारी।",
        imageUrl: fields.websiteShareImageUrl || "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=1200&auto=format&fit=crop",
        faviconUrl: fields.faviconUrl || ""
      };
    }
  } catch (err) {
    console.error("Error fetching social share settings in server:", err);
  }
  return {
    title: "मंसा महादेव मंदिर",
    description: "दैनिक श्रृंगार दर्शन, आरती वीडियो, उत्सव, सुंदरकांड, मंदिर दर्शन दीर्घा (गैलरी) एवं मंदिर की सम्पूर्ण जानकारी।",
    imageUrl: "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=1200&auto=format&fit=crop",
    faviconUrl: ""
  };
}

function buildMetaTags(title: string, description: string, imageUrl: string, url: string, faviconUrl?: string) {
  let tags = `
    <title>${title}</title>
    <meta name="description" content="${description}" />

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${imageUrl}" />
  `;

  if (faviconUrl) {
    tags += `
    <link rel="icon" type="image/x-icon" href="${faviconUrl}" />
    `;
  }
  return tags;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 50mb limit for base64 file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route for ImageKit Upload Proxy
  app.post("/api/upload", async (req, res) => {
    try {
      const { file, fileName } = req.body;
      if (!file || !fileName) {
        return res.status(400).json({ error: "Missing file or fileName" });
      }

      const urlEndpoint = process.env.VITE_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/bkheeqo9f";
      const publicKey = process.env.VITE_IMAGEKIT_PUBLIC_KEY;
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || process.env.VITE_IMAGEKIT_PRIVATE_KEY;

      if (!privateKey) {
        console.warn("IMAGEKIT_PRIVATE_KEY is not defined in the server environment. Using local data URL fallback.");
        return res.json({ url: file, name: fileName });
      }

      // Prepare basic auth for ImageKit (using privateKey as the username and password as empty)
      const base64ApiKey = Buffer.from(privateKey + ":").toString("base64");
      
      // Prepare FormData for ImageKit API upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", fileName);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/audio");

      const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${base64ApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.log("ImageKit upload bypassed. Using local base64 storage.");
        return res.json({
          url: file,
          name: fileName,
          fallback: true
        });
      }

      const data = await response.json();
      return res.json({
        url: data.url,
        name: data.name,
      });
    } catch (error: any) {
      console.log("Upload proxy bypassed. Using local fallback.");
      return res.json({
        url: req.body?.file || "",
        name: req.body?.fileName || "",
        fallback: true
      });
    }
  });

  // Vite middleware for development or static serving for production
  let vite: any = null;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
  }

  // Dynamic Metadata Injection Middleware for all pages
  app.get('*', async (req, res, next) => {
    // Skip API routes and static asset files containing '.'
    if (req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }

    try {
      let html = "";
      const isProd = process.env.NODE_ENV === "production";

      if (isProd) {
        const htmlPath = path.join(process.cwd(), 'dist', 'index.html');
        if (fs.existsSync(htmlPath)) {
          html = fs.readFileSync(htmlPath, 'utf-8');
        } else {
          return next();
        }
      } else {
        const htmlPath = path.join(process.cwd(), 'index.html');
        if (fs.existsSync(htmlPath)) {
          html = fs.readFileSync(htmlPath, 'utf-8');
          if (vite) {
            html = await vite.transformIndexHtml(req.originalUrl, html);
          }
        } else {
          return next();
        }
      }

      // Fetch dynamic metadata based on 'event' query param
      const eventId = req.query.event as string;
      let metaData = null;
      if (eventId) {
        metaData = await getEventMetadata(eventId);
      }

      if (!metaData) {
        metaData = await getSocialShareSettings();
      }

      const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
      const host = req.get('host') || 'mansamahadevtemple.org';
      const currentUrl = `${protocol}://${host}${req.originalUrl}`;

      const metaTags = buildMetaTags(
        metaData.title,
        metaData.description,
        metaData.imageUrl,
        currentUrl,
        metaData.faviconUrl
      );

      // Replace title in index.html with meta tags
      const targetString = "<title>मंसा महादेव मंदिर | Mansa Mahadev Temple, Udaipur</title>";
      if (html.includes(targetString)) {
        html = html.replace(targetString, metaTags);
      } else {
        html = html.replace("</head>", `${metaTags}</head>`);
      }

      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (err) {
      console.error("HTML injection error:", err);
      return next();
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port 3000");
  });
}

startServer();
