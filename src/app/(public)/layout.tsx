import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="bg-[#FFF9F2] pt-[142px]">{children}</main>
      <Footer />
    </>
  );
}
