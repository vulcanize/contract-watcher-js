import * as dotenv from 'dotenv';
dotenv.config();

import { EthWatcherServer } from './server';
import DataService from './services/dataService';
import HeaderCids from "./models/eth/headerCids";

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at:', p, 'reason:', reason);
	// TODO: send to log system
});


(async (): Promise<void> => {
	const dataService = new DataService();

	await EthWatcherServer({ // DI
		processState: (data) => {
			if (!data) {
				return;
			}
			dataService.processState(data.relatedNode)
		},
		processHeader: async (data) => {
			const header: HeaderCids = await dataService.processHeader(data);
			if (data?.uncleCidsByHeaderId?.nodes && data?.uncleCidsByHeaderId?.nodes.length > 0) {
				for (const uncle of data?.uncleCidsByHeaderId?.nodes) {
					await dataService.processUncle(uncle, header.id);
				}
			}
			if (data?.ethTransactionCidsByHeaderId?.nodes && data?.ethTransactionCidsByHeaderId?.nodes.length > 0) {
				const txs = data.ethTransactionCidsByHeaderId.nodes;
				for (const tx of txs) {
					const txCid = await dataService.processTransaction(tx, header.id);
					await dataService.processReceipt(tx.receiptCidByTxId, txCid);
				}
			}
		},
		processEvent: (data) => {
			if (!data) {
				return;
			}

			dataService.processEvent(null, data.relatedNode, data.decoded, data.event);
		},
	})
})();
