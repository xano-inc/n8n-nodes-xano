import {
	IExecuteFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	NodeOperationError,
} from 'n8n-workflow';

// import { baseUrl } from '../../../config/config';

type XanoContext = ILoadOptionsFunctions | IExecuteFunctions;

export class XanoApiClient {
	private accessToken!: string;
	private helpers: any;
	private context: XanoContext;
	private baseUrl!: string;

	// private cachedKey: string | null = null;
	// private cachedFields: any[] = [];

	constructor(context: XanoContext) {
		this.context = context;
		this.helpers = context.helpers;
	}

	async init(): Promise<void> {
		const credentials = await this.context.getCredentials('xanoApi');
		this.accessToken = credentials.accessToken as string;
		this.baseUrl = `${(credentials.baseUrl as string)?.replace(/\/+$/, '')}/api:meta`
	}

	async validateAuth(): Promise<void> {
		await this.init();

		const authOptions: IHttpRequestOptions = {
			method: 'GET',
			url: `${this.baseUrl}/auth/me`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
			},
			json: true,
		};

		const authResponse = await this.helpers.httpRequest(authOptions);
		if (!authResponse.id || !authResponse.email) {
			throw new NodeOperationError(
				this.context.getNode(),
				'Invalid authentication response: Missing account details',
			);
		}
	}

	async getWorkspaces(): Promise<INodePropertyOptions[]> {
		await this.init();

		const workspaceOptions: IHttpRequestOptions = {
			method: 'GET',
			url: `${this.baseUrl}/workspace`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
			},
			json: true,
		};

		const responseData = await this.helpers.httpRequest(workspaceOptions);

		if (!Array.isArray(responseData)) {
			throw new NodeOperationError(
				this.context.getNode(),
				'Invalid response format: Expected an array of workspaces',
			);
		}

		return responseData.map((workspace: any) => ({
			name: workspace.display || workspace.name || `Workspace ${workspace.id}`,
			value: workspace.id?.toString() || workspace.name,
		}));
	}

	// async getTables(workspaceId: string): Promise<INodePropertyOptions[]> {
	// 	await this.init();

	// 	console.log(`${this.baseUrl}/workspace/${encodeURIComponent(workspaceId)}/table`, this.accessToken, 'Fetching tables for workspace:', workspaceId);
	// 	const tableOptions: IHttpRequestOptions = {
	// 		method: 'GET',
	// 		url: `${this.baseUrl}/workspace/${encodeURIComponent(workspaceId)}/table`,
	// 		headers: {
	// 			Authorization: `Bearer ${this.accessToken}`,
	// 			Accept: '*/*',
	// 		},
	// 		json: true,
	// 	};

	// 	const responseData = await this.helpers.httpRequest(tableOptions);
	// 	console.log(responseData, 'Received tables response');
	// 	if (!Array.isArray(responseData.items)) {
	// 		throw new NodeOperationError(
	// 			this.context.getNode(),
	// 			'Invalid response format: Expected an array of tables',
	// 		);
	// 	}

	// 	return responseData.items.map((table: any) => ({
	// 		name: table.display || table.name || `Table ${table.id}`,
	// 		value: table.id?.toString() || table.name,
	// 	}));
	// }

	async getTables(workspaceId: string): Promise<INodePropertyOptions[]> {
		await this.init();
		console.log("Fetching tables for workspace:", workspaceId, "with base URL:", `${this.baseUrl}/workspace/${encodeURIComponent(workspaceId)}/table`);
		const tableOptions: IHttpRequestOptions = {
			method: 'GET',
			url: `${this.baseUrl}/workspace/${encodeURIComponent(workspaceId)}/table`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
			},
			json: true,
		};

		try {
			const responseData = await this.helpers.httpRequest(tableOptions);

			if (!Array.isArray(responseData.items)) {
				return [];
			}
			console.log(responseData.items, 'Received tables response');
			return responseData.items.map((table: any) => ({
				name: table.display || table.name || `Table ${table.id}`,
				value: table.id?.toString() || table.name,
			}));

		} catch (error: any) {
			// Handle specific HTTP status codes that should return empty array instead of throwing
			if (error.response?.status === 401) {
				return [];
			}

			if (error.response?.status === 403) {
				return [];
			}

			if (error.response?.status === 404) {
				return [];
			}

			// Handle rate limiting
			if (error.response?.status === 429) {
				return [];
			}

			// For other errors (500, network issues, etc.), still throw the error
			throw new NodeOperationError(
				this.context.getNode(),
				`Failed to fetch tables: ${error.message || 'Unknown error'}`,
			);
		}
	}

	static fieldCache: Record<string, INodePropertyOptions[]> = {};

	// async getTableFields(workspaceId: string, tableId: string): Promise<INodePropertyOptions[]> {
	// 	await this.init()

	// 	const cacheKey = `${workspaceId}-${tableId}`

	// 	// If we already fetched for this key, return cached
	// 	if (this.cachedKey === cacheKey && this.cachedFields.length > 0) {
	// 		return this.cachedFields
	// 	}

	// 	// Otherwise, fetch fresh
	// 	const schemaOptions: IHttpRequestOptions = {
	// 		method: 'GET',
	// 		url: `https://xano.unicoconnect.net/workspace/${encodeURIComponent(workspaceId)}/table/${encodeURIComponent(tableId)}/schema`,
	// 		headers: {
	// 			Authorization: `Bearer ${this.accessToken}`,
	// 			Accept: '*/*',
	// 		},
	// 		json: true,
	// 	}

	// 	const schemaResponse = await this.helpers.httpRequest(schemaOptions)

	// 	if (!Array.isArray(schemaResponse)) {
	// 		throw new NodeOperationError(this.context.getNode(), 'Invalid schema response: Expected an array of columns')
	// 	}

	// 	const fieldOptions = schemaResponse
	// 		.filter(column => {
	// 			// const isSystemField = ['created_at', 'updated_at'].includes(column.name?.toLowerCase())
	// 			const isPrivate = column.access === 'private'
	// 			// const isAutoId = column.name === 'id' && column.type === 'int' && column.required
	// 			return !isPrivate
	// 		})
	// 		.map(column => {
	// 			let label = column.name || 'Unnamed'
	// 			if (column.type) label += ` (${column.type})`
	// 			if (column.required && !column.default) label += ' *'

	// 			const descParts = []
	// 			if (column.type) descParts.push(`Type: ${column.type}`)
	// 			if (column.required && !column.default) descParts.push('Required')
	// 			if (column.default) descParts.push(`Default: ${column.default}`)

	// 				console.log('columns -------------->',column)
	// 			return {
	// 				name: label,
	// 				value: column.name,
	// 				description: descParts.join(' • '),
	// 				required: column.required || false,
	// 				access: column.access || 'public',
	// 			}
	// 		})

	// 	// Cache only the latest selection
	// 	this.cachedKey = cacheKey
	// 	this.cachedFields = fieldOptions
	// 	console.log('cached options', cacheKey)
	// 	return fieldOptions
	// }
	async getTableFields(workspaceId: string, tableId: string): Promise<INodePropertyOptions[]> {
		await this.init()

		const cacheKey = `${workspaceId}-${tableId}`

		// Return from cache if exists
		if (XanoApiClient.fieldCache[cacheKey]) {
			console.log('Returning cached fields for:', XanoApiClient.fieldCache)
			return XanoApiClient.fieldCache[cacheKey]
		}

		// Clear all previous cache entries before adding new
		XanoApiClient.fieldCache = {}

		// Fetch fresh schema
		const schemaOptions: IHttpRequestOptions = {
			method: 'GET',
			url: `${this.baseUrl}/workspace/${encodeURIComponent(workspaceId)}/table/${encodeURIComponent(tableId)}/schema`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
			},
			json: true,
		}

		const schemaResponse = await this.helpers.httpRequest(schemaOptions)

		if (!Array.isArray(schemaResponse)) {
			throw new NodeOperationError(
				this.context.getNode(),
				'Invalid schema response: Expected an array of columns'
			)
		}

		const fieldOptions = schemaResponse
			.filter((column) => column.access !== 'private')
			.map((column) => {
				let label = column.name || 'Unnamed'

				// Append type always
				if (column.type) label += ` (${column.type})`

				// Show `*` for required fields except `id`
				const isIdField = column.name?.toLowerCase() === 'id'
				if (column.required && !column.default && !isIdField) {
					label += ' *'
				}

				const descParts = []
				if (column.type) descParts.push(`Type: ${column.type}`)
				if (column.required && !column.default && !isIdField) {
					descParts.push('Required')
				}
				if (column.default) {
					descParts.push(`Default: ${column.default}`)
				}

				return {
					name: label,
					value: column.name,
					description: descParts.join(' • '),
					required: column.required || false,
					access: column.access || 'public',
				}
			})

		// Cache only the current table
		XanoApiClient.fieldCache[cacheKey] = fieldOptions
		return fieldOptions
	}

	async getTableFieldsForCreate(workspaceId: string, tableId: string): Promise<INodePropertyOptions[]> {
		const allFields = await this.getTableFields(workspaceId, tableId)
		
		// Filter out ID fields for create operations since they are auto-generated
		return allFields.filter((field) => {
			const fieldName = field.value?.toString().toLowerCase()
			return fieldName !== 'id'
		})
	}

	async getTableContent(
		workspaceId: string,
		tableId: string,
		qs: Record<string, any>,
	): Promise<any> {
		await this.init();

		const tableContentOptions: IHttpRequestOptions = {
			method: 'GET',
			url: `${this.baseUrl}/workspace/${encodeURIComponent(workspaceId)}/table/${encodeURIComponent(tableId)}/content`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'X-data-source': 'live',
			},
			qs: qs,
			json: true,
		};

		return this.helpers.httpRequest(tableContentOptions);
	}

	async searchTableRow(
		workspaceId: string,
		tableId: string,
		page: number = 1,
		perPage: number = 10,
		sortBy?: string,
		sortOrder?: string,
		searchConditions?: Array<Record<string, string>>,
	): Promise<any> {
		await this.init()

		// Build body conditionally
		const body: Record<string, any> = {
			page,
			per_page: perPage,
		}
		console.log("page", page, "perPage", perPage)
		console.log("sortBy", sortBy, "sortOrder", sortOrder, "searchConditions", searchConditions)
		if (sortBy && sortOrder) {
			body.sort = {
				[sortBy]: sortOrder,
			}
		}

		if (searchConditions && Array.isArray(searchConditions) && searchConditions.length > 0) {
			body.search = searchConditions
		}

		const tableContentOptions: IHttpRequestOptions = {
			method: 'POST',
			url: `${this.baseUrl}/workspace/${workspaceId}/table/${tableId}/content/search`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'X-data-source': 'live',
			},
			body,
			json: true,
		}

		return this.helpers.httpRequest(tableContentOptions)
	}

	async createRow(workspaceId: string, tableId: string, rowData: any): Promise<any> {
		await this.init();

		const createRowOptions: IHttpRequestOptions = {
			method: 'POST',
			url: `${this.baseUrl}/workspace/${encodeURIComponent(workspaceId)}/table/${encodeURIComponent(tableId)}/content`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			body: rowData,
			json: true,
		};

		return this.helpers.httpRequest(createRowOptions);
	}

	async updateRow(workspaceId: string, tableId: string, rowData: any): Promise<any> {
		await this.init();

		const updateRowOptions: IHttpRequestOptions = {
			method: 'PUT',
			url: `${this.baseUrl}/workspace/${encodeURIComponent(workspaceId)}/table/${encodeURIComponent(tableId)}/content/${rowData.id}`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			body: rowData,
			json: true,
		};

		return this.helpers.httpRequest(updateRowOptions);
	}

	async getSingleContent(workspaceId: string, tableId: string, contentId: string): Promise<any> {
		await this.init();

		const getSingleRowOptions: IHttpRequestOptions = {
			method: 'PUT',
			url: `${this.baseUrl}/workspace/${workspaceId}/table/${tableId}/content/${contentId}`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			json: true,
		};

		return this.helpers.httpRequest(getSingleRowOptions);
	}

	async deleteSingleContent(workspaceId: string, tableId: string, contentId: string): Promise<any> {
		await this.init();

		const deleteSingleRowOptions: IHttpRequestOptions = {
			method: 'DELETE',
			url: `${this.baseUrl}/workspace/${workspaceId}/table/${tableId}/content/${contentId}`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
				'x-data-source': 'live',
			},
			json: true,
		};

		const response = await this.helpers.httpRequest(deleteSingleRowOptions);

		// ✅ Fix: return a default success message if response is null
		if (response === null || response === undefined) {
			return { success: true, message: 'Content deleted successfully.' };
		}

		return response;
	}

	async bulkCreateContent(
		workspaceId: string,
		tableId: string,
		items: any,
		allowIdField: boolean,
	): Promise<any> {
		await this.init();

		const createRowOptions: IHttpRequestOptions = {
			method: 'POST',
			url: `${this.baseUrl}/workspace/${workspaceId}/table/${tableId}/content/bulk`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			body: {
				items,
				allow_id_field: allowIdField,
			},
			json: true,
		};

		return this.helpers.httpRequest(createRowOptions);
	}

	async bulkUpdateContent(workspaceId: string, tableId: string, items: any): Promise<any> {
		await this.init();

		const updateRowOptions: IHttpRequestOptions = {
			method: 'POST',
			url: `${this.baseUrl}/workspace/${workspaceId}/table/${tableId}/content/bulk/patch`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			body: {
				items,
			},
			json: true,
		};

		return this.helpers.httpRequest(updateRowOptions);
	}

	async bulkCreateContentWithJson(workspaceId: string, tableId: string, items: any): Promise<any> {
		await this.init();

		const createRowOptions: IHttpRequestOptions = {
			method: 'POST',
			url: `${this.baseUrl}/workspace/${workspaceId}/table/${tableId}/content/bulk`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			body: {
				items: items.items,
				allow_id_field: items.allow_id_field,
			},
			json: true,
		};

		return this.helpers.httpRequest(createRowOptions);
	}

	async bulkUpdateContentWithJson(workspaceId: string, tableId: string, items: any): Promise<any> {
		await this.init();

		const updateRowOptions: IHttpRequestOptions = {
			method: 'POST',
			url: `${this.baseUrl}/workspace/${workspaceId}/table/${tableId}/content/bulk/patch`,
			headers: {
				Authorization: `Bearer ${this.accessToken}`,
				Accept: '*/*',
				'Content-Type': 'application/json',
			},
			body: {
				items: items.items,
			},
			json: true,
		};

		return this.helpers.httpRequest(updateRowOptions);
	}
}
