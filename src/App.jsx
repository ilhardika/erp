import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 mb-6">
          Jika Anda melihat background biru dan card putih, Tailwind CSS sudah
          bekerja!
        </p>
        <button
          onClick={() => setCount(count + 1)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Count: {count}
        </button>
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-700">
            Current count:{" "}
            <span className="font-semibold text-blue-600">{count}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
