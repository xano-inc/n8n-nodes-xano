import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { fieldProperties } from './descriptions/FieldProperties';
import { operationProperties } from './descriptions/OperationProperties';
import { resourceProperties } from './descriptions/ResourceProperties';
import { workspaceProperties } from './descriptions/Workspace';
import { executeXanoOperations } from './execute/XanoExecute';
import { xanoLoadOptions } from './methods/XanoLoadOptions';

export class Xano implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Xano',
		name: 'xano',
		icon: 'file:xano.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Xano API to manage workspaces, tables, and content.',
		defaults: {
			name: 'Xano',
		},
		inputs: ['main' as NodeConnectionType],
		outputs: ['main' as NodeConnectionType],
		credentials: [
			{
				name: 'xanoApi',
				required: true,
			},
		],
		// Removed requestDefaults since we handle requests manually
		properties: [...workspaceProperties, ...resourceProperties, ...operationProperties, ...fieldProperties],
	};

	methods = xanoLoadOptions;

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return executeXanoOperations.call(this);
	}
}