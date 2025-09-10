import { INode, NodeApiError, NodeOperationError } from 'n8n-workflow';

interface XanoErrorResponse {
	code?: string;
	message?: string;
	payload?: {
		param?: string;
		[key: string]: any;
	};
}

function extractXanoErrorDetails(error: any): XanoErrorResponse | null {
	if (error?.response?.data) {
		try {
			return error.response.data as XanoErrorResponse;
		} catch {
			return null;
		}
	}

	if (error?.errorResponse?.body) {
		try {
			return typeof error.errorResponse.body === 'string'
				? JSON.parse(error.errorResponse.body)
				: (error.errorResponse.body as XanoErrorResponse);
		} catch {
			return null;
		}
	}

	return null;
}

export function handleXanoError(
	node: INode,
	error: any,
	defaultMessage: string,
): NodeOperationError {
	if (error instanceof NodeApiError) {
		const xanoError = extractXanoErrorDetails(error);
		let detailedError = '';

		if (xanoError) {
			const parts: string[] = [];

			if (xanoError.code) parts.push(`Code: ${xanoError.code}`);
			if (xanoError.message) parts.push(`Message: ${xanoError.message}`);
			if (xanoError.payload?.param) parts.push(`Parameter: ${xanoError.payload.param}`);

			detailedError = parts.join(' - ');
		}

		let errorMessage = detailedError;

		// Fallback to status-code messages if not enough details
		if (!errorMessage) {
			switch (error.httpCode) {
				case '400':
					errorMessage = 'Bad Request: Check the request payload and parameter types.';
					break;
				case '401':
					errorMessage = 'Unauthorized: Invalid access token.';
					break;
				case '403':
					errorMessage = 'Access denied: Additional privileges required.';
					break;
				case '404':
					errorMessage = 'Not Found: The requested resource was not found.';
					break;
				case '422':
					errorMessage = 'Validation error: Check your field values and types.';
					break;
				case '429':
					errorMessage = 'Rate Limited: Too many requests. Try again later.';
					break;
				case '500':
					errorMessage = 'Internal Server Error: Unexpected error on the server.';
					break;
				default:
					errorMessage = `${defaultMessage}: ${error.message}`;
			}
		}

		return new NodeOperationError(node, errorMessage);
	}

	if (!error) {
		return new NodeOperationError(node, `${defaultMessage}: Unknown error or null response`);
	}

	return new NodeOperationError(node, `${defaultMessage}: ${error.message}`);
}

export function handleXanoErrorDetailed(
	node: INode,
	error: any,
	operation: string,
): NodeOperationError {
	if (!error) {
		console.log('⚠️ Null or undefined error received. Likely a DELETE success with no content.');
		console.log('🔍 XANO ERROR HANDLER DEBUG - END');
		console.log("first line", error)
		return new NodeOperationError(
			node,
			`${operation} returned no content. If this was a DELETE, it may have succeeded.`,
		);
	}

	// Handle NodeOperationError (validation errors) - re-throw as-is
	if (error instanceof NodeOperationError) {
		console.log('🔄 NodeOperationError detected, re-throwing original error');
		console.log('🔍 XANO ERROR HANDLER DEBUG - END');
		console.log("second line", error)
		return error;
	}

	let xanoErrorDetails = extractXanoErrorDetails(error);
	let errorMessage = `Xano ${operation} failed`;

	if (xanoErrorDetails) {
		const parts: string[] = [];

		if(xanoErrorDetails.code === 'ERROR_CODE_NOT_FOUND') {
			console.log('❌ Error code indicates resource not found:', xanoErrorDetails.code);
			errorMessage = `Record not found`;
			return new NodeOperationError(node, errorMessage);
		}

		if (xanoErrorDetails.code) {
			console.log('📋 Code:', xanoErrorDetails.code);
			parts.push(`Error: ${xanoErrorDetails.code}`);
		}
		if (xanoErrorDetails.message) {
			console.log('💬 Message:', xanoErrorDetails.message);
			parts.push(xanoErrorDetails.message);
		}
		if (xanoErrorDetails.payload?.param) {
			console.log('🎯 Parameter:', xanoErrorDetails.payload.param);
			parts.push(`Parameter "${xanoErrorDetails.payload.param}" is invalid`);
		}

		if (parts.length > 0) {
			errorMessage = parts.join(' - ');
		}
	} else {
		console.log('⚠️ No Xano details found, using HTTP fallback');
		console.log('Error details:', error);
		switch (error.httpCode) {
			case '400':
				errorMessage += ': Invalid request parameters or data types';
				break;
			case '401':
				errorMessage += ': Authentication failed';
				break;
			case '403':
				errorMessage += ': Access denied';
				break;
			case '404':
				errorMessage += ': Resource not found';
				break;
			case '422':
				errorMessage += ': Validation failed';
				break;
			case '429':
				errorMessage += ': Rate limit exceeded';
				break;
			case '500':
				errorMessage += ': Server error';
				break;
			default:
				errorMessage += `: HTTP ${error.httpCode}`;
		}
	}

	console.log('🎯 Final error message:', errorMessage);
	console.log('🔍 XANO ERROR HANDLER DEBUG - END');
	return new NodeOperationError(node, errorMessage);
}
