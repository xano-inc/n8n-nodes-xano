import { INodeProperties } from "n8n-workflow";

export const workspaceProperties: INodeProperties[] = [
	{
		displayName: 'Workspace Name or ID',
		name: 'workspace',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWorkspaces',
		},
		required: true,
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: [
					'getTableContent',
					'createRow',
					'updateRow',
					'getSingleContent',
					'deleteSingleContent',
					'bulkCreateContent',
					'bulkUpdateContent',
					'searchRow',
				],
			},
		},
	}
]