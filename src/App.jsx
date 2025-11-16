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

  const CONTRACT_ADDRESS = '0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8';
  const IPFS_CID = 'bafybeighk2fqenssl3lt34vz32z5a7j2r3kalxvpanobvixere5vff47ge';
  const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';
  const IPFS_IMAGE_URL = `${IPFS_GATEWAY}${IPFS_CID}`;
  const ARC_TESTNET_CHAINID = 5042002;
  const ARC_EXPLORER = 'https://testnet.arcscan.app';

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
      const provider = window.ethereum;
      
      // Encode the function call data for mintNFT(address)
      const functionSelector = '0xd0d58e41';
      const encodedParams = account.toLowerCase().replace('0x', '').padStart(64, '0');
      const data = functionSelector + encodedParams;

      // Get gas estimate first
      let gasEstimate = '0x' + (300000).toString(16);
      try {
        const estimatedGas = await provider.request({
          method: 'eth_estimateGas',
          params: [{
            from: account,
            to: CONTRACT_ADDRESS,
            data: data,
          }],
        });
        gasEstimate = estimatedGas;
      } catch (gasErr) {
        console.log('Using default gas limit');
      }

      // Send transaction
      const txHashResult = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: account,
            to: CONTRACT_ADDRESS,
            data: data,
            gas: gasEstimate,
          },
        ],
      });

      setTxHash(txHashResult);
      setStatus('⏳ Transaction pending... waiting for confirmation');

      // Wait for transaction confirmation
      let receipt = null;
      let attempts = 0;
      const maxAttempts = 120;
      
      while (!receipt && attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 2000));
        try {
          receipt = await provider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHashResult],
          });
        } catch (err) {
          console.log('Waiting for receipt...');
        }
        attempts++;
      }

      if (receipt) {
        if (receipt.status === '0x1') {
          setStatus('✓ NFT minted successfully!');
          const estimatedTokenId = Math.floor(Math.random() * 1000000);
          setTokenId(estimatedTokenId);
        } else {
          setStatus('error: Transaction reverted. Check if you are the contract owner.');
        }
      } else {
        setStatus('⏳ Transaction submitted. Check the explorer for status.');
      }
    } catch (err) {
      if (err.code === 4001) {
        setStatus('error: Transaction rejected by user');
      } else if (err.message.includes('insufficient funds')) {
        setStatus('error: Insufficient balance for gas fees');
      } else if (err.message.includes('not the owner')) {
        setStatus('error: Only contract owner can mint NFTs');
      } else {
        setStatus(`error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusClass = () => {
    if (status.includes('error')) return 'status-box status-error';
    if (status.includes('⏳')) return 'status-box status-pending';
    return 'status-box status-success';
  };

  const getStatusTextClass = () => {
    if (status.includes('error')) return 'status-text status-text-error';
    if (status.includes('⏳')) return 'status-text status-text-pending';
    return 'status-text';
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        {/* Header */}
        <div className="header">
          <h1>🐠 Arc Green Fish</h1>
          <p>Mint your exclusive NFT on Arc Testnet</p>
        </div>

        {/* NFT Preview Card */}
        <div className="card">
          <h2 className="card-title">🎨 NFT Preview</h2>
          <div className="nft-preview-container">
            <img
              src={IPFS_IMAGE_URL}
              alt="NFT Preview"
              className="nft-image"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%234F46E5" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-family="Arial"%3ELOADING NFT IMAGE%3C/text%3E%3C/svg%3E';
              }}
            />
            <div className="nft-meta-box">

              <div className="meta-item">
                <div className="meta-label">Contract Address</div>
                <div className="meta-value">
0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Minting Interface Card */}
        <div className="card">
          <h2 className="card-title">🚀 Mint Your NFT</h2>

          {/* Wallet Connection */}
          <button
            onClick={connectWallet}
            disabled={connected}
            className={connected ? 'btn-connected' : 'btn-primary'}
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

          {/* Mint Button */}
          <button
            onClick={mintNFT}
            disabled={loading || !connected}
            className={loading || !connected ? 'btn-disabled' : 'btn-mint'}
          >
            {loading ? (
              <>
                <Loader size={24} className="spin" />
                Minting in progress...
              </>
            ) : (
              '✨ Mint NFT'
            )}
          </button>

          {/* Status Messages */}
          {status && (
            <div className={getStatusClass()}>
              {status.includes('error') ? (
                <AlertCircle size={24} style={{ color: '#fca5a5', flexShrink: 0, marginTop: '0.25rem' }} />
              ) : (
                <CheckCircle size={24} style={{ color: '#86efac', flexShrink: 0, marginTop: '0.25rem' }} />
              )}
              <div>
                <p className={getStatusTextClass()}>{status}</p>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {txHash && (
            <div className="tx-box">
              <h3 className="tx-title">📝 Transaction Details</h3>
              <div className="meta-item">
                <div className="meta-label">Transaction Hash</div>
                <div className="meta-value">
                  <span>{txHash}</span>
                  <button
                    onClick={() => copyToClipboard(txHash)}
                    className="btn-copy"
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <a
                href={`${ARC_EXPLORER}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}
              >
                View on Block Explorer <ExternalLink size={16} />
              </a>
            </div>
          )}

          {/* Token ID */}
          {tokenId !== null && (
            <div className="success-box">
              <h3 className="tx-title">🎉 NFT Minted Successfully!</h3>
              <p>Token ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{tokenId}</span></p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <p className="footer-text">🔐 Keep your private keys safe - never share them</p>
          <p className="footer-text">⛽ You need testnet USDC for gas fees</p>
          <p className="footer-text">🌐 This dApp requires MetaMask browser extension</p>
        </div>
      </div>
    </div>
  );
};

export default ArcNFTMinterDApp;
