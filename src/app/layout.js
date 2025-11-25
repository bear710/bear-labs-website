import { Outfit, Bebas_Neue } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-bebas"
});

export const metadata = {
  title: "Bear Labs | Premium Cannabis Extracts",
  description: "Premium, community driven cannabis extracts. Solventless, BHO, Vapes, and Edibles.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} ${bebasNeue.variable}`}>
        {children}
      </body>
    </html>
  );
}
