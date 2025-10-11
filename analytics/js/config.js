/**
 * Frostbyte Analytics Dashboard Configuration Manager
 * Handles secure storage and retrieval of configuration settings
 */

class ConfigManager {
    constructor() {
        this.storageKey = 'frostbyte_analytics_config';
        this.encryptionKey = 'frostbyte_analytics_v2'; // Simple obfuscation key
        this.config = this.loadConfig();
    }

    /**
     * Encrypt sensitive data
     */
    encrypt(data) {
        try {
            console.log('🔐 Encrypting data...', typeof data, data?.length || 'no length');
            
            if (!data || typeof data !== 'string') {
                console.log('❌ Invalid data for encryption');
                return data;
            }
            
            // For GitHub tokens, use simple base64 encoding to avoid corruption
            if (data.startsWith('github_pat_') || data.startsWith('ghp_')) {
                console.log('🔐 Using base64 encoding for GitHub token');
                return 'b64:' + btoa(data); // Add prefix to identify base64 encoding
            }
            
            // For other data, use simple base64 encoding to avoid XOR corruption
            console.log('🔐 Using base64 encoding for data');
            return 'b64:' + btoa(data);
        } catch (error) {
            console.error('❌ Encryption failed:', error);
            return data;
        }
    }

    /**
     * Simple decryption for sensitive data
     */
    decrypt(encryptedText) {
        if (!encryptedText) return '';
        
        try {
            // Check if it's new base64 format with prefix
            if (encryptedText.startsWith('b64:')) {
                console.log('🔓 Decrypting base64 encoded data (new format)');
                const base64Data = encryptedText.substring(4); // Remove 'b64:' prefix
                const decoded = atob(base64Data);
                console.log('✅ Token decrypted successfully (base64)');
                return decoded;
            }
            
            // Base64 decode first for legacy formats
            const decoded = atob(encryptedText);
            
            // Check if this looks like a GitHub token (was base64 encoded only)
            if (decoded.startsWith('github_pat_') || decoded.startsWith('ghp_')) {
                console.log('🔓 Detected base64-only encoded token (legacy)');
                return decoded;
            }
            
            // Otherwise, it's XOR encrypted - decrypt it
            let decrypted = '';
            for (let i = 0; i < decoded.length; i++) {
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                const encryptedChar = decoded.charCodeAt(i);
                decrypted += String.fromCharCode(encryptedChar ^ keyChar);
            }
            
            // Validate decrypted token
            if (decrypted.startsWith('github_pat_') || decrypted.startsWith('ghp_')) {
                console.log('✅ Token decrypted successfully (XOR)');
                return decrypted;
            } else {
                console.log('❌ XOR decryption produced invalid result, trying fallback');
                throw new Error('Invalid XOR decryption result');
            }
            
        } catch (error) {
            console.warn('Primary decryption failed:', error.message);
            // Try direct base64 decode as fallback
            try {
                const fallback = atob(encryptedText);
                if (fallback.startsWith('github_pat_') || fallback.startsWith('ghp_')) {
                    console.log('🔧 Used fallback base64 decoding');
                    return fallback;
                }
            } catch (e) {
                console.error('All decryption methods failed');
            }
            return ''; // Return empty string for failed decryption
        }
    }

    /**
     * Load configuration from localStorage
     */
    loadConfig() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (!stored) {
                console.log('No stored configuration found, using defaults');
                return this.getDefaultConfig();
            }

            const config = JSON.parse(stored);
            
            // Don't decrypt here - let the get() method handle decryption on-demand
            console.log('Configuration loaded successfully');
            return { ...this.getDefaultConfig(), ...config };
        } catch (error) {
            console.error('Failed to load configuration:', error);
            return this.getDefaultConfig();
        }
    }

    /**
     * Save configuration to localStorage
     */
    saveConfig() {
        try {
            const configToStore = JSON.parse(JSON.stringify(this.config));
            
            // Encrypt sensitive fields
            if (configToStore.github?.token) {
                configToStore.github.token = this.encrypt(configToStore.github.token);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(configToStore));
            console.log('Configuration saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save configuration:', error);
            return false;
        }
    }

    /**
     * Get default configuration
     */
    getDefaultConfig() {
        // Default token (can be overridden by localStorage)
        const defaultToken = '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';
        
        return {
            github: {
                token: defaultToken,
                owner: 'shadow11001',
                repo: 'Frostbyte',
                apiUrl: 'https://api.github.com',
                labels: ['usage-analytics', 'frostbyte-analytics', 'analytics'],
                autoRefresh: false,
                refreshInterval: 300000 // 5 minutes
            },
            dashboard: {
                theme: 'auto',
                autoRefresh: true,
                refreshInterval: 60000, // 1 minute
                maxReportsPerPage: 50,
                exportFormat: 'json'
            },
            cache: {
                enabled: true,
                maxAge: 600000, // 10 minutes
                maxEntries: 100
            },
            notifications: {
                enabled: true,
                showSuccess: true,
                showErrors: true,
                autoHide: true,
                hideDelay: 5000
            },
            lastUpdated: Date.now()
        };
    }

    /**
     * Get a configuration value
     */
    get(key) {
        let value = this.getNestedValue(this.config, key);
        
        // Special handling for encrypted fields
        if (key === 'github.token' && value) {
            // Check if the token appears to be encrypted (has b64: prefix or is base64 encoded)
            if (value.startsWith('b64:') || (value.length > 50 && !value.startsWith('ghp_') && !value.startsWith('github_pat_'))) {
                console.log('🔓 Decrypting stored token...');
                try {
                    const decryptedValue = this.decrypt(value);
                    console.log('✅ Token decrypted successfully');
                    console.log('🔑 Config.get("github.token"):', decryptedValue ? `${decryptedValue.substring(0, 15)}...${decryptedValue.substring(decryptedValue.length - 4)}` : 'NOT SET');
                    return decryptedValue;
                } catch (error) {
                    console.error('❌ Token decryption failed:', error);
                    return '';
                }
            }
            
            console.log('🔑 Config.get("github.token"):', value ? `${value.substring(0, 15)}...${value.substring(value.length - 4)}` : 'NOT SET');
        }
        
        return value;
    }

    /**
     * Helper method to get nested values using dot notation
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Helper method to set nested values using dot notation
     */
    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    /**
     * Set a configuration value
     */
    set(path, value) {
        this.setNestedValue(this.config, path, value);
        this.config.lastUpdated = Date.now();
        
        return this.saveConfig();
    }

    /**
     * Get GitHub configuration
     */
    getGitHubConfig() {
        return this.config.github;
    }

    /**
     * Set GitHub token
     */
    setGitHubToken(token) {
        return this.set('github.token', token);
    }

    /**
     * Get dashboard configuration
     */
    getDashboardConfig() {
        return this.config.dashboard;
    }

    /**
     * Check if GitHub is properly configured
     */
    isGitHubConfigured() {
        const token = this.get('github.token');
        const owner = this.get('github.owner');
        const repo = this.get('github.repo');
        
        console.log('🔧 GitHub Configuration Check:');
        console.log('  - Token:', token ? '✅ Present' : '❌ Missing');
        console.log('  - Owner:', owner ? `✅ ${owner}` : '❌ Missing');
        console.log('  - Repo:', repo ? `✅ ${repo}` : '❌ Missing');
        
        // Check if we have all required fields
        if (!token || !owner || !repo) {
            console.log('  - Configured: ❌ No (missing required fields)');
            return false;
        }
        
        // Check if token is not a placeholder
        if (token === '[REDACTED]') {
            console.log('  - Configured: ❌ No (token is redacted)');
            return false;
        }
        
        // Check token format - must start with valid GitHub token prefix
        const hasValidPrefix = token.startsWith('ghp_') || token.startsWith('github_pat_');
        if (!hasValidPrefix) {
            console.log('  - Configured: ❌ No (invalid token format)');
            console.log('  - Token starts with:', token.substring(0, 10) + '...');
            return false;
        }
        
        console.log('  - Configured: ✅ Yes');
        return true;
    }

    /**
     * Validate GitHub token format
     */
    validateGitHubToken(token) {
        if (!token || typeof token !== 'string') {
            return { valid: false, error: 'Token is required' };
        }

        token = token.trim();
        console.log('🔑 Validating token format:', {
            length: token.length,
            starts_with_ghp: token.startsWith('ghp_'),
            starts_with_github_pat: token.startsWith('github_pat_'),
            first_20_chars: token.substring(0, 20)
        });

        if (token.length < 10) {
            return { valid: false, error: 'Token is too short' };
        }

        // Check for valid GitHub token prefixes
        const isValidFormat = token.startsWith('ghp_') || 
                            token.startsWith('github_pat_') ||
                            token.match(/^github_pat_[A-Za-z0-9_]+$/) ||
                            token.match(/^ghp_[A-Za-z0-9_]+$/);

        if (!isValidFormat) {
            console.log('❌ Token validation failed. Expected format: ghp_xxx or github_pat_xxx');
            console.log('Actual token start:', token.substring(0, 15));
            return { 
                valid: false, 
                error: 'Invalid token format. GitHub tokens should start with "ghp_" or "github_pat_"' 
            };
        }

        console.log('✅ Token format validation passed');
        return { valid: true };
    }

    /**
     * Reset configuration to defaults
     */
    reset() {
        this.config = this.getDefaultConfig();
        localStorage.removeItem(this.storageKey);
        console.log('Configuration reset to defaults');
        return true;
    }

    /**
     * Export configuration (without sensitive data)
     */
    exportConfig() {
        const exportConfig = JSON.parse(JSON.stringify(this.config));
        if (exportConfig.github?.token) {
            exportConfig.github.token = '[REDACTED]';
        }
        return exportConfig;
    }

    /**
     * Debug token storage and retrieval
     */
    debugToken() {
        console.log('🔧 DEBUG: Token Storage Analysis');
        const storedData = localStorage.getItem(this.storageKey);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            const storedToken = parsed.github?.token;
            console.log('Stored token exists:', !!storedToken);
            console.log('Stored token type:', typeof storedToken);
            console.log('Stored token length:', storedToken?.length || 0);
            console.log('Stored token prefix:', storedToken?.substring(0, 20) || 'none');
            
            const retrievedToken = this.get('github.token');
            console.log('Retrieved token exists:', !!retrievedToken);
            console.log('Retrieved token type:', typeof retrievedToken);
            console.log('Retrieved token length:', retrievedToken?.length || 0);
            console.log('Retrieved token prefix:', retrievedToken?.substring(0, 20) || 'none');
        } else {
            console.log('No stored configuration found');
        }
    }
}

// Make available globally
window.ConfigManager = ConfigManager;

// Global debug function
window.debugConfig = function() {
    if (window.dashboard && window.dashboard.config) {
        window.dashboard.config.debugToken();
    } else {
        console.log('Dashboard not initialized');
    }
};