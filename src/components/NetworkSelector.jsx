import Select from "@mybucks/components/Select";
import { EVM_NETWORKS, NETWORK } from "@mybucks/lib/conf";

const NetworkSelector = ({ network, chainId, updateNetwork }) => {
  const onChange = (e) => {
    const [n, cid] = e.target.value.split(".");
    updateNetwork(n, parseInt(cid));
  };

  return (
    <Select onChange={onChange} value={network + "." + chainId}>
      {Object.values(EVM_NETWORKS).map(({ chainId: cId, label }) => (
        <option key={cId} value={NETWORK.EVM + "." + cId}>
          {label}
        </option>
      ))}

      <option value={NETWORK.TRON + ".1"}>Tron</option>
    </Select>
  );
};

export default NetworkSelector;
