import { EPNSSettings, InfuraSettings, NetWorkSettings } from '@epnsproject/backend-sdk-staging';
import dotenv from 'dotenv';
import loadShowrunnersWallets from './channelsConfig';
import staticConfig from './staticConfig.json';

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

let config = {
  /**
   * Load Wallets of Showrunners
   */
  showrunnerWallets: loadShowrunnersWallets(),
  masterWallet: process.env.MASTER_WALLET_PRIVATE_KEY,
  walletMonitoring: process.env.WALLET_MONITORING,
  fileSuffix: process.env.NODE_ENV === 'production' ? 'js' : 'ts', // use the right file suffix in a development or production environment

  // Static Config BEGIN

  /**
   * Your favorite port
   */
  environment: staticConfig.NODE_ENV,

  /**
   * Your favorite port
   */
  port: parseInt(staticConfig.PORT || '3000', 10),

  /**
   * Your favorite port
   */
  runningOnMachine: staticConfig.RUNNING_ON_MACHINE,

  /**
   * Used by winston logger
   */
  logs: {
    level: staticConfig.LOG_LEVEL || 'silly',
  },

  /**
   * Trusted URLs, used as middleware for some and for future
   */
  trusterURLs: JSON.parse(JSON.stringify(staticConfig.TRUSTED_URLS)),

  /**
   * The database config
   */
  dbhost: staticConfig.DB_HOST,
  dbname: staticConfig.DB_NAME,
  dbuser: staticConfig.DB_USER,
  dbpass: staticConfig.DB_PASS,
  mongodb: staticConfig.MONGO_URI,
  redisURL: staticConfig.REDIS_URL,

  /**
   * File system config
   */
  fsServerURL: staticConfig.NODE_ENV == 'development' ? staticConfig.FS_SERVER_DEV : staticConfig.FS_SERVER_PROD,
  staticServePath: staticConfig.SERVE_STATIC_FILES,
  staticCachePath: __dirname + '/../../' + staticConfig.SERVE_STATIC_FILES + '/' + staticConfig.SERVE_CACHE_FILES + '/',
  staticAppPath: __dirname + '/../../',

  /**
   * Server related config
   */
  maxDefaultAttempts: staticConfig.DEFAULT_MAX_ATTEMPTS,

  /**
   * IPFS related
   */
  ipfsMaxAttempts: staticConfig.IPFS_MAX_ATTEMPTS,
  ipfsGateway: staticConfig.IPFS_GATEWAY,
  ipfsLocal: staticConfig.IPFS_LOCAL_ENDPOINT,
  ipfsInfura: staticConfig.IPFS_INFURA_ENDPOINT,

  /**
   * ETH threshold
   */
  ethThreshold: staticConfig.SHOWRUNNER_WALLET_ETH_THRESHOLD,
  ethMainThreshold: staticConfig.MASTER_WALLET_ETH_THRESHOLD,
  etherTransferAmount: staticConfig.ETHER_TRANSFER_AMOUNT,

  // Static Config END

  /**
   * Web3 Related
   */
  mumbaiApi: process.env.MUMBAI_PROVIDER,
  etherscanAPI: process.env.ETHERSCAN_API,

  infuraAPI: {
    projectID: process.env.INFURA_PROJECT_ID,
    projectSecret: process.env.INFURA_PROJECT_SECRET,
  },

  alchemyAPI: process.env.ALCHEMY_API,

  web3MainnetProvider: process.env.MAINNET_WEB3_PROVIDER,
  web3MainnetNetwork: staticConfig.MAINNET_WEB3_NETWORK,
  web3MainnetSocket: process.env.MAINNET_WEB3_SOCKET,

  web3RopstenProvider: process.env.ROPSTEN_WEB3_PROVIDER,
  web3RopstenNetwork: staticConfig.ROPSTEN_WEB3_NETWORK,
  web3RopstenSocket: process.env.ROPSTEN_WEB3_SOCKET,

  web3KovanProvider: process.env.KOVAN_WEB3_PROVIDER,
  web3KovanNetwork: staticConfig.KOVAN_WEB3_NETWORK,
  web3KovanSocket: process.env.KOVAN_WEB3_SOCKET,

  web3PolygonMainnetProvider: process.env.POLYGON_MAINNET_WEB3_PROVIDER,
  web3PolygonMainnetRPC: process.env.POLYGON_MAINNET_RPC,

  web3PolygonMumbaiProvider: process.env.POLYGON_MUMBAI_WEB3_PROVIDER,
  web3PolygonMumbaiRPC: process.env.POLYGON_MUMBAI_RPC,

  web3GnosisRPC: staticConfig.GNOSIS_MAINNET_RPC,

  /**
   * EPNS Related
   */
  deployedContract: process.env.EPNS_DEPLOYED_CONTRACT,
  deployedKovanCoreContract: process.env.EPNS_CORE_KOVAN_DEPLOYED_CONTRACT,
  deployedContractABI: require('./epns_contract.json'),
  deployedPolygonCommunicatorContract: process.env.EPNS_POLYGON_DEPLOYED_COMMUNICATOR_CONTRACT,
  deployedRopstenCommunicatorContract: process.env.EPNS_ROPSTEN_DEPLOYED_COMMUNICATOR_CONTRACT,
  deployedKovanCommunicatorContract: process.env.EPNS_KOVAN_DEPLOYED_COMMUNICATOR_CONTRACT,
  deployedContractCommunicatorABI: require('./epns_contract_communicator.json'),
  /**
   * API configs
   */
  api: {
    prefix: '/apis',
  },

  /**
   * Showrunners config, always at last since this is a seperate module
   */
  cmcAPIKey: process.env.CMC_API_KEY,
  cmcEndpoint: process.env.CMC_ENDPOINT,

  // gasAPIKey: process.env.GAS_API_KEY,
  // gasEndpoint: process.env.GAS_ENDPOINT,

  // cmcSandboxAPIKey: process.env.CMS_SANDBOX_API_KEY,
  // cmcSandboxEndpoint: process.env.CMC_SANDBOX_ENDPOINT,

  /**
   * mail config
   */
  supportMailAddress: process.env.SUPPORT_MAIL_ADDRESS,
  supportMailName: process.env.SUPPORT_MAIL_NAME,
  sourceMailAddress: process.env.SOURCE_MAIL_ADDRESS,
  sourceMailName: process.env.SOURCE_MAIL_NAME,

  /**
   * AWS Config
   */
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
};

// Settings Confis

const infuraSettings: InfuraSettings = {
  projectID: config.infuraAPI.projectID,
  projectSecret: config.infuraAPI.projectSecret,
};

const networkSettings: NetWorkSettings = {
  alchemy: config.alchemyAPI,
  infura: infuraSettings,
  etherscan: config.etherscanAPI,
};

const epnsSettingsRopsten: EPNSSettings = {
  network: config.web3RopstenNetwork,
  contractAddress: config.deployedContract,
  contractABI: config.deployedContractABI,
};

const epnsSettingsKovan: EPNSSettings = {
  network: config.web3KovanNetwork,
  contractAddress: config.deployedKovanCoreContract,
  contractABI: config.deployedContractABI,
};
export interface SDKSettings {
  networkSettings: NetWorkSettings;
  epnsCoreSettings: EPNSSettings;
  epnsCommunicatorSettings: EPNSSettings;
}

export interface ISettings {
  epnsRopstenCommunicatorSettings: {
    network: string;
    contractAddress: string;
    contractABI: any;
  };
  epnsKovanCommunicatorSettings: {
    network: string;
    contractAddress: string;
    contractABI: any;
  };
  infuraSettings: InfuraSettings;
  networkSettings: NetWorkSettings;
  epnsSettingsRopsten: EPNSSettings;
  epnsSettingsKovan: EPNSSettings;
}

export const settings: ISettings = {
  epnsRopstenCommunicatorSettings: {
    network: config.web3RopstenNetwork,
    contractAddress: config.deployedRopstenCommunicatorContract,
    contractABI: config.deployedContractCommunicatorABI,
  },
  epnsKovanCommunicatorSettings: {
    network: config.web3KovanNetwork,
    contractAddress: config.deployedKovanCommunicatorContract,
    contractABI: config.deployedContractCommunicatorABI,
  },
  infuraSettings: infuraSettings,
  networkSettings: networkSettings,
  epnsSettingsRopsten: epnsSettingsRopsten,
  epnsSettingsKovan: epnsSettingsKovan,
};

export const defaultSdkSettings: SDKSettings = {
  epnsCoreSettings: settings.epnsSettingsKovan,
  epnsCommunicatorSettings: settings.epnsKovanCommunicatorSettings,
  networkSettings: networkSettings,
};

export default config;
