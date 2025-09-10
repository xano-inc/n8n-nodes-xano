import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { handleXanoErrorDetailed } from '../utils/ErrorHandler';
import { XanoApiClient } from '../utils/XanoApiClient';
import { TableOperations } from './TableOperations';

export async function executeXanoOperations(
	this: IExecuteFunctions,
): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];

	for (let i = 0; i < items.length; i++) {
		const resource = this.getNodeParameter('resource', i) as string;
		const operation = this.getNodeParameter('operation', i) as string;
		const workspaceId = this.getNodeParameter('workspace', i) as string;
		const tableId = this.getNodeParameter('table', i) as string;
		const page = this.getNodeParameter('page', i, 1) as number;
		const perPage = this.getNodeParameter('per_page', i, 10) as number;
		const queryParams = this.getNodeParameter('queryParams', i, []) as {
			key: string;
			value: string;
		}[];

		const qs: Record<string, string | number> = {
			page,
			per_page: perPage,
		};

		if (queryParams && Array.isArray(queryParams)) {
			// Append dynamic user-defined query params
			for (const param of queryParams) {
				qs[param.key] = param.value;
			}
		}

		// Validate required parameters
		if (!workspaceId) {
			throw new NodeOperationError(this.getNode(), 'Workspace ID is required');
		}
		if (!tableId) {
			throw new NodeOperationError(this.getNode(), 'Table ID is required');
		}

		try {
			const apiClient = new XanoApiClient(this);

			if (resource === 'table') {
				const tableOps = new TableOperations(apiClient);
				const result = await tableOps.executeOperation(
					operation,
					workspaceId,
					tableId,
					this,
					i,
					qs,
				);

				if (Array.isArray(result)) {
					for (const record of result) {
						returnData.push({
							json: record,
							pairedItem: { item: i },
						});
					}
				} else {
					returnData.push({
						json: result,
						pairedItem: { item: i },
					});
				}
			}
		} catch (error: any) {
			throw handleXanoErrorDetailed(this.getNode(), error, `Operation failed: ${operation}`);
		}
	}

	return [returnData];
}
