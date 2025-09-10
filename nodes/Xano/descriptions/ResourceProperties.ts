import { INodeProperties } from 'n8n-workflow';

export const resourceProperties: INodeProperties[] = [
	{
		displayName: 'Resource',
		name: 'resource',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Table',
				value: 'table',
			},
		],
		default: 'table',
		required: true,
	},
];
