export default function Navbar({ setOpen }) {
  return (
    <header className="bg-gray-900 px-4 py-3 flex justify-between items-center">

      {/* Left Section */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden text-white text-xl"
          onClick={() => setOpen(true)}
        >
          ☰
        </button>

        {/* Logo + Title */}
        <div className="flex items-center gap-2">
          <img
            src="/LOGO.png"
            alt="Techno Craft Logo"
            className="w-20 h-20 object-contain"
          />
          <h1 className="text-base md:text-lg font-semibold text-white">
            Tecno Craft Bike Service
          </h1>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/";
        }}
        className="bg-red-600 hover:bg-red-500 text-white text-xs md:text-sm px-3 py-1.5 rounded-full"
      >
        Logout
      </button>
    </header>
  );
}
