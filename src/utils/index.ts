import {rlp, BN} from 'ethereumjs-util';
import Contract from "../models/contract/contract";
import {EthStorageCid} from "../types";

export const getContractsFromLogs = (contracts: Contract[], logs: string[]): Contract[] => {
    return contracts.filter((contract) => logs.map((log) => log.toLowerCase()).includes(contract.address.toLowerCase()));
}

export const increaseHexByOne = (value: string): string => {
    value = value.replace('0x','');
    const x = new BN(value, 'hex');
    const sum = x.addn(1);
    let key = sum.toString(16);
    if (value.length > key.length) {
        key = new Array(value.length - key.length + 1).join('0') + key;
    }

    return '0x' + key;
}

// Convert MultiHash Block data to buffer
export const mhDataToBuffer = (data: string): Buffer => {
    return Buffer.from(data.replace('\\x',''), 'hex');
}

export const decodeStorageCid = (storage: EthStorageCid): Buffer => {
    const buffer = mhDataToBuffer(storage.blockByMhKey.data);
    // array[0] = storage leaf key
    // array[1] = decoded value
    const decodedData = rlp.decode(buffer);
    const decodedValue = rlp.decode(decodedData[1]);

    return decodedValue as Buffer;
}

export const decodeHeaderData = (data: string) => { // eslint-disable-line
    const buffer = mhDataToBuffer(data);
    const decoded: any = rlp.decode(buffer); // eslint-disable-line

    return {
        txHash: decoded[4].toString('hex'),
        time: (new Date(Date.UTC(1970, 0, 1) + parseInt(decoded[11].toString('hex'), 16) * 1000)),
        number: decoded[8].toString('hex'),
        difficulty: decoded[7].toString('hex'),
        gasLimit: decoded[9].toString('hex'),
        gasUsed: decoded[10].toString('hex'),
        uncleHash: decoded[1].toString('hex'),
        parentHash: decoded[0].toString('hex'),
        receiptHash: decoded[5].toString('hex'),
        address: decoded[2].toString('hex'),
        miner: decoded[2].toString('hex'),
        root: decoded[3].toString('hex'),
        bloom: decoded[6].toString('hex'),
        extra: decoded[12].toString('hex'),
        mixDigest: decoded[13].toString('hex'),
        nonce: decoded[14].toString('hex'),
    }
}

export const decodeTransactionData = (data: string) => { // eslint-disable-line
    const buffer = Buffer.from(data.replace('\\x',''), 'hex');
    const decoded: any = rlp.decode(buffer); // eslint-disable-line

    return {
        nonce: decoded[0].toString('hex'),
        gasPrice: decoded[1].toString('hex'),
        gas: decoded[2].toString('hex'),
        value: decoded[3].toString('hex'),
        input: decoded[4].toString('hex'),
        v: decoded[5].toString('hex'),
        r: decoded[6].toString('hex'),
        s: decoded[7].toString('hex'),
        to: decoded[8].toString('hex'),
    }
}
