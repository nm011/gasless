import { WalletProvider } from './contexts/WalletContext.jsx';
import TransferForm from './components/TransferForm';
import { Box, Button, Typography } from '@mui/material';
import { useContext } from 'react';
import { WalletContext } from './contexts/WalletContext';

function AppContent() {
  const { account, connectWallet } = useContext(WalletContext);

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h3" gutterBottom>
        Gasless Transaction Forwarder
      </Typography>
      
      {!account ? (
        <Button 
          variant="contained" 
          size="large"
          onClick={connectWallet}
        >
          Connect MetaMask
        </Button>
      ) : (
        <>
          <Typography variant="body1" gutterBottom>
            Connected Account: {account}
          </Typography>
          <TransferForm />
        </>
      )}
    </Box>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}