export default function StatCard({ title, value }) {
  return (
    <div
      className="
        bg-gray-800
        rounded-2xl
        p-4
        shadow-md
        active:scale-95
        transition
      "
    >
      <p className="text-xs text-gray-400">
        {title}
      </p>

      <h2 className="text-xl font-bold mt-2">
        ₹{value}
      </h2>
    </div>
  );
}
