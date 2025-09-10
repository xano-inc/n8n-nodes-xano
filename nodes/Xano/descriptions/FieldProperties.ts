import { INodeProperties } from 'n8n-workflow';

export const fieldProperties: INodeProperties[] = [
	// Workspace selection
	// {
	// 	displayName: 'Workspace Name or ID',
	// 	name: 'workspace',
	// 	type: 'options',
	// 	typeOptions: {
	// 		loadOptionsMethod: 'getWorkspaces',
	// 	},
	// 	required: true,
	// 	default: '',
	// 	description:
	// 		'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	// 	displayOptions: {
	// 		show: {
	// 			resource: ['table'],
	// 			operation: [
	// 				'getTableContent',
	// 				'createRow',
	// 				'updateRow',
	// 				'getSingleContent',
	// 				'deleteSingleContent',
	// 				'bulkCreateContent',
	// 				'bulkUpdateContent',
	// 				'searchRow',
	// 			],
	// 		},
	// 	},
	// }, // Commented out as workspace selection is handled in the main node description separately

	// Table selection
	{
		displayName: 'Table Name or ID',
		name: 'table',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTables',
			loadOptionsDependsOn: ['workspace'],
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
	},

	// Fields section for createRow operation
	{
		displayName: 'Fields',
		name: 'fields',
		placeholder: 'Add Field',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['createRow', 'updateRow'],
			},
		},
		default: {},
		options: [
			{
				name: 'field',
				displayName: 'Field',
				values: [
					{
						displayName: 'Field Name or ID',
						name: 'fieldName',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getTableFieldsForCreate',
							loadOptionsDependsOn: ['workspace', 'table'],
						},
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
						required: true,
					},
					{
						displayName: 'Field Value',
						name: 'fieldValue',
						type: 'string',
						default: '',
						description: 'The value to set for this field',
						// required: false,
					},
				],
			},
		],
	},
	{
		displayName: 'Page',
		name: 'page',
		type: 'number',
		default: 1,
		description: 'Page number to fetch',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['getTableContent', 'searchRow'],
			},
		},
	},
	{
		displayName: 'Items per Page',
		name: 'per_page',
		type: 'number',
		default: 10,
		description: 'Number of records per page',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['getTableContent', 'searchRow'],
			},
		},
	},

	{
		displayName: 'Sort By Name or ID',
		name: 'sortby',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTableFields',
			loadOptionsDependsOn: ['workspace', 'table'], // Optional but helpful for accuracy
		},
		default: '',
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['searchRow'],
			},
		},
		required: true,
	},

	{
		displayName: 'Sort Order',
		name: 'sortOrder',
		type: 'options',
		options: [
			{ name: 'Ascending', value: 'asc' },
			{ name: 'Descending', value: 'desc' },
		],
		default: 'desc',
		description: 'Sort direction',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['searchRow'],
			},
		}
	},

	{
		displayName: 'Items (JSON Array)',
		name: 'searchItemsJson',
		type: 'json',
		default: `[]`,
		description:
			'Each object represents a row to search, Ensure the field names match your table schema',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['searchRow'],
			},
		},
	},

	// {
	// 	displayName: 'Additional Query Parameters',
	// 	name: 'queryParams',
	// 	type: 'fixedCollection',
	// 	typeOptions: {
	// 		multipleValues: true,
	// 	},
	// 	placeholder: 'Add Parameter',
	// 	default: {},
	// 	displayOptions: {
	// 		show: {
	// 			resource: ['table'],
	// 			operation: ['getTableContent'],
	// 		},
	// 	},
	// 	options: [
	// 		{
	// 			name: 'params',
	// 			displayName: 'Params',
	// 			values: [
	// 				{
	// 					displayName: 'Key',
	// 					name: 'key',
	// 					type: 'string',
	// 					default: '',
	// 				},
	// 				{
	// 					displayName: 'Value',
	// 					name: 'value',
	// 					type: 'string',
	// 					default: '',
	// 				},
	// 			],
	// 		},
	// 	],
	// },

	// Content by ID
	{
		displayName: 'Row ID',
		name: 'Content ID',
		type: 'options',
		options: [
			{
				name: 'ID',
				value: 'id',
				description: 'Search by row ID',
			},
		],
		default: 'id',
		description: 'Field to search by (fixed as ID)',
		required: true,
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['getSingleContent'],
			},
		},
		noDataExpression: true, // Prevents expression UI popup
	},
	{
		displayName: 'Field Value',
		name: 'singleContentId',
		type: 'string',
		default: '',
		description: 'Value for the selected field (e.g., 123)',
		required: true,
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['getSingleContent'],
			},
		},
	},

	// Delete Content by ID
	{
		displayName: 'Row ID',
		name: 'Content ID',
		type: 'options',
		options: [
			{
				name: 'ID',
				value: 'id',
				description: 'Search by row ID',
			},
		],
		default: 'id',
		description: 'Field to search by (fixed as ID)',
		required: true,
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['deleteSingleContent'],
			},
		},
		noDataExpression: true, // Prevents expression UI popup
	},
	{
		displayName: 'Field Value',
		name: 'ContentId',
		type: 'string',
		default: '',
		description: 'Value for the selected field (e.g., 123)',
		required: true,
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['deleteSingleContent'],
			},
		},
	},

	// Select field-builder or Direct JSON input for bulk create
	{
		displayName: 'Configuration Method',
		name: 'configMethod',
		type: 'options',
		options: [
			{
				name: 'Field Builder',
				value: 'fieldBuilder',
				description: 'Use UI to build items with field-value pairs',
			},
			{
				name: 'JSON Input',
				value: 'jsonInput',
				description: 'Paste JSON array directly',
			},
		],
		default: 'fieldBuilder',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['bulkCreateContent'],
			},
		},
	},

	// Alternative: Even simpler flat structure
	{
		displayName: 'Items to Create',
		name: 'items',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add New Item',
		},
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['bulkCreateContent'],
				configMethod: ['fieldBuilder'],
			},
		},
		options: [
			{
				name: 'item',
				displayName: 'Item',
				values: [
					// Direct field-value pairs without nesting
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'fixedCollection',
						default: {},
						typeOptions: {
							multipleValues: true,
							multipleValueButtonText: 'Add Field',
						},
						options: [
							{
								name: 'field',
								displayName: 'Field',
								values: [
									{
										displayName: 'Field Name or ID',
										name: 'name',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getTableFieldsForCreate', // Auto-populated from schema
											loadOptionsDependsOn: ['workspace', 'table'],
										},
										default: '',
										required: true,
										description:
											'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
									},
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										required: true,
										description: 'Enter the value for this field',
									},
								],
							},
						],
					},
				],
			},
		],
	},

	// JSON Input fallback
	{
		displayName: 'Items (JSON Array)',
		name: 'itemsJson',
		type: 'json',
		default: `[]`,
		description:
			'Each object represents a row to be created, Ensure the field names match your table schema',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['bulkCreateContent'],
				configMethod: ['jsonInput'],
			},
		},
	},

	{
		displayName: 'Allow ID Field',
		name: 'allowIdField',
		type: 'boolean',
		default: false,
		description: 'Whether to allow ID field in the input',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['bulkCreateContent'],
				configMethod: ['fieldBuilder', 'jsonInput'],
			},
		},
	},

	// Select field-builder or Direct JSON input for bulk update
	{
		displayName: 'Configuration Method',
		name: 'configUpdateMethod',
		type: 'options',
		options: [
			{
				name: 'Field Builder',
				value: 'fieldBuilder',
				description: 'Use UI to build items with field-value pairs',
			},
			{
				name: 'JSON Input',
				value: 'jsonInput',
				description: 'Paste JSON array directly',
			},
		],
		default: 'fieldBuilder',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['bulkUpdateContent'],
			},
		},
	},

	{
		displayName: 'Items to Bulk Update',
		name: 'updateItems',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add New Item to Bulk Update',
		},
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['bulkUpdateContent'],
				configUpdateMethod: ['fieldBuilder'],
			},
		},
		options: [
			{
				name: 'item',
				displayName: 'Item to Bulk Update',
				values: [
					{
						displayName: 'Fields to Update',
						name: 'fields',
						type: 'fixedCollection',
						default: {},
						typeOptions: {
							multipleValues: true,
							multipleValueButtonText: 'Add Field to Update',
						},
						options: [
							{
								name: 'field',
								displayName: 'Field to Update',
								values: [
									{
										displayName: 'Field Name or ID',
										name: 'name',
										type: 'options',
										typeOptions: {
											loadOptionsMethod: 'getTableFields', // Auto-populated from schema
											loadOptionsDependsOn: ['workspace', 'table'],
										},
										default: '',
										required: true,
										description:
											'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
									},
									{
										displayName: 'New Value',
										name: 'value',
										type: 'string',
										default: '',
										required: true,
										description: 'Enter the new value for this field to update',
									},
								],
							},
						],
					},
				],
			},
		],
	},

	// JSON Input fallback
	{
		displayName: 'Items (JSON Array)',
		name: 'updateItemsJson',
		type: 'json',
		default: `[]`,
		description:
			'Each object represents a row to be created, Ensure the field names match your table schema',
		displayOptions: {
			show: {
				resource: ['table'],
				operation: ['bulkUpdateContent'],
				configUpdateMethod: ['jsonInput'],
			},
		},
	},
];
