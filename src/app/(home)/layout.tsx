import Navbar from "@/components/common/Navbar";
import SidebarWrapper from "@/components/common/SidebarWrapper";
import SideNav from "@/components/common/SideNav";

export const metadata = {
  title: "Echo"
};
export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="w-full justify-between min-h-screen">
        <Navbar />
        <SidebarWrapper>
          <SideNav />
          {children}
        </SidebarWrapper>
      </main>
    </>
  );
}
