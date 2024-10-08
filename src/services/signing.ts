import {
  Curve25519,
  EthereumSigner,
  InjectedEthereumSigner,
  SolanaSigner,
} from 'arbundles';
import { ArweaveSigner, createData } from 'arbundles';
import Arweave from 'arweave';
import fs from 'fs';
import { ThirdwebClient } from 'thirdweb';
import { createWallet } from 'thirdweb/wallets';

export const arweave = Arweave.init({
  host: 'arweave.net',
  protocol: 'https',
  port: 443,
});

export async function generateWallet() {
  const jwk = await arweave.wallets.generate();
  const walletFileName = 'key.json';
  await fs.writeFileSync(walletFileName, JSON.stringify(jwk));
  return { jwk, walletFileName };
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createArweaveDataItemSigner(wallet: any) {
  const signer = async ({ data, tags, target, anchor }: any) => {
    const arSigner = new ArweaveSigner(wallet);
    const dataItem = createData(data, arSigner, { tags, target, anchor });

    const res = await dataItem.sign(arSigner).then(async () => ({
      id: await dataItem.id,
      raw: await dataItem.getRaw(),
    }));

    console.dir(
      {
        valid: await dataItem.isValid(),
        signature: await dataItem.signature,
        owner: await dataItem.owner,
        tags: await dataItem.tags,
        id: await dataItem.id,
        res,
      },
      { depth: 2 },
    );
    return res;
  };

  return signer;
}

/**
 * @param ethersProvider - BrowserProvider
 * @returns signer
 */
export function createThirdwebDataItemSigner(thirdProvider: ThirdwebClient) {
  /**
   * createDataItem can be passed here for the purposes of unit testing
   * with a stub
   */
  const signer = async ({ data, tags, target, anchor }: any) => {
    const mm = await createWallet('io.metamask');
    await mm.connect({ client: thirdProvider });
    const account = await mm.getAccount();
    const provider = {
      getSigner: () => ({
        signMessage: async (message: any) => {
          console.log(message);
          const signed = await account?.signMessage({
            message: typeof message == 'string' ? message : { raw: message },
          });
          console.log(signed);
          return signed;
        },
      }),
    };
    const ethSigner = new InjectedEthereumSigner(provider as any);
    await ethSigner.setPublicKey();
    const dataItem = createData(data, ethSigner, { tags, target, anchor });

    const res = await dataItem
      .sign(ethSigner)
      .then(async () => ({
        id: await dataItem.id,
        raw: await dataItem.getRaw(),
      }))
      .catch((e) => console.error(e));

    console.dir(
      {
        valid: await EthereumSigner.verify(
          ethSigner.publicKey,
          await dataItem.getSignatureData(),
          dataItem.rawSignature,
        ),
        signature: await dataItem.signature,
        owner: await dataItem.owner,
        tags: await dataItem.tags,
        id: await dataItem.id,
        res,
      },
      { depth: 2 },
    );
    return res;
  };

  return signer;
}

export function createNodeEthereumDataItemSigner(pk: string) {
  /**
   * createDataItem can be passed here for the purposes of unit testing
   * with a stub
   */
  const ethSigner = new EthereumSigner(pk);
  const signer = async ({ data, tags, target, anchor }: any) => {
    const dataItem = createData(data, ethSigner, { tags, target, anchor });

    const res = await dataItem
      .sign(ethSigner)
      .then(async () => ({
        id: await dataItem.id,
        raw: await dataItem.getRaw(),
      }))
      .catch((e) => console.error(e));

    console.dir(
      {
        valid: await EthereumSigner.verify(
          ethSigner.publicKey,
          await dataItem.getSignatureData(),
          dataItem.rawSignature,
        ),
        signature: await dataItem.signature,
        owner: await dataItem.owner,
        tags: await dataItem.tags,
        id: await dataItem.id,
        res,
      },
      { depth: 2 },
    );
    return res;
  };

  return signer;
}

export function createSolanaDataItemSigner(pk: string) {
  /**
   * createDataItem can be passed here for the purposes of unit testing
   * with a stub
   */
  const solSigner = new SolanaSigner(pk);
  const signer = async ({ data, tags, target, anchor }: any) => {
    const dataItem = createData(data, solSigner, { tags, target, anchor });

    const res = await dataItem
      .sign(solSigner)
      .then(async () => ({
        id: await dataItem.id,
        raw: await dataItem.getRaw(),
      }))
      .catch((e) => console.error(e));
    console.dir(
      {
        valid: await SolanaSigner.verify(
          solSigner.publicKey,
          await dataItem.getSignatureData(),
          dataItem.rawSignature,
        ),
        signature: await dataItem.signature,
        owner: await dataItem.owner,
        tags: await dataItem.tags,
        id: await dataItem.id,
        res,
      },
      { depth: 2 },
    );
    return res;
  };

  return signer;
}

export function createMoneroDataItemSigner(
  privateKey: string,
  publicKey: string,
) {
  /**
   * createDataItem can be passed here for the purposes of unit testing
   * with a stub
   */
  class MoneroSigner extends Curve25519 {
    constructor(_key: string, pk: string) {
      super(_key, pk);
    }
    public get publicKey(): Buffer {
      return Buffer.from(this.pk, 'hex');
    }

    public get key(): Uint8Array {
      return Buffer.from(this._key, 'hex');
    }
  }
  const moneroSigner = new MoneroSigner(privateKey, publicKey);
  const signer = async ({ data, tags, target, anchor }: any) => {
    const dataItem = createData(data, moneroSigner, { tags, target, anchor });

    const res = await dataItem
      .sign(moneroSigner)
      .then(async () => ({
        id: await dataItem.id,
        raw: await dataItem.getRaw(),
      }))
      .catch((e) => console.error(e));
    console.dir(
      {
        valid: await MoneroSigner.verify(
          moneroSigner.publicKey,
          await dataItem.getSignatureData(),
          dataItem.rawSignature,
        ),
        signature: await dataItem.signature,
        owner: await dataItem.owner,
        tags: await dataItem.tags,
        id: await dataItem.id,
        res,
      },
      { depth: 2 },
    );
    return res;
  };

  return signer;
}
