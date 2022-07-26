import React from "react";

type Props = {
  account: string;
  web3Handler: () => void;
};

const Navbar: React.FC<Props> = ({ account, web3Handler }) => {
  return (
    <nav>
      {account ? (
        <p>{account.slice(0, 5) + "..." + account.slice(38, 42)}</p>
      ) : (
        <button onClick={web3Handler} className="button">
          Connect Wallet
        </button>
      )}
    </nav>
  );
};

export default Navbar;
