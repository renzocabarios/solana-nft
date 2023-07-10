import "dotenv/config";
import base58 from "bs58";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import fs from "fs";
import { Connection, Keypair, clusterApiUrl } from "@solana/web3.js";
const connection = new Connection(clusterApiUrl("devnet"));

export const createMetaplexInstane = () => {
  const keypairFromSecretKey = Keypair.fromSecretKey(
    base58.decode(process.env.PRIVATE_KEY_1)
  );

  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(keypairFromSecretKey))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network/",
        providerUrl: "https://api.devnet.solana.com/",
        timeout: 60000,
      })
    );
  return metaplex;
};

async function main() {
  // Create multiplex instance
  const metaplex = createMetaplexInstane();

  // Upload image file
  const buffer = fs.readFileSync("./assets/3.jpg");
  const file = toMetaplexFile(buffer, "image.jpg");
  const imageURL = await metaplex.storage().upload(file);

  const metadata = {
    name: "renzo.sol.NFT",
    description: "Santa's alter ego",
    image: imageURL,
    symbol: "NOOB",
    attributes: [
      {
        trait_type: "Event",
        value: "Solana Developers Bootcamp",
      },
    ],
  };
  // Upload image file to metadata
  const { uri } = await metaplex.nfts().uploadMetadata(metadata);

  // Upload metadata to nft
  const temp = await metaplex.nfts().create({
    uri,
    name: "Fake Santa",
    sellerFeeBasisPoints: 0,
  });

  console.log("nft", temp.nft.address.toString());
}

main();
