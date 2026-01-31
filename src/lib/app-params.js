const isNode = typeof window === 'undefined';
const windowObj = isNode ? {
	localStorage: {
		_data: new Map(),
		setItem: function (k, v) { this._data.set(k, v); },
		getItem: function (k) { return this._data.get(k); },
		removeItem: function (k) { this._data.delete(k); }
	}
} : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `app_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	if (getAppParamValue("clear_access_token") === 'true') {
		storage.removeItem('app_access_token');
		storage.removeItem('token');
	}

	const runtime = (typeof window !== 'undefined' && window.__RUNTIME_CONFIG__) ? window.__RUNTIME_CONFIG__ : {};

	return {
		appId: getAppParamValue("app_id", { defaultValue: runtime.VITE_APP_ID || import.meta.env.VITE_APP_ID }),
		token: getAppParamValue("access_token", { removeFromUrl: true }),
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: runtime.VITE_APP_FUNCTIONS_VERSION || import.meta.env.VITE_APP_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: runtime.VITE_APP_BASE_URL || import.meta.env.VITE_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}
