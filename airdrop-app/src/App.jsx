import { useState } from 'react';

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState('ethereum');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await fetch('http://localhost:5000/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress, selectedChain }),
      });

      if (response.status === 400) {
        alert('Invalid Solana address. Please check and try again.');
        return;
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error checking airdrops:", error);
      alert("Failed to check eligibility. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Airdrop Checker</h1>
      </header>

      {/* Main Form */}
      <main className="max-w-2xl mx-auto p-4 mt-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x123..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Blockchain
              </label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="ethereum">Ethereum</option>
                <option value="solana">Solana</option>
                <option value="arbitrum">Arbitrum</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Check Eligibility'}
            </button>
          </form>
        </div>


        {/* {results.length === 0 && !isLoading && (
        <p className="text-gray-500 mt-4">
          {selectedChain === 'solana'
            ? "No eligible Solana airdrops found." 
            : "No eligible airdrops found."}
        </p>
       )} */}

        {/* Results Table */}
        {results.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Airdrop Results</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Airdrop</th>
                  <th className="text-left p-3">Eligibility</th>
                  <th className="text-left p-3">Claim</th>
                </tr>
              </thead>
              <tbody>
                {results.map((airdrop, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{airdrop.name}</td>
                    <td className="p-3">
                      {airdrop.eligible ? (
                        <span className="text-green-600 font-medium">✅ Eligible</span>
                      ) : (
                        <span className="text-red-600">❌ Not Eligible</span>
                      )}
                    </td>
                    <td className="p-3">
                      {airdrop.eligible && (
                        <a
                          href={airdrop.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Claim
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;