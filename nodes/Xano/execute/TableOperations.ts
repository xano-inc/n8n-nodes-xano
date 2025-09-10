import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { XanoApiClient } from '../utils/XanoApiClient';

type BulkUpdatePayload = {
	items: Array<{
		row_id: string | number;
		updates: Record<string, any>;
	}>;
};

export class TableOperations {
	constructor(private apiClient: XanoApiClient) {}

	private inputRequiredFields = 0;
	async executeOperation(
		operation: string,
		workspaceId: string,
		tableId: string,
		context: IExecuteFunctions,
		itemIndex: number,
		queryParams: Record<string, string | number> = {},
	): Promise<any> {
		switch (operation) {
			case 'getTableContent':
				return this.getTableContent(workspaceId, tableId, queryParams);

			case 'createRow':
				const fields = context.getNodeParameter('fields', itemIndex) as {
					field: Array<{ fieldName: string; fieldValue: string }>;
				};
				const schema = await this.apiClient.getTableFields(workspaceId, tableId);

				if (!schema || !Array.isArray(schema)) {
					throw new NodeOperationError(context.getNode(), 'Invalid table schema');
				}

				return this.createRow(workspaceId, tableId, fields, schema, context);

			case 'updateRow':
				const tableFields = context.getNodeParameter('fields', itemIndex) as {
					field: Array<{ fieldName: string; fieldValue: string }>;
				};
				const tableSchema = await this.apiClient.getTableFields(workspaceId, tableId);

				return this.updateRow(workspaceId, tableId, tableFields, tableSchema, context);

			case 'getSingleContent':
				const contentId = context.getNodeParameter('singleContentId', itemIndex) as string;
				if (!contentId) {
					throw new NodeOperationError(context.getNode(), 'Single content ID is required');
				}

				return this.getSingleContent(workspaceId, tableId, contentId);

			case 'deleteSingleContent':
				const deleteContetnById = context.getNodeParameter('ContentId', itemIndex) as string;
				if (!deleteContetnById) {
					throw new NodeOperationError(context.getNode(), 'Content ID is required');
				}

				return this.deleteSingleContent(workspaceId, tableId, deleteContetnById);

			case 'bulkCreateContent': {
				const configMethod = context.getNodeParameter('configMethod', itemIndex) as string;

				if (!configMethod) {
					throw new NodeOperationError(
						context.getNode(),
						'Invalid configuration method for bulk create',
					);
				}

				if (configMethod === 'fieldBuilder') {
					const bulkFields = context.getNodeParameter('items', itemIndex) as {
						item: Array<{
							fields: {
								field: Array<{
									name: string;
									value: string;
								}>;
							};
						}>;
					};

					// 🛑 Validate fields
					if (!bulkFields || !bulkFields.item || !Array.isArray(bulkFields.item)) {
						throw new NodeOperationError(context.getNode(), 'Invalid bulk update fields');
					}

					// 🛑 Validate that each item has an ID
					if (
						bulkFields.item.some(
							(entry) =>
								!entry.fields ||
								!Array.isArray(entry.fields.field) ||
								!entry.fields.field.some((f) => f.name === 'id'),
						)
					) {
						throw new NodeOperationError(
							context.getNode(),
							'Each item must have an ID field for bulk update',
						);
					}

					const allowIdField = context.getNodeParameter(
						'allowIdField',
						itemIndex,
						false,
					) as boolean;

					// ✅ Build final `items` array for API
					const items = bulkFields.item.map((entry) => {
						const obj: Record<string, any> = {};
						if (entry.fields && Array.isArray(entry.fields.field)) {
							for (const field of entry.fields.field) {
								obj[field.name] = field.value;
							}
						}
						return obj;
					});

					// 🔁 Perform API call
					return this.bulkCreateContent(workspaceId, tableId, items, allowIdField);
				}

				const itemsJson = context.getNodeParameter('itemsJson', itemIndex) as string;
				const allowIdField = context.getNodeParameter('allowIdField', itemIndex, false) as boolean;

				// 🛑 Validate JSON input
				if (!itemsJson || itemsJson.trim() === '') {
					throw new NodeOperationError(context.getNode(), 'Items JSON is required for bulk create');
				}

				if (itemsJson === '[]') {
					throw new NodeOperationError(context.getNode(), 'Items JSON array cannot be empty');
				}

				if (!itemsJson.trim().startsWith('{') && !itemsJson.trim().startsWith('[')) {
					throw new NodeOperationError(
						context.getNode(),
						'Invalid JSON: must start and end with  "[" and "]" ',
					);
				}

				const jsonFormat = {
					items: JSON.parse(itemsJson),
					allow_id_field: allowIdField,
				};

				return this.bulkCreateContentWithJson(workspaceId, tableId, jsonFormat);
			}

			case 'bulkUpdateContent': {
				const configMethod = context.getNodeParameter('configUpdateMethod', itemIndex) as string;

				if (!configMethod) {
					throw new NodeOperationError(
						context.getNode(),
						'Invalid configuration method for bulk update',
					);
				}

				if (configMethod === 'fieldBuilder') {
					const bulkFields = context.getNodeParameter('updateItems', itemIndex) as {
						item: Array<{
							fields: {
								field: Array<{
									name: string;
									value: string;
								}>;
							};
						}>;
					};

					// 🛑 Validate fields
					if (!bulkFields || !bulkFields.item || !Array.isArray(bulkFields.item)) {
						throw new NodeOperationError(context.getNode(), 'Invalid bulk update fields');
					}

					// 🛑 Validate that each item has an ID
					if (
						bulkFields.item.some(
							(entry) =>
								!entry.fields ||
								!Array.isArray(entry.fields.field) ||
								!entry.fields.field.some((f) => f.name === 'id'),
						)
					) {
						throw new NodeOperationError(
							context.getNode(),
							'Each item must have an ID field for bulk update',
						);
					}

					// ✅ Build final `items` array for API
					const items = bulkFields.item.map((entry) => {
						const obj: Record<string, any> = {};
						if (entry.fields && Array.isArray(entry.fields.field)) {
							for (const field of entry.fields.field) {
								obj[field.name] = field.value;
							}
						}
						return obj;
					});

					const transformed = items.map(({ id, ...updates }) => ({
						row_id: id,
						updates,
					}));

					console.log('Transformed Items for Bulk Update:', transformed);

					// 🔁 Perform API call
					return this.bulkUpdateContent(workspaceId, tableId, transformed);
				}

				const rawItemsJson = context.getNodeParameter('updateItemsJson', itemIndex) as string;

				// 🛑 Validate JSON input
				if (!rawItemsJson || rawItemsJson.trim() === '') {
					throw new NodeOperationError(context.getNode(), 'Items JSON is required for bulk create');
				}

				if (rawItemsJson === '[]') {
					throw new NodeOperationError(context.getNode(), 'Items JSON array cannot be empty');
				}

				if (!rawItemsJson.trim().startsWith('{') && !rawItemsJson.trim().startsWith('[')) {
					throw new NodeOperationError(
						context.getNode(),
						'Invalid JSON: must start and end with  "[" and "]" ',
					);
				}

				let parsedItems: Array<Record<string, any>>;

				try {
					parsedItems = JSON.parse(rawItemsJson);
				} catch (error) {
					throw new NodeOperationError(context.getNode(), 'Invalid JSON format for update items');
				}

				function transformRowsForBulkUpdate(inputRows: Array<Record<string, any>>): {
					items: Array<{ row_id: number | string; updates: Record<string, any> }>;
				} {
					return {
						items: inputRows.map((row) => {
							const { row_id, id, ...rest } = row;
							const finalRowId = row_id || id;

							if (!finalRowId) {
								throw new Error('Each item must have either "row_id" or "id"');
							}

							return {
								row_id: finalRowId,
								updates: rest,
							};
						}),
					};
				}

				const jsonFormat = transformRowsForBulkUpdate(parsedItems);

				console.log('JSON Format for Bulk Update:', JSON.stringify(jsonFormat, null, 2));
				return this.bulkUpdateContentWithJson(workspaceId, tableId, jsonFormat);
			}

			case 'searchRow': {
				const sortBy = context.getNodeParameter('sortby', itemIndex) as string;
				const sortOrder = context.getNodeParameter('sortOrder', itemIndex) as string;

				const page = context.getNodeParameter('page', itemIndex, 1) as number;
				const perPage = context.getNodeParameter('per_page', itemIndex, 10) as number;

				const searchItemsRaw = context.getNodeParameter('searchItemsJson', itemIndex, '') as string;

				let searchQuery: Array<Record<string, string>> = [];

				if (searchItemsRaw) {
					try {
						const parsed = JSON.parse(searchItemsRaw);
						if (Array.isArray(parsed)) {
							searchQuery = parsed;
						} else {
							throw new Error('Search input must be a JSON array.');
						}
					} catch (error) {
						throw new NodeOperationError(context.getNode(), `Invalid JSON format in search input: ${(error as Error).message}`);
					}
				}

				return this.searchTableRow(workspaceId, tableId, page, perPage, sortBy, sortOrder, searchQuery);
			}

			default:
				throw new NodeOperationError(context.getNode(), `Unknown operation: ${operation}`);
		}
	}

	private async getTableContent(
		workspaceId: string,
		tableId: string,
		queryParams: Record<string, string | number> = {},
	): Promise<any> {
		return this.apiClient.getTableContent(workspaceId, tableId, queryParams);
	}

	private async searchTableRow(
		workspaceId: string,
		tableId: string,
		page: number = 1,
		perPage: number = 10,
		sortBy?: string,
		sortOrder?: string,
		searchQuery?: Array<Record<string, string>>,
	): Promise<any> {
		return this.apiClient.searchTableRow(workspaceId, tableId, page || 1, perPage || 10, sortBy, sortOrder, searchQuery || []);
	}

	private async getSingleContent(
		workspaceId: string,
		tableId: string,
		contentId: string,
	): Promise<any> {
		return this.apiClient.getSingleContent(workspaceId, tableId, contentId);
	}

	private async bulkCreateContent(
		workspaceId: string,
		tableId: string,
		items: Array<Record<string, any>>,
		allowIdField: boolean,
	): Promise<any> {
		return this.apiClient.bulkCreateContent(workspaceId, tableId, items, allowIdField);
	}

	private async bulkUpdateContent(
		workspaceId: string,
		tableId: string,
		items: { row_id: any; updates: { [x: string]: any } }[],
	): Promise<any> {
		return this.apiClient.bulkUpdateContent(workspaceId, tableId, items);
	}

	private async bulkCreateContentWithJson(
		workspaceId: string,
		tableId: string,
		items: { items: any; allow_id_field: boolean },
	): Promise<any> {
		return this.apiClient.bulkCreateContentWithJson(workspaceId, tableId, items);
	}

	private async bulkUpdateContentWithJson(
		workspaceId: string,
		tableId: string,
		items: BulkUpdatePayload,
	): Promise<any> {
		return this.apiClient.bulkUpdateContentWithJson(workspaceId, tableId, items);
	}

	private async deleteSingleContent(
		workspaceId: string,
		tableId: string,
		contentId: string,
	): Promise<any> {
		return this.apiClient.deleteSingleContent(workspaceId, tableId, contentId);
	}

	private async createRow(
		workspaceId: string,
		tableId: string,
		fields: { field: Array<{ fieldName: string; fieldValue: string }> },
		schema: Array<{ name: string; required?: boolean; access?: string }>,
		context: IExecuteFunctions,
	): Promise<any> {
		const rowData: { [key: string]: any } = {};
		console.log('Fields from createRow:--------->', rowData);

		// Only include public and non-system fields that are required
		const requiredFields = schema
			.filter(
				(field) =>
					field.required === true &&
					field.access === 'public' &&
					!['id', 'created_at', 'updated_at'].includes(field.name.toLowerCase()),
			)
			.map((field) => {
				// Remove extra decorations like (text) or *
				const match = field.name.match(/^([^\s(]+)/);
				return match ? match[1] : field.name;
			});

		const validFieldNames = schema.map((field) => {
			// Remove extra decorations like (text) or *
			const match = field.name.match(/^([^\s(]+)/);
			return match ? match[1] : field.name;
		});

		if(fields.field === undefined || fields.field.length === 0) {
			console.log('No fields provided for create row operation');
			throw new NodeOperationError(context.getNode(), 'No fields provided for create row operation');
		}

		// Build a map of selected field names and values
		const inputFieldMap: Record<string, string> = {};
		for (const field of fields.field) {
			if (field.fieldName) {
				inputFieldMap[field.fieldName] = field.fieldValue;
			}
		}

		console.log('Input Field Map:--------->', inputFieldMap);

		Object.keys(inputFieldMap).forEach((key) => {
			if (key !== 'id' && requiredFields.includes(key)) {
				this.inputRequiredFields++;
			}
		});

		const requiredFieldsExcludingId = requiredFields.filter((field) => field !== 'id');

		if (this.inputRequiredFields !== requiredFieldsExcludingId.length) {
			throw new NodeOperationError(
				context.getNode(),
				`These field(s) are required: ${requiredFieldsExcludingId.join(', ')}`,
			);
		}

		// 🛑 Check for any invalid fields (not in schema)
		const invalidFields = Object.keys(inputFieldMap).filter((f) => !validFieldNames.includes(f));
		if (invalidFields.length > 0) {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid field(s) detected for this table: ${invalidFields.join(', ')}`,
			);
		}

		const missingFields: string[] = [];

		if (Array.isArray(fields.field)) {
			for (const field of fields.field) {
				const { fieldName, fieldValue } = field;
				// Check if required field is present but left empty
				if (
					requiredFields.includes(fieldName) &&
					(fieldValue === undefined || fieldValue.trim() === '')
				) {
					missingFields.push(fieldName);
				} else if (fieldName && fieldValue !== undefined) {
					rowData[fieldName] = this.parseFieldValue(fieldValue);
				}
			}
		}

		console.log('Missing Fields:--------->', missingFields);
		if (missingFields.length > 0) {
			throw new NodeOperationError(
				context.getNode(),
				`Missing required value(s) for field(s): ${missingFields.join(', ')}`,
			);
		}

		return this.apiClient.createRow(workspaceId, tableId, rowData);
	}

	private async updateRow(
		workspaceId: string,
		tableId: string,
		fields: { field: Array<{ fieldName: string; fieldValue: string }> },
		schema: Array<{ name: string; required?: boolean; access?: string }>,
		context: IExecuteFunctions,
	): Promise<any> {
		const rowData: { [key: string]: any } = {};

		// Only include public and non-system fields that are required
		const requiredFields = schema
			.filter(
				(field) =>
					field.required === true &&
					field.access === 'public' &&
					!['id', 'created_at', 'updated_at'].includes(field.name.toLowerCase()),
			)
			.map((field) => {
				// Remove extra decorations like (text) or *
				const match = field.name.match(/^([^\s(]+)/);
				return match ? match[1] : field.name;
			});

		const validFieldNames = schema.map((field) => {
			// Remove extra decorations like (text) or *
			const match = field.name.match(/^([^\s(]+)/);
			return match ? match[1] : field.name;
		});

		if(fields.field === undefined || fields.field.length === 0) {
			console.log('No fields provided for update');
			throw new NodeOperationError(context.getNode(), 'No fields provided for update');
		}

		// Build a map of selected field names and values
		const inputFieldMap: Record<string, string> = {};
		for (const field of fields.field) {
			if (field.fieldName) {
				inputFieldMap[field.fieldName] = field.fieldValue;
			}
		}

		// 🛑 Check for any invalid fields (not in schema)
		const invalidFields = Object.keys(inputFieldMap).filter((f) => !validFieldNames.includes(f));
		if (invalidFields.length > 0) {
			throw new NodeOperationError(
				context.getNode(),
				`Invalid field(s) detected for this table: ${invalidFields.join(', ')}`,
			);
		}

		const missingFields: string[] = [];

		if (Array.isArray(fields.field)) {
			for (const field of fields.field) {
				const { fieldName, fieldValue } = field;
				console.log('Field from missing param logic:--------->', field);
				// Check if required field is present but left empty
				if (
					requiredFields.includes(fieldName) &&
					(fieldValue === undefined || fieldValue.trim() === '')
				) {
					missingFields.push(fieldName);
				} else if (fieldName && fieldValue !== undefined) {
					rowData[fieldName] = this.parseFieldValue(fieldValue);
				}
			}
		}

		console.log('Missing Fields:--------->', missingFields);
		if (missingFields.length > 0) {
			throw new NodeOperationError(
				context.getNode(),
				`Missing required value(s) for field(s): ${missingFields.join(', ')}`,
			);
		}

		return this.apiClient.updateRow(workspaceId, tableId, rowData);
	}

	private parseFieldValue(value: string): any {
		try {
			if (
				typeof value === 'string' &&
				(value.startsWith('{') ||
					value.startsWith('[') ||
					value === 'true' ||
					value === 'false' ||
					value === 'null' ||
					!isNaN(Number(value)))
			) {
				return JSON.parse(value);
			}
			return value;
		} catch {
			return value;
		}
	}
}
