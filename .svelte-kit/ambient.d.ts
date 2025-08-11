
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```sh
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const GITHUB_TOKEN: string;
	export const DOCKER_BUILDKIT: string;
	export const LESSOPEN: string;
	export const VSCODE_CWD: string;
	export const ENABLE_DYNAMIC_INSTALL: string;
	export const VSCODE_ESM_ENTRYPOINT: string;
	export const GITHUB_CODESPACE_TOKEN: string;
	export const PYTHONIOENCODING: string;
	export const USER: string;
	export const VSCODE_NLS_CONFIG: string;
	export const npm_config_user_agent: string;
	export const NVS_ROOT: string;
	export const RVM_PATH: string;
	export const FEATURE_SPARK_POST_COMMIT_CREATE_ITERATION: string;
	export const VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
	export const HOSTNAME: string;
	export const GEMINI_YOLO_MODE: string;
	export const PIPX_HOME: string;
	export const CONDA_SCRIPT: string;
	export const DOTNET_USE_POLLING_FILE_WATCHER: string;
	export const DEBUG: string;
	export const npm_node_execpath: string;
	export const GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: string;
	export const SHLVL: string;
	export const BROWSER: string;
	export const npm_config_noproxy: string;
	export const HUGO_ROOT: string;
	export const HOME: string;
	export const OLDPWD: string;
	export const ORYX_ENV_TYPE: string;
	export const NVM_BIN: string;
	export const VSCODE_IPC_HOOK_CLI: string;
	export const npm_package_json: string;
	export const NVM_INC: string;
	export const CODESPACES: string;
	export const rvm_stored_umask: string;
	export const PIPX_BIN_DIR: string;
	export const DYNAMIC_INSTALL_ROOT_DIR: string;
	export const NVM_SYMLINK_CURRENT: string;
	export const DOTNET_RUNNING_IN_CONTAINER: string;
	export const GRADLE_HOME: string;
	export const ORYX_DIR: string;
	export const rvm_user_install_flag: string;
	export const MAVEN_HOME: string;
	export const JUPYTERLAB_PATH: string;
	export const npm_config_userconfig: string;
	export const npm_config_local_prefix: string;
	export const GOROOT: string;
	export const NODE_ROOT: string;
	export const GITHUB_USER: string;
	export const GITHUB_GRAPHQL_URL: string;
	export const COLOR: string;
	export const PYTHON_PATH: string;
	export const NVM_DIR: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_config_metrics_registry: string;
	export const DOTNET_SKIP_FIRST_TIME_EXPERIENCE: string;
	export const VSCODE_L10N_BUNDLE_LOCATION: string;
	export const APPLICATION_INSIGHTS_NO_STATSBEAT: string;
	export const ContainerVersion: string;
	export const GITHUB_API_URL: string;
	export const NVS_HOME: string;
	export const _: string;
	export const rvm_bin_path: string;
	export const VSCODE_HANDLES_SIGPIPE: string;
	export const SDKMAN_CANDIDATES_API: string;
	export const SURFACE: string;
	export const npm_config_prefix: string;
	export const npm_config_npm_version: string;
	export const CLOUDENV_ENVIRONMENT_ID: string;
	export const RUBY_VERSION: string;
	export const PROMPT_DIRTRIM: string;
	export const IRBRC: string;
	export const npm_config_cache: string;
	export const DOTNET_ROOT: string;
	export const NVS_DIR: string;
	export const PHP_ROOT: string;
	export const npm_config_node_gyp: string;
	export const PATH: string;
	export const JAVA_ROOT: string;
	export const SDKMAN_CANDIDATES_DIR: string;
	export const USE_CCPA: string;
	export const NODE: string;
	export const npm_package_name: string;
	export const NPM_GLOBAL: string;
	export const HUGO_DIR: string;
	export const SHELL_LOGGED_IN: string;
	export const MY_RUBY_HOME: string;
	export const LANG: string;
	export const LS_COLORS: string;
	export const SDKMAN_DIR: string;
	export const GITHUB_REPOSITORY: string;
	export const RUBY_ROOT: string;
	export const SDKMAN_PLATFORM: string;
	export const npm_lifecycle_script: string;
	export const SHELL: string;
	export const GOPATH: string;
	export const npm_package_version: string;
	export const npm_lifecycle_event: string;
	export const rvm_prefix: string;
	export const ELECTRON_RUN_AS_NODE: string;
	export const rvm_loaded_flag: string;
	export const GEM_HOME: string;
	export const LESSCLOSE: string;
	export const ORYX_PREFER_USER_INSTALLED_SDKS: string;
	export const ORYX_SDK_STORAGE_BASE_URL: string;
	export const rvm_version: string;
	export const CONDA_DIR: string;
	export const DEBIAN_FLAVOR: string;
	export const npm_config_globalconfig: string;
	export const npm_config_init_module: string;
	export const JAVA_HOME: string;
	export const NVS_USE_XZ: string;
	export const PWD: string;
	export const INTERNAL_VSCS_TARGET_URL: string;
	export const GEM_PATH: string;
	export const npm_execpath: string;
	export const GITHUB_SERVER_URL: string;
	export const NVM_CD_FLAGS: string;
	export const npm_config_global_prefix: string;
	export const npm_command: string;
	export const CODESPACE_NAME: string;
	export const PYTHON_ROOT: string;
	export const NVS_OS: string;
	export const PHP_PATH: string;
	export const RAILS_DEVELOPMENT_HOSTS: string;
	export const MAVEN_ROOT: string;
	export const RUBY_HOME: string;
	export const rvm_path: string;
	export const NUGET_XMLDOC_MODE: string;
	export const INIT_CWD: string;
	export const EDITOR: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		GITHUB_TOKEN: string;
		DOCKER_BUILDKIT: string;
		LESSOPEN: string;
		VSCODE_CWD: string;
		ENABLE_DYNAMIC_INSTALL: string;
		VSCODE_ESM_ENTRYPOINT: string;
		GITHUB_CODESPACE_TOKEN: string;
		PYTHONIOENCODING: string;
		USER: string;
		VSCODE_NLS_CONFIG: string;
		npm_config_user_agent: string;
		NVS_ROOT: string;
		RVM_PATH: string;
		FEATURE_SPARK_POST_COMMIT_CREATE_ITERATION: string;
		VSCODE_HANDLES_UNCAUGHT_ERRORS: string;
		HOSTNAME: string;
		GEMINI_YOLO_MODE: string;
		PIPX_HOME: string;
		CONDA_SCRIPT: string;
		DOTNET_USE_POLLING_FILE_WATCHER: string;
		DEBUG: string;
		npm_node_execpath: string;
		GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: string;
		SHLVL: string;
		BROWSER: string;
		npm_config_noproxy: string;
		HUGO_ROOT: string;
		HOME: string;
		OLDPWD: string;
		ORYX_ENV_TYPE: string;
		NVM_BIN: string;
		VSCODE_IPC_HOOK_CLI: string;
		npm_package_json: string;
		NVM_INC: string;
		CODESPACES: string;
		rvm_stored_umask: string;
		PIPX_BIN_DIR: string;
		DYNAMIC_INSTALL_ROOT_DIR: string;
		NVM_SYMLINK_CURRENT: string;
		DOTNET_RUNNING_IN_CONTAINER: string;
		GRADLE_HOME: string;
		ORYX_DIR: string;
		rvm_user_install_flag: string;
		MAVEN_HOME: string;
		JUPYTERLAB_PATH: string;
		npm_config_userconfig: string;
		npm_config_local_prefix: string;
		GOROOT: string;
		NODE_ROOT: string;
		GITHUB_USER: string;
		GITHUB_GRAPHQL_URL: string;
		COLOR: string;
		PYTHON_PATH: string;
		NVM_DIR: string;
		DEBUGINFOD_URLS: string;
		npm_config_metrics_registry: string;
		DOTNET_SKIP_FIRST_TIME_EXPERIENCE: string;
		VSCODE_L10N_BUNDLE_LOCATION: string;
		APPLICATION_INSIGHTS_NO_STATSBEAT: string;
		ContainerVersion: string;
		GITHUB_API_URL: string;
		NVS_HOME: string;
		_: string;
		rvm_bin_path: string;
		VSCODE_HANDLES_SIGPIPE: string;
		SDKMAN_CANDIDATES_API: string;
		SURFACE: string;
		npm_config_prefix: string;
		npm_config_npm_version: string;
		CLOUDENV_ENVIRONMENT_ID: string;
		RUBY_VERSION: string;
		PROMPT_DIRTRIM: string;
		IRBRC: string;
		npm_config_cache: string;
		DOTNET_ROOT: string;
		NVS_DIR: string;
		PHP_ROOT: string;
		npm_config_node_gyp: string;
		PATH: string;
		JAVA_ROOT: string;
		SDKMAN_CANDIDATES_DIR: string;
		USE_CCPA: string;
		NODE: string;
		npm_package_name: string;
		NPM_GLOBAL: string;
		HUGO_DIR: string;
		SHELL_LOGGED_IN: string;
		MY_RUBY_HOME: string;
		LANG: string;
		LS_COLORS: string;
		SDKMAN_DIR: string;
		GITHUB_REPOSITORY: string;
		RUBY_ROOT: string;
		SDKMAN_PLATFORM: string;
		npm_lifecycle_script: string;
		SHELL: string;
		GOPATH: string;
		npm_package_version: string;
		npm_lifecycle_event: string;
		rvm_prefix: string;
		ELECTRON_RUN_AS_NODE: string;
		rvm_loaded_flag: string;
		GEM_HOME: string;
		LESSCLOSE: string;
		ORYX_PREFER_USER_INSTALLED_SDKS: string;
		ORYX_SDK_STORAGE_BASE_URL: string;
		rvm_version: string;
		CONDA_DIR: string;
		DEBIAN_FLAVOR: string;
		npm_config_globalconfig: string;
		npm_config_init_module: string;
		JAVA_HOME: string;
		NVS_USE_XZ: string;
		PWD: string;
		INTERNAL_VSCS_TARGET_URL: string;
		GEM_PATH: string;
		npm_execpath: string;
		GITHUB_SERVER_URL: string;
		NVM_CD_FLAGS: string;
		npm_config_global_prefix: string;
		npm_command: string;
		CODESPACE_NAME: string;
		PYTHON_ROOT: string;
		NVS_OS: string;
		PHP_PATH: string;
		RAILS_DEVELOPMENT_HOSTS: string;
		MAVEN_ROOT: string;
		RUBY_HOME: string;
		rvm_path: string;
		NUGET_XMLDOC_MODE: string;
		INIT_CWD: string;
		EDITOR: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
