import Deploy from '@models/deploys';
export const setDeploy = async (deployResult) => {
  let entryPoint: string =
    deployResult?.deploy?.session?.StoredContractByHash ||
    deployResult?.deploy?.session?.StoredContractByName
      ? deployResult?.deploy?.session.StoredContractByHash?.entry_point ||
        deployResult?.deploy?.session.StoredContractByName?.entry_point
      : deployResult.deploy?.session?.Transfer
      ? 'Transfer'
      : deployResult.deploy?.session?.ModuleBytes
      ? 'WASM Deploy'
      : 'N/A';
  entryPoint = entryPoint.replace('_', ' ');
  await Deploy.create({
    deployHash: deployResult.deploy?.hash,
    publicKey: deployResult.deploy?.header?.account,
    blockHash: deployResult?.execution_results[0].block_hash,
    timestamp: deployResult.deploy.header.timestamp,
    entryPoint: entryPoint.charAt(0).toUpperCase() + entryPoint.slice(1),
    amount:
      deployResult?.deploy?.session.StoredContractByHash?.args[2]?.[1]?.parsed ||
      deployResult.deploy?.session?.Transfer?.args[0]?.[1]?.parsed ||
      deployResult.deploy?.session?.ModuleBytes?.args[0]?.[1]?.parsed ||
      0,
    cost:
      deployResult?.execution_results[0]?.result?.Success?.cost ||
      deployResult?.execution_results[0]?.result?.Failure?.cost ||
      0,
    rawData: deployResult
  })
    .then((deploy) => console.log(deploy.deployHash))
    .catch((err) => {
      console.log(err);
    });
};

export const getDeploys = async (req: any, res: any) => {
  await Deploy.find()
    .sort({ timestamp: 'desc' })
    .then((deploys) => {
      res.status(200).json(deploys);
    })
    .catch((err) => {
      res.status(500);
    });
};
