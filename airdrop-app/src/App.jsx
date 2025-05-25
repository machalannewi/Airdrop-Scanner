import * as React from "react"
import { useState } from 'react';
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import "./global.css"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";





function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChain, setSelectedChain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = selectedChain === 'ethereum' 
    ? 'https://airdrop-scanner.onrender.com/api/check-eth'
    : 'https://airdrop-scanner.onrender.com/api/check-sol';
  
    try {
      const response = await fetch(endpoint, {
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
    <div className="min-h-screen text-white"> 
      {/* Header */}
      <header className=" text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">Check For Unclaimed Airdrop</h1>
      </header>



      {/* Main Form */}
      <main className="max-w-2xl mx-auto p-4 mt-8 rounded-[22px] opacity-100">
        <div className="glass-card p-6 rounded-2xl backdrop-blur-lg"
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="font-semibold block text-white font-medium mb-2">
                Wallet Address
              </label>
              <Input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x123..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="font-semibold block text-white font-medium mb-2">
                Blockchain
              </label>



              <Select 
              value={selectedChain}
              onValueChange={(value) => setSelectedChain(value)}
              className="select"
                >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select A Chain" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ethereum">ETHEREUM</SelectItem>
                  <SelectItem value="solana">SOLANA</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            </div>

            <Button 
              type="submit"
              disabled={isLoading}
              className="font-semibold bg-[#031457] cursor-pointer"
            >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Check Eligibility
                    <SendHorizontal/>
                  </>
                )}
            </Button>
          </form>
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <div className="mt-8 glass-card p-6 rounded-2xl backdrop-blur-lg">
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
                  <tr key={index} className="border-b">
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
                        <Button className="font-semibold bg-[#031457]">
                        <a
                          href={airdrop.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white"
                        >
                          Claim
                        </a>
                        </Button>
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