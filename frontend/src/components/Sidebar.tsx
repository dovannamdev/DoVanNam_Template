import {
  HiOutlineHome,
  HiOutlineDocument,
  HiOutlinePencil,
  HiOutlinePresentationChartBar,
  HiOutlinePhotograph,
  HiOutlineFilm,
  HiOutlineDotsHorizontal,
  HiOutlineTemplate,
  HiOutlineGlobe,
  HiOutlineFolder,
  HiOutlineLogin,
  HiOutlineStar,
} from "react-icons/hi";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const menuItems: SidebarItem[] = [
  { icon: <HiOutlineHome size={20} />, label: "Home", active: true },
  { icon: <HiOutlineDocument size={20} />, label: "Document" },
  { icon: <HiOutlinePencil size={20} />, label: "Design" },
  { icon: <HiOutlinePresentationChartBar size={20} />, label: "Presentation" },
  { icon: <HiOutlinePhotograph size={20} />, label: "Image" },
  { icon: <HiOutlineFilm size={20} />, label: "Video" },
  { icon: <HiOutlineDotsHorizontal size={20} />, label: "More" },
];

const secondaryItems: SidebarItem[] = [
  { icon: <HiOutlineTemplate size={20} />, label: "Templates" },
  { icon: <HiOutlineGlobe size={20} />, label: "Brand" },
  { icon: <HiOutlineFolder size={20} />, label: "Projects" },
];

export default function Sidebar() {
  return (
    <aside className="w-[90px] max-h-screen bg-white border-r border-[#E5E7EB] flex flex-col items-center py-4 flex-shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="mb-8 px-2 text-center">
        <span className="text-[#4F46E5] font-bold text-[11px] leading-tight">
          TEMPLATE.
        </span>
        <span className="text-[#1F2937] font-bold text-[11px]">NET</span>
      </div>

      {/* Main Menu */}
      <nav className="flex flex-col items-center gap-2 flex-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 ${
              item.active
                ? "text-[#4F46E5] bg-[#EEF2FF] shadow-sm cursor-pointer"
                : "text-[#6B7280] hover:cursor-not-allowed"
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-1.5 font-medium">{item.label}</span>
          </button>
        ))}

        {/* Divider */}
        <div className="w-12 h-px bg-[#E5E7EB] my-3" />

        {/* Secondary Menu */}
        {secondaryItems.map((item, index) => (
          <button
            key={index}
            className="flex flex-col items-center justify-center w-16 h-16 rounded-xl text-[#6B7280] hover:cursor-not-allowed transition-all duration-200"
          >
            {item.icon}
            <span className="text-[10px] mt-1.5 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-2 mt-auto">
        {/* Sign In */}
        <button className="flex flex-col items-center justify-center w-16 h-16 rounded-xl text-[#6B7280] hover:cursor-not-allowed transition-all duration-200">
          <HiOutlineLogin size={20} />
          <span className="text-[10px] mt-1.5 font-medium">Sign In</span>
        </button>

        {/* Upgrade Button */}
        <button className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-[#4F46E5] text-white hover:cursor-not-allowed transition-all duration-200">
          <HiOutlineStar size={18} />
          <span className="text-[9px] mt-1 font-medium">Upgrade</span>
        </button>
      </div>
    </aside>
  );
}
