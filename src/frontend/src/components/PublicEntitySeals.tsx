export function PublicEntitySeals() {
  const entityBadges = [
    {
      name: "Banco de Portugal",
      initials: "BdP",
      icon: "/assets/generated/banco-portugal-seal-icon.dim_64x64.png",
      url: "https://www.bportugal.pt/",
    },
    {
      name: "CNCS",
      initials: "CNCS",
      icon: "/assets/generated/cncs-seal-icon.dim_64x64.png",
      url: "https://www.cncs.gov.pt/",
    },
    {
      name: "ENISA",
      initials: "ENISA",
      icon: "/assets/generated/enisa-seal-icon.dim_64x64.png",
      url: "https://www.enisa.europa.eu/",
    },
    {
      name: "CISA",
      initials: "CISA",
      icon: "/assets/generated/cisa-uscert-seal-icon.dim_64x64.png",
      url: "https://www.cisa.gov/",
    },
    {
      name: "Europol",
      initials: "Europol",
      icon: "/assets/generated/europol-seal-icon.dim_64x64.png",
      url: "https://www.europol.europa.eu/",
    },
  ];

  return (
    <div className="flex flex-wrap justify-center items-center gap-4 py-4">
      {entityBadges.map((badge) => (
        <a
          key={badge.name}
          href={badge.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 transition-opacity hover:opacity-80"
          title={badge.name}
        >
          <img
            src={badge.icon}
            alt={badge.name}
            className="w-10 h-10 object-contain"
          />
          <span className="text-[10px] text-muted-foreground font-medium">
            {badge.initials}
          </span>
        </a>
      ))}
    </div>
  );
}
