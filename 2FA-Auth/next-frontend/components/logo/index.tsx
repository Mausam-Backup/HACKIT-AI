import Link from "next/link";
import React from "react";

const Logo = (props: { url?: string; size?: string; fontSize?: string }) => {
  const { url = "/", size = "40px", fontSize = "24px" } = props;
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link href={url} className="flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Aegis Logo" style={{ width: size, height: size }} className="object-contain" />
      </Link>
    </div>
  );
};

export default Logo;
