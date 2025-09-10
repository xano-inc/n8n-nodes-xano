import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';
import { handleXanoError } from '../utils/ErrorHandler';
import { XanoApiClient } from '../utils/XanoApiClient';

export const xanoLoadOptions = {
	loadOptions: {
		async getWorkspaces(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			try {
				const apiClient = new XanoApiClient(this);
				// await apiClient.validateAuth();
				return await apiClient.getWorkspaces();
			} catch (error: any) {
				throw handleXanoError(this.getNode(), error, 'Failed to load workspaces');
			}
		},

		async getTables(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			const workspace = this.getCurrentNodeParameter('workspace') as string;

			if (!workspace) {
				return [];
			}
			console.log(`Fetching tables for workspace: from getTables ${workspace}`);
			try {
				const apiClient = new XanoApiClient(this);
				const tables = await apiClient.getTables(workspace);
				if (!tables || tables.length === 0) {
					return [];
				}
				return tables;
			} catch (error: any) {
				throw handleXanoError(
					this.getNode(),
					error,
					`Failed to load tables for workspace: ${workspace}`,
				);
			}
		},

		async getTableFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			const workspace = this.getCurrentNodeParameter('workspace') as string;
			const table = this.getCurrentNodeParameter('table') as string;

			if (!workspace || !table) {
				return [];
			}

			try {
				const apiClient = new XanoApiClient(this);
				return await apiClient.getTableFields(workspace, table);
			} catch (error: any) {
				throw handleXanoError(
					this.getNode(),
					error,
					`Failed to load table fields. Workspace: ${workspace}, Table: ${table}`,
				);
			}
		},

		async getTableFieldsForCreate(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
			const workspace = this.getCurrentNodeParameter('workspace') as string;
			const table = this.getCurrentNodeParameter('table') as string;

			if (!workspace || !table) {
				return [];
			}

			try {
				const apiClient = new XanoApiClient(this);
				return await apiClient.getTableFieldsForCreate(workspace, table);
			} catch (error: any) {
				throw handleXanoError(
					this.getNode(),
					error,
					`Failed to load table fields for create. Workspace: ${workspace}, Table: ${table}`,
				);
			}
		},
	},
};
