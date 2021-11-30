import './App.css';
import { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
  Program, Provider, web3, Wallet
} from '@project-serum/anchor';
import idl from './idl.json';

import { getPhantomWallet } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
require('@solana/wallet-adapter-react-ui/styles.css');

const anchor = require("@project-serum/anchor");
const serumCmn = require("@project-serum/common");
const { Token, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const splToken = require('@solana/spl-token');

const network = clusterApiUrl('devnet');
const wallets = [
  /* view list of available wallets at https://github.com/solana-labs/wallet-adapter#wallets */
  getPhantomWallet()
]

const { SystemProgram, Keypair } = web3;
/* create an account  */
//const baseAccount = Keypair.generate();
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
  const [value, setValue] = useState(null);
  const wallet = useWallet();

  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    //const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new Provider(
      connection, wallet, opts.preflightCommitment,
    );
    return provider;
  }

  async function createTransfer() {    
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = await getProvider();
    /* create the program interface combining the idl, program ID, and provider */
    const program = new Program(idl, programID, provider);
    const INTERACTION_FEE = 1; //200000000000000;

    const MINT_TOKENS = 400;
    const MINT_DECIMALS = 0;

    let mint = null;
    let god = null;
    let creatorAcc = anchor.web3.Keypair.generate();
    let creatorTokenAcc = null;

    const [_mint, _god] = await serumCmn.createMintAndVault(
      program.provider,
      new anchor.BN(MINT_TOKENS),
      undefined,
      MINT_DECIMALS
    );
    mint = _mint;
    god = _god;

    creatorTokenAcc =await serumCmn.createTokenAccount(
      program.provider,
      mint,
      creatorAcc.publicKey
    );

    console.log('*************', {
      from: god.toBase58(),
      to: creatorTokenAcc.toBase58(),
      tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
      programId: program.programId.toBase58(),
    });
    
    await program.rpc.interaction(new anchor.BN(INTERACTION_FEE), {
      accounts: {
        from: god,
        to: creatorTokenAcc,
        owner: program.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    // try {
    //   var myMint = new web3.PublicKey('DHEHFWQcbqGGxjYAz3Sk1PgSJQMfTpURFvUVUJRMtQCY');  
    //   var myToken  = new splToken.Token(
    //     connection,
    //     myMint,
    //     splToken.TOKEN_PROGRAM_ID,
    //     program.provider.wallet
    //   );      
    //   var fromTokenAccount = await myToken.getOrCreateAssociatedAccountInfo(
    //     program.provider.wallet.publicKey
    //   );

    //   var creatorAcc = anchor.web3.Keypair.generate();
    //   //const toWallet = new web3.PublicKey(to);      
    //   console.log('toWallet: '+toWallet.publicKey.toString());         
    //   var toTokenAccount =await serumCmn.createTokenAccount(
    //     program.provider,
    //     myToken,
    //     toWallet.publicKey
    //   );
      
    //   await program.rpc.interaction(new anchor.BN(INTERACTION_FEE), {
    //     accounts: {
    //       from: fromTokenAccount,
    //       to: toTokenAccount,
    //       owner: program.provider.wallet.publicKey,
    //       tokenProgram: program.programId,
    //     },
    //   });
      /* interact with the program via rpc */
      // await program.rpc.create({
      //   accounts: {
      //     baseAccount: baseAccount.publicKey,
      //     user: provider.wallet.publicKey,
      //     systemProgram: SystemProgram.programId,
      //   },
      //   signers: [baseAccount]
      // });

      //const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      //console.log('account: ', account);
      //setValue(account.count.toString());
    // } catch (err) {
    //   console.log("Transaction error: ", err);
    // }
  }

  if (!wallet.connected) {
    /* If the user's wallet is not connected, display connect wallet button. */
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="App">
        <div>
          {
            !value && (<button onClick={createTransfer}>Transfer Token</button>)
          }
          {
            value && value >= Number(0) ? (
              <h2>{value}</h2>
            ) : (
              <h3>Please create the counter.</h3>
            )
          }
        </div>
      </div>
    );
  }
}

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
const AppWithProvider = () => (
  <ConnectionProvider endpoint={network}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;