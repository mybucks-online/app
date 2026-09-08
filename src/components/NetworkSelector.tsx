import type { ChangeEvent } from "react";

import Select from "@mybucks/components/Select";
import { EVM_NETWORKS, NETWORK } from "@mybucks/lib/conf";

type NetworkSelectorProps = {
  network: NETWORK;
  chainId: number;
  updateNetwork: (net: NETWORK, id: number) => void;
  disabled?: boolean;
};

const NetworkSelector = ({
  network,
  chainId,
  updateNetwork,
  disabled,
}: NetworkSelectorProps) => {
  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const [n, cid] = e.target.value.split(".");
    updateNetwork(n as NETWORK, parseInt(cid));
  };

  return (
    <Select
      onChange={onChange}
      value={network + "." + chainId}
      disabled={disabled}
    >
      {EVM_NETWORKS.map(({ chainId: cid, label }) => (
        <option key={cid} value={NETWORK.EVM + "." + cid}>
          {label}
        </option>
      ))}

      <option value={NETWORK.TRON + ".1"}>Tron</option>
    </Select>
  );
};

export default NetworkSelector;
