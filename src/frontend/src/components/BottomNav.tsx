import { useSimpleRouter } from "@/router/useSimpleRouter";

const NAV_ITEMS = [
  { icon: "🏠", label: "Casa", path: "/" },
  { icon: "🔒", label: "Localização", path: "/sala" },
  { icon: "🌐", label: "Radar", path: "/fraud-radar" },
  { icon: "🎤", label: "Áudio", path: "/audio-analysis" },
  { icon: "🛡️", label: "AutoShield", path: "/autoshield" },
];

export function BottomNav() {
  const { navigate, currentRoute } = useSimpleRouter();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden backdrop-blur-md"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        backgroundColor: "rgba(210, 210, 210, 0.85)",
        borderTop: "1px solid rgba(180, 180, 180, 0.5)",
      }}
      aria-label="Navegação principal mobile"
    >
      <div className="flex h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              data-ocid={`bottom_nav.${item.label.toLowerCase().replace(/[^a-z0-9]/g, "")}.link`}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
