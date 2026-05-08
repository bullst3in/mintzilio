import { SolanaWalletProvider } from "../../../../components/solana/WalletProvider";
import { LegacyMintSection } from "./MintSection";

export default function LegacyMintPage() {
  return (
    <SolanaWalletProvider>
      <LegacyMintSection />
    </SolanaWalletProvider>
  );
}
