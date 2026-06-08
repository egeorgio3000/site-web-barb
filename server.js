const http = require("http");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

const MAIL_TO = "etienne.georgiou-prestataire@ca-gip.fr";
// Renseigne tes identifiants SMTP ici ou via variables d'environnement :
const SMTP_USER = process.env.SMTP_USER || "TON_MAIL@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || "dhnohmsntqvceojb";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: SMTP_USER, pass: SMTP_PASS }
});

const port = process.env.PORT || 3000;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = http.createServer((req, res) => {
  if (req.url === "/api/contact" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        const { nom, prenom, mail, telephone, message } = JSON.parse(body);
        const mailOptions = {
          from: SMTP_USER,
          to: MAIL_TO,
          subject: `Contact site — ${prenom} ${nom}`,
          text: `Nom : ${nom}\nPrénom : ${prenom}\nMail : ${mail}\nTéléphone : ${telephone}\n\nMessage :\n${message}`
        };
        transporter.sendMail(mailOptions, (err) => {
          if (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: err.message }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true }));
          }
        });
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Invalid JSON" }));
      }
    });
    return;
  }

  if (req.url === "/api/galerie") {
    const galerieDir = path.join(__dirname, "galerie");
    fs.readdir(galerieDir, (err, files) => {
      if (err) {
        res.writeHead(500);
        res.end("Server error");
        return;
      }
      const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(images));
    });
    return;
  }

  const safePath = req.url === "/" ? "/index.html" : req.url;
  const filePath = path.join(__dirname, safePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        fs.readFile(path.join(__dirname, "index.html"), (fallbackErr, fallbackContent) => {
          if (fallbackErr) {
            res.writeHead(500);
            res.end("Server error");
            return;
          }
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(fallbackContent);
        });
        return;
      }
      res.writeHead(500);
      res.end("Server error");
      return;
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
