import { connect, Cluster, Collection } from "couchbase";

let cluster: Cluster;
let documentCollection: Collection;
let aadharCollection: Collection;
let panCollection: Collection;
let creditCardCollection: Collection;
let chequeCollection: Collection;

export const connectToCouchbase = async () => {
  cluster = await connect(process.env.COUCHBASE_CONN_STR!, {
    username: process.env.COUCHBASE_USERNAME!,
    password: process.env.COUCHBASE_PASSWORD!,
  });

  const bucket = cluster.bucket("appian");

  documentCollection = bucket.scope("user").collection("document");
  aadharCollection = bucket.scope("user").collection("aadhar");
  panCollection = bucket.scope("user").collection("pan");
  creditCardCollection = bucket.scope("user").collection("creditcard");
  chequeCollection = bucket.scope("user").collection("cheque");

  console.log("Successfully connected to Couchbase");
};
export const getCluster = () => cluster;
export const getDocumentCollection = () => documentCollection;
export const getAadharCollection = () => aadharCollection;
export const getPanCollection = () => panCollection;
export const getCreditCardCollection = () => creditCardCollection;
export const getChequeCollection = () => chequeCollection;
