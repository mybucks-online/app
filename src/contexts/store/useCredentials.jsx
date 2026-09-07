import { useState } from "react";

const useCredentials = () => {
  const [passphrase, setPassphrase] = useState("");
  const [pin, setPin] = useState("");
  const [hash, setHash] = useState("");
  const [legacy, setLegacy] = useState(false);

  const setup = (pw, pc, lgcy, hsh) => {
    setPassphrase(pw);
    setPin(pc);
    setLegacy(lgcy);
    setHash(hsh);
  };

  const reset = () => {
    setPassphrase("");
    setPin("");
    setHash("");
    setLegacy(false);
  };

  return { passphrase, pin, hash, legacy, setup, reset };
};

export default useCredentials;
