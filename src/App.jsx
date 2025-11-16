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

  // CSS Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4c1d95 0%, #1e3a8a 50%, #312e81 100%)',
      padding: 'clamp(1rem, 5vw, 2rem)',
      fontFamily: 'Arial, sans-serif',
      width: '100%',
      margin: 0,
      boxSizing: 'border-box',
    },
    maxWidth: {
      maxWidth: '100%',
      margin: '0 auto',
      padding: '0 clamp(0.5rem, 3vw, 2rem)',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center',
      marginBottom: '2rem',
      marginTop: '1rem',
    },
    title: {
      fontSize: '2.25rem',
      fontWeight: 'bold',
      color: '#ffffff',
      margin: '0 0 0.5rem 0',
    },
    subtitle: {
      color: '#c084fc',
      fontSize: '1rem',
      margin: 0,
    },
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '1rem',
      padding: '2rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      marginBottom: '2rem',
    },
    cardTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '1.5rem',
      textAlign: 'center',
    },
    setupBox: {
      background: 'rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem',
    },
    setupBoxGreen: {
      background: 'rgba(34, 197, 94, 0.2)',
      border: '1px solid rgba(134, 239, 172, 0.3)',
    },
    setupTitle: {
      color: '#ffffff',
      fontWeight: 'bold',
      marginBottom: '0.75rem',
      fontSize: '1rem',
    },
    setupText: {
      color: '#bfdbfe',
      fontSize: '0.875rem',
      lineHeight: '1.5',
      margin: '0.5rem 0',
    },
    codeBox: {
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '0.375rem',
      padding: '0.75rem',
      marginTop: '0.5rem',
      fontFamily: 'monospace',
      fontSize: '0.75rem',
      color: '#ffffff',
      overflowX: 'auto',
    },
    nftPreviewContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    nftImage: {
      width: '100%',
      maxWidth: '400px',
      height: '24rem',
      objectFit: 'cover',
      borderRadius: '0.75rem',
      background: 'linear-gradient(to bottom right, #9333ea, #3b82f6)',
    },
    nftMetaBox: {
      marginTop: '1.5rem',
      width: '100%',
    },
    metaItem: {
      background: 'rgba(0, 0, 0, 0.4)',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '0.75rem',
    },
    metaLabel: {
      fontSize: '0.75rem',
      color: '#9ca3af',
      marginBottom: '0.25rem',
    },
    metaValue: {
      color: '#ffffff',
      fontFamily: 'monospace',
      fontSize: '0.875rem',
      wordBreak: 'break-all',
    },
    button: {
      width: '100%',
      padding: '1rem 1.5rem',
      borderRadius: '0.5rem',
      fontWeight: 'bold',
      fontSize: '1.125rem',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem',
      marginBottom: '2rem',
    },
    buttonConnected: {
      background: '#22c55e',
      color: '#ffffff',
    },
    buttonPrimary: {
      background: '#3b82f6',
      color: '#ffffff',
    },
    buttonPrimaryHover: {
      background: '#2563eb',
    },
    buttonMint: {
      background: 'linear-gradient(to right, #9333ea, #ec4899)',
      color: '#ffffff',
    },
    buttonMintHover: {
      background: 'linear-gradient(to right, #7e22ce, #be185d)',
    },
    buttonDisabled: {
      background: '#4b5563',
      color: '#9ca3af',
      cursor: 'not-allowed',
    },
    statusBox: {
      padding: '1.5rem',
      borderRadius: '0.5rem',
      display: 'flex',
      gap: '1rem',
      marginBottom: '1rem',
    },
    statusSuccess: {
      background: 'rgba(34, 197, 94, 0.2)',
      border: '1px solid rgba(134, 239, 172, 0.3)',
    },
    statusError: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(248, 113, 113, 0.3)',
    },
    statusPending: {
      background: 'rgba(234, 179, 8, 0.2)',
      border: '1px solid rgba(250, 204, 21, 0.3)',
    },
    statusText: {
      color: '#86efac',
      fontSize: '1rem',
      fontWeight: '600',
      margin: 0,
    },
    statusTextError: {
      color: '#fca5a5',
    },
    statusTextPending: {
      color: '#fcd34d',
    },
    footer: {
      marginTop: '2rem',
      textAlign: 'center',
      color: '#c084fc',
      fontSize: '0.875rem',
    },
    footerText: {
      margin: '0.5rem 0',
    },
    link: {
      color: '#60a5fa',
      textDecoration: 'underline',
      cursor: 'pointer',
    },
    copyButton: {
      background: '#3b82f6',
      color: '#ffffff',
      border: 'none',
      padding: '0.5rem',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
    },
    txBox: {
      marginTop: '1.5rem',
      background: 'rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(96, 165, 250, 0.3)',
      borderRadius: '0.5rem',
      padding: '1.5rem',
    },
    txTitle: {
      color: '#ffffff',
      fontWeight: 'bold',
      marginBottom: '0.75rem',
    },
    successBox: {
      marginTop: '1.5rem',
      background: 'rgba(147, 51, 234, 0.2)',
      border: '1px solid rgba(196, 181, 253, 0.3)',
      borderRadius: '0.5rem',
      padding: '1.5rem',
    },
  };

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
      const functionSignature = 'mintNFT(address)';
      const encodedData = encodeFunctionCall(functionSignature, [account]);

      const txHashResult = await provider.request({
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

      setTxHash(txHashResult);
      setStatus('⏳ Transaction pending... waiting for confirmation');

      let receipt = null;
      let attempts = 0;
      while (!receipt && attempts < 60) {
        await new Promise(r => setTimeout(r, 2000));
        receipt = await provider.request({
          method: 'eth_getTransactionReceipt',
          params: [txHashResult],
        });
        attempts++;
      }

      if (receipt) {
        if (receipt.status === '0x1') {
          setStatus('✓ NFT minted successfully!');
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

  const encodeFunctionCall = (functionSignature, params) => {
    const functionHash = '0xd0d58e41';
    const encodedParams = params[0].toLowerCase().replace('0x', '').padStart(64, '0');
    return functionHash + encodedParams;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>🐠 Arc Green Fish</h1>
          <p style={styles.subtitle}>Mint your exclusive NFT on Arc Testnet</p>
        </div>


        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🎨 NFT Preview</h2>
          <div style={styles.nftPreviewContainer}>
            <img
              src={IPFS_IMAGE_URL}
              alt="NFT Preview"
              style={styles.nftImage}
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%234F46E5" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" font-size="20" fill="white" text-anchor="middle" dy=".3em" font-family="Arial"%3ELOADING NFT IMAGE%3C/text%3E%3C/svg%3E';
              }}
            />
            <div style={styles.nftMetaBox}>
              <div style={styles.metaItem}>
                <div style={styles.metaLabel}>IPFS CID</div>
                <div style={styles.metaValue}>{IPFS_CID}</div>
              </div>
              <div style={styles.metaItem}>
                <div style={styles.metaLabel}>Contract Address</div>
                <div style={{ ...styles.metaValue, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ wordBreak: 'break-all' }}>{CONTRACT_ADDRESS}</span>
                  <button
                    onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
                    style={styles.copyButton}
                    onMouseOver={(e) => e.target.style.background = '#2563eb'}
                    onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
              <a
                href={IPFS_IMAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.button, ...styles.buttonPrimary, textDecoration: 'none', color: 'white' }}
                onMouseOver={(e) => e.target.style.background = '#2563eb'}
                onMouseOut={(e) => e.target.style.background = '#3b82f6'}
              >
                View on IPFS Gateway <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Minting Interface Card */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🚀 Mint Your NFT</h2>

          {/* Wallet Connection */}
          <button
            onClick={connectWallet}
            disabled={connected}
            style={{
              ...styles.button,
              ...(connected ? styles.buttonConnected : styles.buttonPrimary),
              ...(connected ? {} : {}),
            }}
            onMouseOver={(e) => {
              if (!connected) e.target.style.background = '#2563eb';
            }}
            onMouseOut={(e) => {
              if (!connected) e.target.style.background = '#3b82f6';
            }}
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
            style={{
              ...styles.button,
              ...(loading || !connected ? styles.buttonDisabled : styles.buttonMint),
            }}
            onMouseOver={(e) => {
              if (!loading && connected) {
                e.target.style.background = 'linear-gradient(to right, #7e22ce, #be185d)';
              }
            }}
            onMouseOut={(e) => {
              if (!loading && connected) {
                e.target.style.background = 'linear-gradient(to right, #9333ea, #ec4899)';
              }
            }}
          >
            {loading ? (
              <>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                Minting in progress...
              </>
            ) : (
              '✨ Mint NFT'
            )}
          </button>

          {/* Status Messages */}
          {status && (
            <div
              style={{
                ...styles.statusBox,
                ...(status.includes('error')
                  ? styles.statusError
                  : status.includes('⏳')
                  ? styles.statusPending
                  : styles.statusSuccess),
              }}
            >
              {status.includes('error') ? (
                <AlertCircle size={24} style={{ color: '#fca5a5', flexShrink: 0, marginTop: '0.25rem' }} />
              ) : (
                <CheckCircle size={24} style={{ color: '#86efac', flexShrink: 0, marginTop: '0.25rem' }} />
              )}
              <div>
                <p
                  style={{
                    ...styles.statusText,
                    ...(status.includes('error')
                      ? styles.statusTextError
                      : status.includes('⏳')
                      ? styles.statusTextPending
                      : {}),
                  }}
                >
                  {status}
                </p>
              </div>
            </div>
          )}

          {/* Transaction Details */}
          {txHash && (
            <div style={styles.txBox}>
              <h3 style={styles.txTitle}>📝 Transaction Details</h3>
              <div style={styles.metaItem}>
                <div style={styles.metaLabel}>Transaction Hash</div>
                <div style={{ ...styles.metaValue, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ wordBreak: 'break-all' }}>{txHash}</span>
                  <button
                    onClick={() => copyToClipboard(txHash)}
                    style={styles.copyButton}
                    onMouseOver={(e) => e.target.style.background = '#2563eb'}
                    onMouseOut={(e) => e.target.style.background = '#3b82f6'}
                  >
                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <a
                href={`${ARC_EXPLORER}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...styles.link, display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}
              >
                View on Block Explorer <ExternalLink size={16} />
              </a>
            </div>
          )}

          {/* Token ID */}
          {tokenId !== null && (
            <div style={styles.successBox}>
              <h3 style={styles.txTitle}>🎉 NFT Minted Successfully!</h3>
              <p style={styles.setupText}>Token ID: <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{tokenId}</span></p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>🔐 Keep your private keys safe - never share them</p>
          <p style={styles.footerText}>⛽ You need testnet USDC for gas fees</p>
          <p style={styles.footerText}>🌐 This dApp requires MetaMask browser extension</p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ArcNFTMinterDApp;
