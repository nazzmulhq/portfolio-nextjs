import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import info from "@components/home/data";
import path from "path";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const theme = searchParams.get("theme") === "dark" ? "dark" : "light";

    const isLight = theme === "light";

    const colors = isLight
        ? {
              bg: "#FFFFFF",
              sidebarBg: "#F0F4F8",
              sidebarBorder: "#CBD5E1",
              textPrimary: "#0F172A",
              textSecondary: "#1E293B",
              textAccent: "#1E40AF",
              badgeBg: "#DBEAFE",
              badgeText: "#1D4ED8",
              tagBg: "#E2E8F0",
              tagText: "#0F172A",
              cardBg: "#F8FAFC",
              cardBorder: "#CBD5E1",
              techTagBg: "#DBEAFE",
              techTagText: "#1E40AF",
              line: "#CBD5E1",
              link: "#1D4ED8",
              sectionTitle: "#1D4ED8",
              contactIcon: "#334155",
              dateColor: "#334155",
          }
        : {
              bg: "#0A0F1A",
              sidebarBg: "#111827",
              sidebarBorder: "#1E293B",
              textPrimary: "#F1F5F9",
              textSecondary: "#94A3B8",
              textAccent: "#DBEAFE",
              badgeBg: "#1E40AF",
              badgeText: "#DBEAFE",
              tagBg: "#1E293B",
              tagText: "#CBD5E1",
              cardBg: "#111827",
              cardBorder: "#1E293B",
              techTagBg: "#0F172A",
              techTagText: "#7DD3FC",
              line: "#1E293B",
              link: "#7DD3FC",
              sectionTitle: "#3B82F6",
              contactIcon: "#64748B",
              dateColor: "#64748B",
          };

    // A4 dimensions: 595.28 x 841.89 points
    const doc = new PDFDocument({
        size: "A4",
        margin: 0,
        bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBufferPromise = new Promise<Buffer>((resolve, reject) => {
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);
    });

    const { me, skills, experience, education, works } = info;
    const sidebarWidth = 190;
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const mainWidth = pageWidth - sidebarWidth - 30;
    const mainX = sidebarWidth + 15;

    // Background fill
    doc.rect(0, 0, pageWidth, pageHeight).fill(colors.bg);

    // Sidebar fill
    doc.rect(0, 0, sidebarWidth, pageHeight).fill(colors.sidebarBg);
    doc.rect(sidebarWidth, 0, 1, pageHeight).fill(colors.sidebarBorder);

    // ================= SIDEBAR =================
    let sy = 25;

    // Profile Image
    const imagePath = path.join(process.cwd(), "public", "images", "person.png");
    if (fs.existsSync(imagePath)) {
        try {
            const imgSize = 65;
            const imgX = (sidebarWidth - imgSize) / 2;
            doc.save();
            doc.roundedRect(imgX, sy, imgSize, imgSize, 8).clip();
            doc.image(imagePath, imgX, sy, { width: imgSize, height: imgSize });
            doc.restore();
            doc.roundedRect(imgX, sy, imgSize, imgSize, 8)
                .lineWidth(1)
                .stroke(colors.sidebarBorder);
            sy += imgSize + 10;
        } catch {
            sy += 5;
        }
    }

    // Name & Title
    doc.font("Helvetica-Bold")
        .fontSize(14)
        .fillColor(colors.textPrimary)
        .text(me.name, 10, sy, { width: sidebarWidth - 20, align: "center" });
    sy += 18;

    doc.font("Helvetica")
        .fontSize(8.5)
        .fillColor(colors.textSecondary)
        .text(me.title, 10, sy, { width: sidebarWidth - 20, align: "center" });
    sy += 14;

    // Badge
    const badgeText = "4+ Years Professional Exp.";
    doc.font("Helvetica-Bold").fontSize(7);
    const badgeW = doc.widthOfString(badgeText) + 12;
    const badgeX = (sidebarWidth - badgeW) / 2;
    doc.roundedRect(badgeX, sy, badgeW, 14, 7).fill(colors.badgeBg);
    doc.fillColor(colors.badgeText).text(badgeText, badgeX, sy + 3, { width: badgeW, align: "center" });
    sy += 22;

    // Divider
    doc.rect(12, sy, sidebarWidth - 24, 0.5).fill(colors.line);
    sy += 10;

    // Helper: Sidebar Section Header
    const drawSidebarHeader = (title: string) => {
        doc.font("Helvetica-Bold")
            .fontSize(8.5)
            .fillColor(colors.sectionTitle)
            .text(title.toUpperCase(), 14, sy);
        sy += 11;
        doc.rect(14, sy, sidebarWidth - 28, 0.5).fill(colors.line);
        sy += 8;
    };

    // Contact
    drawSidebarHeader("Contact");
    const contacts = [
        { label: me.email, href: `mailto:${me.email}` },
        { label: `Phone: ${me.phone}`, href: `tel:${me.phone}` },
        { label: `WhatsApp: ${me.whatsapp}`, href: `https://wa.me/${me.whatsapp}` },
        { label: me.mysite.replace(/^https?:\/\//, "").replace(/\/$/, ""), href: me.mysite },
        { label: "linkedin.com/in/nazzmulhq", href: me.linkedin },
        { label: "github.com/nazzmulhq", href: me.github },
        { label: "Dhaka, Bangladesh", href: "" },
    ];

    contacts.forEach((c) => {
        doc.font("Helvetica").fontSize(7.5).fillColor(colors.textSecondary);
        if (c.href) {
            doc.text(c.label, 14, sy, { width: sidebarWidth - 28, link: c.href });
        } else {
            doc.text(c.label, 14, sy, { width: sidebarWidth - 28 });
        }
        sy += 11;
    });
    sy += 6;

    // Technical Skills
    drawSidebarHeader("Technical Skills");
    let tagX = 14;
    const tagMaxW = sidebarWidth - 28;
    skills.forEach((skill) => {
        doc.font("Helvetica").fontSize(7);
        const tw = doc.widthOfString(skill) + 8;
        if (tagX + tw > 14 + tagMaxW) {
            tagX = 14;
            sy += 14;
        }
        doc.roundedRect(tagX, sy, tw, 11, 2).fill(colors.tagBg);
        doc.fillColor(colors.tagText).text(skill, tagX, sy + 2, { width: tw, align: "center" });
        tagX += tw + 4;
    });
    sy += 20;

    // Education
    drawSidebarHeader("Education");
    education.forEach((edu) => {
        doc.font("Helvetica-Bold")
            .fontSize(7.5)
            .fillColor(colors.textPrimary)
            .text(edu.for_pdf_degree, 14, sy, { width: sidebarWidth - 28 });
        sy += 9;
        doc.font("Helvetica")
            .fontSize(7)
            .fillColor(colors.textSecondary)
            .text(edu.for_pdf_title, 14, sy, { width: sidebarWidth - 28 });
        sy += 8;
        doc.font("Helvetica")
            .fontSize(6.5)
            .fillColor(colors.dateColor)
            .text(edu.date, 14, sy, { width: sidebarWidth - 28 });
        sy += 11;
    });
    sy += 4;

    // Languages
    drawSidebarHeader("Languages");
    const langs = [
        { name: "Bengali", level: "Native" },
        { name: "English", level: "Conversational" },
    ];
    langs.forEach((l) => {
        doc.font("Helvetica-Bold")
            .fontSize(7.5)
            .fillColor(colors.textPrimary)
            .text(l.name, 14, sy);
        doc.font("Helvetica")
            .fontSize(7)
            .fillColor(colors.textSecondary)
            .text(l.level, 14, sy, { width: sidebarWidth - 28, align: "right" });
        sy += 11;
    });
    sy += 4;

    // Core Competencies in Sidebar
    drawSidebarHeader("Core Competencies");
    const competencies = [
        "Microservices",
        "System Design",
        "Multi-Tenancy",
        "Redis Caching",
        "Deadlock Prevention",
        "CI/CD Pipelines",
        "Docker & K8s",
        "REST & GraphQL",
        "PostgreSQL",
        "Clean Architecture",
    ];
    let compX = 14;
    competencies.forEach((comp) => {
        doc.font("Helvetica").fontSize(6.5);
        const tw = doc.widthOfString(comp) + 6;
        if (compX + tw > 14 + tagMaxW) {
            compX = 14;
            sy += 13;
        }
        doc.roundedRect(compX, sy, tw, 10, 2).fill(colors.tagBg);
        doc.fillColor(colors.tagText).text(comp, compX, sy + 1.5, { width: tw, align: "center" });
        compX += tw + 3;
    });

    // ================= MAIN CONTENT =================
    let my = 25;

    const drawMainHeader = (title: string) => {
        doc.font("Helvetica-Bold")
            .fontSize(9.5)
            .fillColor(colors.sectionTitle)
            .text(title.toUpperCase(), mainX, my);
        my += 12;
        doc.rect(mainX, my, mainWidth, 1).fill(colors.sectionTitle);
        my += 7;
    };

    // Summary
    drawMainHeader("Professional Summary");
    const summaryText =
        `Results-driven Senior Software Specialist with 5+ years of hands-on experience building enterprise-grade web applications. ` +
        `Specialized in full-stack architecture with Next.js, NestJS, and TypeScript ecosystems. Proven track record architecting ` +
        `scalable ERP systems, high-concurrency microservices, automated CI/CD pipelines, and multi-tenant SaaS platforms.`;

    doc.font("Helvetica")
        .fontSize(7.5)
        .fillColor(colors.textSecondary)
        .text(summaryText, mainX, my, { width: mainWidth, align: "justify", lineGap: 2 });
    my += doc.heightOfString(summaryText, { width: mainWidth, lineGap: 2 }) + 8;

    // Experience
    drawMainHeader("Experience");
    experience.forEach((exp) => {
        // Title & Date
        doc.font("Helvetica-Bold")
            .fontSize(8.5)
            .fillColor(colors.textPrimary)
            .text(exp.title, mainX, my);

        doc.font("Helvetica")
            .fontSize(7.5)
            .fillColor(colors.dateColor)
            .text(exp.date, mainX, my, { width: mainWidth, align: "right" });
        my += 11;

        // Company
        doc.font("Helvetica-Oblique")
            .fontSize(7.5)
            .fillColor(colors.textAccent)
            .text(`${exp.company}${exp.address ? ` — ${exp.address}` : ""}`, mainX, my);
        my += 9;

        // Bullets
        exp.description.slice(0, 3).forEach((bullet) => {
            doc.font("Helvetica")
                .fontSize(7)
                .fillColor(colors.textSecondary)
                .text(`•  ${bullet}`, mainX + 4, my, { width: mainWidth - 4, lineGap: 1.2 });
            my += doc.heightOfString(`•  ${bullet}`, { width: mainWidth - 4, lineGap: 1.2 }) + 1;
        });

        // Tech tags
        let expTagX = mainX + 4;
        exp.technologies.slice(0, 7).forEach((tech) => {
            doc.font("Helvetica").fontSize(6);
            const tw = doc.widthOfString(tech) + 6;
            if (expTagX + tw > mainX + mainWidth) return;
            doc.roundedRect(expTagX, my + 1.5, tw, 8.5, 2).fill(colors.techTagBg);
            doc.fillColor(colors.techTagText).text(tech, expTagX, my + 2, { width: tw, align: "center" });
            expTagX += tw + 3;
        });
        my += 13;
    });
    my += 1;

    // Key Projects
    drawMainHeader("Key Projects");
    const colW = (mainWidth - 8) / 2;
    let projMaxY = my;

    works.slice(0, 4).forEach((work, idx) => {
        const colIdx = idx % 2;
        const rowIdx = Math.floor(idx / 2);

        const px = mainX + colIdx * (colW + 8);
        const py = my + rowIdx * 52;

        // Card bg
        doc.roundedRect(px, py, colW, 48, 4)
            .fillAndStroke(colors.cardBg, colors.cardBorder);

        // Title
        doc.font("Helvetica-Bold")
            .fontSize(7.5)
            .fillColor(colors.textPrimary)
            .text(work.title, px + 5, py + 4, { width: colW - 10 });

        // Description
        doc.font("Helvetica")
            .fontSize(6.5)
            .fillColor(colors.textSecondary)
            .text(work.description[0], px + 5, py + 13, { width: colW - 10, height: 18, lineGap: 1 });

        // Tech tags
        let ptx = px + 5;
        work.technologies.slice(0, 4).forEach((t) => {
            doc.font("Helvetica").fontSize(5.5);
            const tw = doc.widthOfString(t) + 4;
            if (ptx + tw > px + colW - 5) return;
            doc.roundedRect(ptx, py + 33, tw, 7.5, 2).fill(colors.techTagBg);
            doc.fillColor(colors.techTagText).text(t, ptx, py + 34, { width: tw, align: "center" });
            ptx += tw + 2;
        });

        if (py + 52 > projMaxY) projMaxY = py + 52;
    });
    my = projMaxY + 6;

    // Domain Expertise & Engineering Impact
    drawMainHeader("Domain Expertise & Engineering Impact");
    const contribs = [
        "Enterprise ERP Systems: e-Tender & Bidding, Procurement Requisitions, Central Inventory & Warehouse, Fleet Transportation, Production Planning & Stage Manufacturing.",
        "SaaS & AI Platforms: Multi-tenant E-Commerce Storefronts (Zcommerz), E-Learning (LMS), Cattle Biometric AI Verification & Agri-Tech Farming Systems.",
        "Developer Tools & Open Source: QuickDB VS Code extension (5 DB engines, AI query generation, MCP server) & 3 published developer npm packages.",
    ];

    contribs.forEach((c) => {
        doc.font("Helvetica")
            .fontSize(7)
            .fillColor(colors.textSecondary)
            .text(`•  ${c}`, mainX + 4, my, { width: mainWidth - 4, lineGap: 1.2 });
        my += doc.heightOfString(`•  ${c}`, { width: mainWidth - 4, lineGap: 1.2 }) + 1.5;
    });

    doc.end();
    const pdfBuffer = await pdfBufferPromise;

        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=Nazmul_Haque_CV_${theme}.pdf`,
            },
        });
    } catch (err: any) {
        console.error("PDF generation error:", err);
        return NextResponse.json({ error: err?.message || String(err), stack: err?.stack }, { status: 500 });
    }
}
