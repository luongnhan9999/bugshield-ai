import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BugShield AI - Decentralized Security Bounties on GenLayer",
  description:
    "Decentralized AI-Driven Security Audit Bounties on GenLayer Testnet with On-Chain Validator LLM Consensus.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
