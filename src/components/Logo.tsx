import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  dark?: boolean;
}

export default function Logo({ size = "md", showText = true, dark = false }: LogoProps) {
  const iconSizes = { sm: 32, md: 36, lg: 48 };
  const textSizes = { sm: "text-lg", md: "text-xl", lg: "text-2xl" };
  const icon = iconSizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative flex-shrink-0 rounded-xl overflow-hidden shadow-lg shadow-orange-500/25`} style={{ width: icon, height: icon }}>
        <Image
          src="/favicon.svg"
          alt="StockFlow"
          width={icon}
          height={icon}
          className="w-full h-full"
        />
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold ${dark ? "text-white" : "text-foreground"}`}>
          Stock<span className="text-orange-500">Flow</span>
        </span>
      )}
    </div>
  );
}
