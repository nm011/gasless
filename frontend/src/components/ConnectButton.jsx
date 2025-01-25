import { useContext } from 'react';
import { WalletContext } from '../contexts/WalletContext';
import Button from '@mui/material/Button';

export default function ConnectButton() {
  const { account, connectWallet } = useContext(WalletContext);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      {!account ? (
        <Button 
          variant="contained" 
          size="large"
          onClick={connectWallet}
        >
          Connect MetaMask
        </Button>
      ) : (
        <div style={{ color: 'green', marginBottom: '20px' }}>
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}
    </div>
  );
}