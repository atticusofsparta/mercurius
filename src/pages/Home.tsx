import { connect } from '@permaweb/aoconnect/browser';
import { createThirdwebDataItemSigner } from '@src/services/signing';
import { ConnectWallet } from '@thirdweb-dev/react';
import { useState } from 'react';
import { createThirdwebClient } from 'thirdweb';

function Home() {
  const [processId, setProcessId] = useState<string>('');

  const ao = connect();

  async function spawn() {
    const thirdProvider = createThirdwebClient({
      clientId: 'b38da6b976bd27a99a8c6d1f9cda3e6e',
    });
    const dataItemSigner = createThirdwebDataItemSigner(thirdProvider);

    const res = await ao.spawn({
      module: 'nI_jcZgPd0rcsnjaHtaaJPpMCW847ou-3RGA5_W3aZg',
      scheduler: '_GQ33BkPtZrqxA84vM8Zk-N2aO0toNNu_C-l-rawrBA',
      signer: dataItemSigner as any,
    });

    console.log(res);
    setProcessId(res);
  }

  return (
    <div>
      <h1>Home</h1>
      <ConnectWallet />
      <button onClick={spawn}> Spawn Process </button>
      <span className="">Process: {processId}</span>
    </div>
  );
}

export default Home;
