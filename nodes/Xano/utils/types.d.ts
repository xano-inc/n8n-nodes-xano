// types.d.ts or src/types.d.ts

import 'n8n-workflow';

declare module 'n8n-workflow' {
	interface INodePropertyOptions {
		required?: boolean;
		access?: string;
	}
}
