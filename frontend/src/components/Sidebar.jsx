import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ open, setOpen }) {
  const location = useLocation();

  const linkClass = path =>
    `block px-4 py-2 rounded-lg transition ${
      location.pathname === path
        ? "bg-green-600 text-white"
        : "hover:bg-gray-700"
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static z-50
          top-0 left-0 h-screen
          w-64
          bg-gray-800 text-white
          p-4
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        
        {/* Logo + Title */}
        <div className="flex items-center gap-2">
          <img
            src="/LOGO.png"
            alt="Techno Craft Logo"
            className="w-20 h-20 object-contain"
          />
        <h2 className="text-xl font-semibold mb-6">
          Tecno Craft Bike Service 
        </h2>
        </div>

        <nav className="flex flex-col gap-2">
          <Link
            to="/dashboard"
            className={linkClass("/dashboard")}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/new-bill"
            className={linkClass("/new-bill")}
            onClick={() => setOpen(false)}
          >
            New Bill
          </Link>

          <Link
            to="/bills"
            className={linkClass("/bills")}
            onClick={() => setOpen(false)}
          >
            All Bills
          </Link>
        </nav>
      </aside>
    </>
  );
}
