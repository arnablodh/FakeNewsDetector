"use client";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl font-extrabold mb-4">Help &amp; Support</h1>
      <p className="text-lg text-muted-foreground mb-6 max-w-2xl text-center">
        Find answers to common questions, view usage guides, or contact us for further assistance.
      </p>
      <ul className="list-disc list-inside text-left mb-6 max-w-xl">
        <li><Link href="/help/faq" className="text-primary hover:underline">FAQ</Link></li>
        <li><Link href="/help/guides" className="text-primary hover:underline">User Guides</Link></li>
        <li><Link href="mailto:support@scouter.com" className="text-primary hover:underline">Contact Support</Link></li>
      </ul>
        <div className="flex gap-4">
          <Link href="/" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">Home</Link>
        </div>
    </div>
  );
}
