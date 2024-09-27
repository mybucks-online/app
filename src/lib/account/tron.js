import TronWeb from "tronweb";

class TronAccount {
  static network = "tron";

  signer = null;
  account = null;

  constructor(hashKey) {}

  get address() {}

  linkOfAddress(address) {}

  linkOfContract(address) {}

  linkOfTransaction(txn) {}

  async getNetworkStatus() {}

  async queryBalances() {}

  async queryTokenHistory(contractAddress) {}

  async populateTransferToken(token, to, value) {}

  async estimateGas() {}

  async execute() {}
}

export default TronAccount;
