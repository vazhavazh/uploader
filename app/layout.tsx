import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import SeaCloud from "@/assets/svg/logo.svg";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SeaCloud Uploader",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-300`}>
				<div className='bg-slate-900 fixed z-50 top-0 w-full h-16 md:h-20 xl:h-[7rem]'>
					<div className='flex justify-center'>
						<div className='w-16 md:w-20 xl:w-[7rem]'>
							<SeaCloud />
						</div>
					</div>
				</div>
				<main>{children}</main>
				<Toaster />
			</body>
		</html>
	);
}
