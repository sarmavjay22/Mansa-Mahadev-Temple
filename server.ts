import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

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

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on port 3000");
  });
}

startServer();
