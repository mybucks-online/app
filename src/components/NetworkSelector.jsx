import Select from "@mybucks/components/Select";
import { EVM_NETWORKS, NETWORK } from "@mybucks/lib/conf";

const NetworkSelector = ({ network, chainId, updateNetwork }) => {
  const onChange = (e) => {
    const [n, cid] = e.target.value.split(".");
    updateNetwork(n, parseInt(cid));
  };

  return (
    <Select onChange={onChange} value={network + "." + chainId}>
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
