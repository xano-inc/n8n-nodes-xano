import { INodeProperties } from 'n8n-workflow';

export const operationProperties: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['table'],
			},
		},
		options: [
			{
				name: 'Create Row',
				value: 'createRow',
				description: 'Add a new row to a table',
				action: 'Create a row',
			},
			{
				name: 'Create Row Bulk',
				value: 'bulkCreateContent',
				description: 'Bulk create rows in a table',
				action: 'Create bulk rows',
			},
			{
				name: 'Delete a Row',
				value: 'deleteSingleContent',
				description: 'Delete a single row from a table',
				action: 'Delete a row',
			},
			{
				name: 'Get a Row',
				value: 'getSingleContent',
				description: 'Get a single row from a table',
				action: 'Get a row',
			},
			{
				name: 'Get Many Rows',
				value: 'getTableContent',
				description: 'Get all rows from a table',
				action: 'Get many rows',
			},
			{
				name: 'Search Row',
				value: 'searchRow',
				description: 'Search for a row in a table',
				action: 'Search row',
			},
			{
				name: 'Update Row by ID',
				value: 'updateRow',
				description: 'Update a new row to a table',
				action: 'Update row by ID',
			},
			{
				name: 'Update Rows in Bulk by ID',
				value: 'bulkUpdateContent',
				description: 'Bulk Update rows to a table',
				action: 'Update rows in bulk by ID',
			}
		],
		default: 'getTableContent',
		required: true,
	},
];
