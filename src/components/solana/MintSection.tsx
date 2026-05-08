import {
  useState,
} from "react";
import {
  usePhantom,
  useModal,
  useSolana,
  useDisconnect,
} from "@phantom/react-sdk";
import { useCandyMachineState } from "./useCandyMachineState";
import { useMintNft } from "./useMintNft";
import { MINT_PRICE_DISPLAY } from "../../lib/solana/constants";

export function MintSection() {
  const [quantity, setQuantity] = useState(1);
  const { isConnected } = usePhantom();
  const { solana } = useSolana();
  const { open } = useModal();
  const { disconnect } = useDisconnect();
  const { state, loading: cmLoading, refetch } = useCandyMachineState();
  const { mint, status, result, error, reset } = useMintNft(refetch);

  const isMinting = status === "minting";
  const isSoldOut = state ? state.redeemed >= state.available : false;
  const mintDisabled = !isConnected || isMinting || isSoldOut;
  const walletAddress = solana.publicKey ?? "";
  const redeemed = state?.redeemed ?? 0;
  const available = state?.available ?? 0;
  const left = Math.max(available - redeemed, 0);
  const maxPerWallet = 5;
  const maxSelectable = Math.max(Math.min(maxPerWallet, left || maxPerWallet), 1);
  const mintedPercent = state && state.available > 0
    ? Math.round((state.redeemed / state.available) * 100)
    : 0;
  const statusLabel =
    !isConnected
      ? "WALLET REQUIRED"
      : isSoldOut
        ? "SOLD OUT"
        : isMinting
          ? "TX PENDING"
          : status === "success"
            ? "MINTED OK"
            : status === "error"
              ? "MINT ERROR"
              : "DEVNET DROP";

  const short = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  const decreaseQty = () => setQuantity((current) => Math.max(1, current - 1));
  const increaseQty = () => setQuantity((current) => Math.min(maxSelectable, current + 1));
  const mintSelected = () => mint(quantity);

  return (
    <div className="mint-shell">
      <div className="mint-marquee">
        <div className="mint-marquee-track">
          ★ DEVNET MINT IS LIVE ★ ►►► {left} LEFT ★ NOT FINANCIAL ADVICE ★
        </div>
      </div>

      <div className="mint-card">
        <div className="mint-card-head">
          <span className="mint-card-head-left">
            <span className="mint-head-icon">$</span>
            <span>Ponzilio Mint Module v1.0</span>
          </span>
          <span className="mint-status-pill">
            <span className={`mint-status-dot ${!isConnected ? "coming" : ""} ${isSoldOut ? "dead" : ""}`}></span>
            {statusLabel}
          </span>
        </div>

        <div className="mint-card-body">
          <div className="mint-intro">
            <h1 className="mint-title">
              Toxic Ponzilio <em>Boyfriends</em>
            </h1>
            <p className="mint-subtitle">777 supply · Public mint</p>
          </div>

          <table className="mint-stats">
            <tbody>
              <tr>
                <th>Drop name</th>
                <td>Toxic Ponzilio Boyfriends</td>
              </tr>
              <tr>
                <th>Supply</th>
                <td className="mono-cell">
                  {cmLoading ? "..." : `${redeemed} / ${available}`}
                </td>
              </tr>
              <tr>
                <th>Price per Ponzilio</th>
                <td className="mono-cell">{MINT_PRICE_DISPLAY}</td>
              </tr>
              <tr>
                <th>Max per wallet</th>
                <td>{maxPerWallet}</td>
              </tr>
              <tr>
                <th>Wallet</th>
                <td>{isConnected && walletAddress ? short(walletAddress) : "Connect wallet required"}</td>
              </tr>
              <tr>
                <th>Refund policy</th>
                <td>
                  <a href="/refund" className="refund-link">Ask for refund »</a>
                </td>
              </tr>
              <tr>
                <th>Trusted by</th>
                <td className="trusted-cell">
                  {status === "success" && result
                    ? `holder of ${short(result.assetAddress)}`
                    : "your mom & 69 schemers"}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mint-progress-wrap">
            <div className="mint-progress">
              <div
                className={`mint-progress-fill ${isSoldOut ? "soldout" : ""}`}
                style={{ width: `${mintedPercent}%` }}
              ></div>
              <div className="mint-progress-copy">
                {cmLoading ? "loading mint stats..." : `${redeemed}/${available} minted (${mintedPercent}%)`}
              </div>
            </div>
          </div>

            <div className="qty-row">
              <span className="qty-label">Qty</span>
              <div className="qty-controls">
                <button type="button" onClick={decreaseQty} disabled={quantity <= 1 || isMinting}>−</button>
                <input value={quantity} readOnly aria-label="Mint quantity" />
                <button type="button" onClick={increaseQty} disabled={quantity >= maxSelectable || isMinting}>+</button>
              </div>
            </div>

          {isConnected && walletAddress && (
            <div className="mint-banner success">
              Connected: {short(walletAddress)}
              <button type="button" onClick={() => disconnect()} className="inline-link">
                Disconnect
              </button>
            </div>
          )}

          {status === "minting" && (
            <div className="mint-banner pending">Minting in progress...</div>
          )}

          {status === "success" && result && (
            <div className="mint-banner success">
              Minted {result.mintedCount} item{result.mintedCount > 1 ? "s" : ""}.{" "}
              <a href={result.explorerUrl} target="_blank" rel="noopener noreferrer">
                View last mint on Explorer
              </a>
            </div>
          )}

          {status === "error" && error && (
            <div className="mint-banner error">{error}</div>
          )}

          {!isConnected && !isSoldOut && (
            <button id="mint-connect" className="mint-button mint-button-secondary" onClick={open}>
              CONNECT WALLET
            </button>
          )}

          {isConnected && !isSoldOut && status !== "success" && (
            <button className="mint-button" onClick={mintSelected} disabled={mintDisabled}>
              {isMinting ? "MINTING..." : `MINT ${quantity}`}
            </button>
          )}

          {status === "success" && (
            <button className="mint-button mint-button-secondary" onClick={reset}>
              MINT ANOTHER
            </button>
          )}

          {status === "error" && (
            <button className="mint-button mint-button-danger" onClick={reset}>
              TRY AGAIN
            </button>
          )}
        </div>
      </div>

      <div className="mint-badge-wrap">
        <div className="mint-badge">
          <span className="mint-badge-icon">S</span>
          <span>IP secured with TheSage™</span>
        </div>
      </div>

      <a
        href="/"
        className="mint-back-link"
      >
        « Back
      </a>

      <style>{`
        .mint-shell {
          position: relative;
          z-index: 10;
          min-height: calc(100vh - 90px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 20px 34px;
        }
        .mint-marquee {
          width: min(100%, 860px);
          margin: 0 auto 16px;
          overflow: hidden;
          border: 2px solid #2a2a2a;
          background: #000;
          color: #ffe96b;
        }
        .mint-marquee-track {
          display: flex;
          justify-content: center;
          padding: 10px 16px;
          font-family: "VT323", monospace;
          font-size: 20px;
          letter-spacing: 0.04em;
          text-align: center;
        }
        .mint-card {
          width: min(100%, 860px);
          border: 2px solid #061a3f;
          background: #f8f8f4;
          box-shadow: 4px 4px 0 rgba(6, 26, 63, 0.24);
        }
        .mint-card-head {
          min-height: 48px;
          padding: 0 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          background: linear-gradient(180deg, #668cb3 3%, #336699 97%);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }
        .mint-card-head-left {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .mint-head-icon {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #000;
          background: #ffe96b;
          color: #000;
          font-family: "VT323", monospace;
          font-size: 16px;
          line-height: 1;
        }
        .mint-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 30px;
          padding: 0 12px;
          border: 1px solid rgba(255, 255, 255, 0.45);
          background: rgba(4, 18, 56, 0.34);
          color: #fff4b0;
          font-family: "VT323", monospace;
          font-size: 16px;
          white-space: nowrap;
        }
        .mint-status-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: #0bf80a;
          border: 1px solid #084a1f;
          box-shadow: 0 0 6px rgba(11, 248, 10, 0.45);
        }
        .mint-status-dot.coming {
          background: #ffd24a;
          box-shadow: 0 0 6px rgba(255, 210, 74, 0.45);
        }
        .mint-status-dot.dead {
          background: #ff5e5e;
          box-shadow: 0 0 6px rgba(255, 94, 94, 0.45);
        }
        .mint-card-body {
          padding: 22px 24px 24px;
        }
        .mint-intro {
          margin-bottom: 14px;
        }
        .mint-title {
          margin: 0 0 5px;
          color: #003366;
          font-size: clamp(2.2rem, 5vw, 3.3rem);
          line-height: 1.02;
          font-weight: 700;
        }
        .mint-title em {
          color: #2f44ff;
          font-style: italic;
        }
        .mint-subtitle {
          margin: 0;
          color: #445a72;
          font-size: 14px;
          font-style: italic;
        }
        .mint-stats {
          width: 100%;
          margin: 0 0 14px;
          border-collapse: collapse;
          border: 2px solid #99a7b8;
          background: #fff;
        }
        .mint-stats th,
        .mint-stats td {
          padding: 7px 10px;
          border: 1px solid #c7d1db;
          text-align: left;
          vertical-align: middle;
          font-size: 12px;
        }
        .mint-stats th {
          width: 48%;
          background: linear-gradient(180deg, #dbe6f7 0%, #c5d2e8 100%);
          color: #003366;
          font-weight: 700;
        }
        .mono-cell {
          font-family: "VT323", monospace;
          color: #0100fc;
          font-size: 24px;
          line-height: 1;
        }
        .trusted-cell {
          font-style: italic;
          color: #555;
        }
        .refund-link {
          display: inline-block;
          padding: 4px 12px;
          border: 1px solid #9e6a00;
          background: linear-gradient(180deg, #ffd84d 0%, #f1b100 100%);
          color: #000 !important;
          text-decoration: none !important;
          font-weight: 700;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.45);
        }
        .mint-progress-wrap {
          margin-bottom: 14px;
        }
        .mint-progress {
          position: relative;
          height: 20px;
          overflow: hidden;
          border: 2px solid #4f4f4f;
          background: #fff;
        }
        .mint-progress-fill {
          height: 100%;
          background: repeating-linear-gradient(135deg, #64b564 0 10px, #478f47 10px 20px);
          transition: width .25s ease;
        }
        .mint-progress-fill.soldout {
          background: repeating-linear-gradient(135deg, #de8e8e 0 10px, #b54242 10px 20px);
        }
        .mint-progress-copy {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1f1f1f;
          font-family: "VT323", monospace;
          font-size: 16px;
          font-weight: 700;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
          pointer-events: none;
        }
        .mint-banner {
          margin: 0 0 12px;
          padding: 10px 12px;
          border: 1px solid #061a3f;
          font-size: 12px;
          font-weight: 700;
          text-align: center;
        }
        .mint-banner.pending {
          background: #ffffcc;
          border-color: #d9d95a;
          color: #7a5e00;
        }
        .mint-banner.success {
          background: #e8ffe5;
          border-color: #79b46c;
          color: #0a6a0f;
        }
        .mint-banner.error {
          background: #ffe3e3;
          border-color: #cd8a8a;
          color: #9f2323;
        }
        .qty-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin: 0 0 18px;
          padding: 12px 14px;
          border: 2px solid #c8c8c8;
          background: #f3ecde;
        }
        .qty-label {
          color: #1e1e1e;
          font-size: 15px;
          font-weight: 700;
        }
        .qty-controls {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .qty-controls button {
          width: 34px;
          height: 34px;
          border: 1px solid #8f8f8f;
          background: linear-gradient(180deg, #ffffff 0%, #d7d7d7 100%);
          color: #111;
          font-size: 24px;
          line-height: 1;
          font-weight: 700;
          cursor: pointer;
        }
        .qty-controls button:disabled {
          opacity: 0.45;
          cursor: default;
        }
        .qty-controls input {
          width: 50px;
          height: 32px;
          border: 1px solid #8f8f8f;
          background: #fff;
          text-align: center;
          color: #111;
          font-size: 18px;
          font-weight: 700;
        }
        .inline-link {
          margin-left: 8px;
          border: 0;
          padding: 0;
          background: transparent;
          color: inherit;
          font: inherit;
          text-decoration: underline;
          cursor: pointer;
        }
        .mint-button {
          width: 100%;
          min-height: 58px;
          border: 2px solid #061a3f;
          background: linear-gradient(180deg, #668cb3 0%, #336699 100%);
          color: #fff;
          font-family: "Pixelify Sans", Verdana, sans-serif;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.35), 0 3px 0 rgba(6, 26, 63, 0.22);
        }
        .mint-button + .mint-button {
          margin-top: 10px;
        }
        .mint-button:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .mint-button-secondary {
          background: linear-gradient(180deg, #668cb3 0%, #336699 100%);
        }
        .mint-button-danger {
          background: linear-gradient(180deg, #d48686 0%, #b64040 100%);
        }
        .mint-back-link {
          display: inline-block;
          margin-top: 14px;
          color: #0100fc;
          font-size: 12px;
          font-weight: 700;
        }
        .mint-badge-wrap {
          margin-top: 16px;
        }
        .mint-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border: 1px solid #a0a0a0;
          background: #fff;
          color: #2b2b2b;
          font-size: 12px;
        }
        .mint-badge-icon {
          width: 18px;
          height: 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #000;
          background: #ff9800;
          color: #fff;
          font-family: "Pixelify Sans", Verdana, sans-serif;
          font-size: 12px;
          line-height: 1;
        }
        @media (max-width: 520px) {
          .mint-card-head {
            font-size: 12px;
            align-items: flex-start;
            flex-direction: column;
            padding-top: 10px;
            padding-bottom: 10px;
          }
          .mint-card-body {
            padding: 14px;
          }
          .qty-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
