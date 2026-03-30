"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";

const Pdf = dynamic(() => import("react-to-pdf"), { ssr: false });

export default function PdfGenerator() {
    const ref = useRef<HTMLDivElement>(null);

    const sanitizeClonedStyles = (clonedDoc: Document) => {
        const styles = Array.from(clonedDoc.querySelectorAll("style"));
        styles.forEach(s => {
            if (s && s.textContent) {
                s.textContent = s.textContent
                    .replace(/lab\([^)]*\)/g, "#6b7280")
                    .replace(/oklch\([^)]*\)/g, "#6b7280");
            }
        });
    };

    return (
        <div className="pdf-wrapper">
            <Pdf
                targetRef={ref}
                filename="code-example.pdf"
                options={{
                    onclone: sanitizeClonedStyles, // html2canvas onclone hook
                }}
            >
                {({ toPdf }: { toPdf: () => void }) => (
                    <button onClick={toPdf}>Generador de Pdf</button>
                )}
            </Pdf>

            <div ref={ref} className="pdf-content">
                <h1>React to pdf 2</h1>
            </div>
        </div>
    );
}
