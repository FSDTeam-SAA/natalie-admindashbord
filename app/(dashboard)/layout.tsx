import Header from "@/components/common/Header";
import { Sidebar } from "@/components/common/Sideber";



function layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Header/>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar/>

        <div className="flex-1 overflow-y-auto p-6 mt-[80px] bg-[#0B0B0D]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default layout;
