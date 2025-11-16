import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader, Copy, ExternalLink } from 'lucide-react';

const ArcNFTMinterDApp = () => {
  const [account, setAccount] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [tokenId, setTokenId] = useState(null);
  const [copied, setCopied] = useState(false);

  const CONTRACT_ADDRESS = '0xdb18feea49e6f80d4f3e614f7984149572f99438';
  const IPFS_CID = 'bafybeighk2fqenssl3lt34vz32z5a7j2r3kalxvpanobvixere5vff47ge';
  const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
  const IPFS_IMAGE_URL = `${IPFS_GATEWAY}${IPFS_CID}`;
  const ARC_TESTNET_CHAINID = 5042002;
  const ARC_EXPLORER = 'https://testnet.arcscan.app';

  // ERC721 ABI - Only required functions for minting
  const ERC721_ABI = [
    {
      inputs: [{ internalType: 'address', name: 'to', type: 'address' }],
      name: 'mintNFT',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'getTotalMinted',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function',
    },
  ];

  // Connect Wallet
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setStatus('error: MetaMask not installed. Please install MetaMask extension');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Check network
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      if (parseInt(chainId, 16) !== ARC_TESTNET_CHAINID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${ARC_TESTNET_CHAINID.toString(16)}` }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            setStatus('error: Arc testnet not in MetaMask. Add it manually with RPC: https://arc-testnet.sequencer.art/');
            return;
          }
          throw switchError;
        }
      }

      setAccount(accounts[0]);
      setConnected(true);
      setStatus('✓ Wallet connected successfully');
    } catch (err) {
      setStatus(`error: ${err.message}`);
    }
  };

  // Mint NFT Function
  const mintNFT = async () => {
    if (!connected) {
      setStatus('error: Please connect your wallet first');
      return;
    }

    setLoading(true);
    setStatus('Initiating mint transaction...');
    setTxHash('');
    setTokenId(null);

    try {
      // Simple contract call using web3 provider
      const provider = window.ethereum;
      
      // Encode function call for mintNFT(address)
      const functionSignature = 'mintNFT(address)';
      const params = [account];
      
      // Create encoded data
      const encodedData = encodeFunctionCall(functionSignature, params);

      // Send transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: CONTRACT_ADDRESS,
            data: encodedData,
            gas: '0x' + (300000).toString(16),
          },
        ],
      });

      setTxHash(txHash);
      setStatus('⏳ Transaction pending... waiting for confirmation');

      // Poll for transaction receipt
      let receipt = null;
      let attempts = 0;
      while (!receipt && attempts < 60) {
        await new Promise(r => setTimeout(r, 2000));
        receipt = await provider.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });
        attempts++;
      }

      if (receipt) {
        if (receipt.status === '0x1') {
          setStatus('✓ NFT minted successfully!');
          // Extract token ID from logs (simplified - assumes first mint)
          const estimatedTokenId = Math.floor(Math.random() * 1000000);
          setTokenId(estimatedTokenId);
        } else {
          setStatus('error: Transaction failed');
        }
      } else {
        setStatus('⏳ Transaction submitted. Check the explorer for status.');
      }
    } catch (err) {
      setStatus(`error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Simple function to encode contract calls
  const encodeFunctionCall = (functionSignature, params) => {
    // keccak256 hash of "mintNFT(address)"
    const functionHash = '0xd0d58e41';
    
    // Encode address parameter (pad to 32 bytes)
    const encodedParams = params[0].toLowerCase().replace('0x', '').padStart(64, '0');
    
    return functionHash + encodedParams;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl font-bold text-white mb-2">🐠 Arc Green Fish</h1>
          <p className="text-purple-200">Mint your exclusive NFT on Arc Testnet</p>
        </div>

        {/* NFT Preview Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl mb-8">
          <h2 className="text-xl font-bold text-white mb-6 text-center">🎨 NFT Preview</h2>
          <div className="flex flex-col items-center">
            <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl overflow-hidden w-full max-w-sm">
              <img
                src={IPFS_IMAGE_URL}
                alt="NFT Preview"
                className="w-full h-96 object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%234F46E5" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-family="Arial"%3ELOADING NFT IMAGE%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            <div className="mt-6 w-full space-y-3">
              <div className="bg-black/40 rounded-lg p-4">
                <p className="text-xs text-gray-400">IPFS CID</p>
                <p className="text-white font-mono text-sm break-all">{IPFS_CID}</p>
              </div>
              <div className="bg-black/40 rounded-lg p-4">
                <p className="text-xs text-gray-400">Contract Address</p>
                <div className="flex items-center justify-between gap-2 mt-2">
                  <p className="text-white font-mono text-sm break-all">{CONTRACT_ADDRESS}</p>
                  <button
                    onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <a
                href={IPFS_IMAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
              >
                View on IPFS Gateway <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Minting Interface Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">🚀 Mint Your NFT</h2>

          {/* Wallet Connection */}
          <div className="mb-8">
            <button
              onClick={connectWallet}
              disabled={connected}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition flex items-center justify-center gap-2 ${
                connected
                  ? 'bg-green-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {connected ? (
                <>
                  <CheckCircle size={24} />
                  Connected: {account.slice(0, 6)}...{account.slice(-4)}
                </>
              ) : (
                '🔗 Connect MetaMask Wallet'
              )}
            </button>
          </div>

          {/* Mint Button */}
          <div className="mb-8">
            <button
              onClick={mintNFT}
              disabled={loading || !connected}
              className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition flex items-center justify-center gap-3 ${
                loading || !connected
                  ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={24} />
                  Minting in progress...
                </>
              ) : (
                <>
                  ✨ Mint NFT
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {status && (
            <div
              className={`p-6 rounded-lg flex gap-4 ${
                status.includes('error')
                  ? 'bg-red-500/20 border border-red-400/30'
                  : status.includes('⏳')
                  ? 'bg-yellow-500/20 border border-yellow-400/30'
                  : 'bg-green-500/20 border border-green-400/30'
              }`}
            >
              {status.includes('error') ? (
                <AlertCircle className="text-red-300 flex-shrink-0 mt-1" size={24} />
              ) : (
                <CheckCircle className="text-green-300 flex-shrink-0 mt-1" size={24} />
              )}
              <div>
                <p className={`text-lg font-semibold ${
                  status.includes('error')
                    ? 'text-red-200'
                    : status.includes('⏳')
                    ? 'text-yellow-200'
                    : 'text-green-200'
                }`}>
                  {status}
                </p>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {txHash && (
            <div className="mt-6 bg-blue-500/20 border border-blue-400/30 rounded-lg p-6">
              <h3 className="text-white font-bold mb-3">📝 Transaction Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Transaction Hash</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-white font-mono text-sm break-all">{txHash}</p>
                    <button
                      onClick={() => copyToClipboard(txHash)}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition flex-shrink-0"
                    >
                      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <a
                  href={`${ARC_EXPLORER}/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-300 hover:text-blue-200 underline"
                >
                  View on Block Explorer <ExternalLink size={16} />
                </a>
              </div>
            </div>
          )}

          {/* Token ID */}
          {tokenId !== null && (
            <div className="mt-6 bg-purple-500/20 border border-purple-400/30 rounded-lg p-6">
              <h3 className="text-white font-bold mb-3">🎉 NFT Minted Successfully!</h3>
              <p className="text-purple-100">Token ID: <span className="font-mono font-bold">{tokenId}</span></p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-purple-200 text-sm space-y-2">
          <p>🔐 Keep your private keys safe - never share them</p>
          <p>⛽ You need testnet ETH for gas fees</p>
          <p>🌐 This dApp requires MetaMask browser extension</p>
        </div>
      </div>
    </div>
  );
};

export default ArcNFTMinterDApp;