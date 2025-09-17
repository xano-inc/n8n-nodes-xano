import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class XanoApi implements ICredentialType {
	name = 'xanoApi';
	displayName = 'Xano API';
	documentationUrl = 'https://docs.xano.com/xano-features/metadata-api#generate-an-access-token';

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: '',
			placeholder: 'https://xxx-xxx-xx-x-xxx.xano.io',
			required: true,
			description: 'The base URL of your Xano API instance',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			default: '',
			typeOptions: {
				password: true,
			},
			required: true,
			description: 'The API access token for Xano authentication',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.accessToken}}',
			},
		},
	};

	// This is used to test the credentials (dummy request)
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.xano.com',
			url: '/api:meta/auth/me',
		},
	};
}
