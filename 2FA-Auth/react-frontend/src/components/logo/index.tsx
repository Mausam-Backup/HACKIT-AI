import { Link } from "react-router-dom";

const Logo = (props: { url?: string; size?: string; fontSize?: string }) => {
  const { url = "/", size = "40px", fontSize = "24px" } = props;
  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link
        to={url}
        className="flex items-center justify-center"
      >
        <img src="/logo.png" alt="Aegis Logo" style={{ width: size, height: size }} className="object-contain" />
      </Link>
    </div>
  );
};

export default Logo;
