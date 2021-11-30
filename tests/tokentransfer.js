const anchor = require("@project-serum/anchor");
const serumCmn = require("@project-serum/common");
const { TOKEN_PROGRAM_ID } = require("@solana/spl-token");

describe("tokentransfer", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.Tokentransfer;

  const MINT_TOKENS = 4200000000000000; // 42M with 8dp
  const MINT_DECIMALS = 8;

  let mint = null;
  let god = null;
  let creatorAcc = anchor.web3.Keypair.generate();
  let creatorTokenAcc = null;

  it("Sets up initial test state", async () => {
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
  });

  it("Actions an interaction", async () => {
    //const INTERACTION_FEE = 200000000000000;
    const INTERACTION_FEE = 100000000;

    // let [_authority, nonce] = await anchor.web3.PublicKey.findProgramAddress(
    //   [god.toBuffer()],
    //   program.programId
    // );
    // authority = _authority;

    console.log('*************', {
      from: god.toBase58(),
      to: creatorTokenAcc.toBase58(),
      tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
      programId: program.programId.toBase58(),
    });

    console.log('*************', {
      from: god,
      to: creatorTokenAcc,
      owner: program.provider.wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    });

    await program.rpc.interaction(new anchor.BN(INTERACTION_FEE), {
      accounts: {
        from: god,
        to: creatorTokenAcc,
        owner: program.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
  });
});
