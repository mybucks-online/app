import type { ChangeEvent } from "react";

import Select from "@mybucks/components/Select";
import { EVM_NETWORKS, NETWORK, type NetworkKind } from "@mybucks/lib/conf";

type NetworkSelectorProps = {
  network: NetworkKind;
  chainId: number;
  updateNetwork: (net: NetworkKind, id: number) => void;
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
    updateNetwork(n as NetworkKind, parseInt(cid));
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
