"use client";

const customers = [
  { name: "Alice", total: 5000 },
  { name: "Bob", total: 4200 },
  { name: "Charlie", total: 3800 }
];

export function TopCustomers() {
  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="font-semibold mb-4">Top Customers</h2>
      <ul className="space-y-2">
        {customers.map((c) => (
          <li key={c.name} className="flex justify-between">
            <span>{c.name}</span>
            <span className="font-medium">${c.total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
