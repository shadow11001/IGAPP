/**
 * Frostbyte Analytics Dashboard - GitHub API Manager
 * Handles all GitHub API interactions and data parsing
 */

class GitHubAPI {
    constructor(configManager) {
        this.config = configManager;
        this.baseUrl = 'https://api.github.com';
        this.cache = new Map();
        this.rateLimitInfo = null;
    }

    /**
     * Get GitHub configuration
     */
    getConfig() {
        return this.config.getGitHubConfig();
    }

    /**
     * Get authorization headers
     */
    getHeaders() {
        const token = this.config.get('github.token');
        
        console.log('🔑 Checking GitHub token:', token ? `${token.substring(0, 4)}...${token.substring(token.length - 4)}` : 'NOT SET');
        
        if (!token) {
            console.error('❌ GitHub token not found in configuration');
            throw new Error('GitHub token not configured');
        }
        
        if (token === '[REDACTED]') {
            console.error('❌ GitHub token is redacted placeholder');
            throw new Error('GitHub token is not properly set');
        }
        
        // More lenient token format validation
        const isValidFormat = token.startsWith('ghp_') || 
                            token.startsWith('github_pat_') ||
                            token.match(/^github_pat_[A-Za-z0-9_]+$/) ||
                            token.match(/^ghp_[A-Za-z0-9_]+$/);
        
        if (!isValidFormat) {
            console.error('❌ Invalid GitHub token format. Token start:', token.substring(0, 15));
            console.error('Expected: ghp_xxx or github_pat_xxx');
            throw new Error('Invalid GitHub token format');
        }

        console.log('✅ GitHub token validation passed');
        return {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'User-Agent': 'Frostbyte-Analytics-Dashboard/2.0'
        };
    }

    /**
     * Make a GitHub API request with error handling and rate limiting
     */
    async makeRequest(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.config.get('cache.enabled') && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            const maxAge = this.config.get('cache.maxAge') || 600000; // 10 minutes
            
            if (Date.now() - cached.timestamp < maxAge) {
                console.log(`📦 Using cached data for ${endpoint}`);
                return cached.data;
            } else {
                this.cache.delete(cacheKey);
            }
        }

        try {
            console.log(`🌐 Making GitHub API request: ${endpoint}`);
            
            const headers = this.getHeaders();
            console.log('📋 Request headers:', {
                ...headers,
                'Authorization': headers.Authorization ? `Bearer ${headers.Authorization.substring(7, 11)}...` : 'NOT SET'
            });
            
            const response = await fetch(url, {
                headers,
                ...options
            });

            console.log(`📡 Response status: ${response.status} ${response.statusText}`);
            
            // Update rate limit info
            this.updateRateLimitInfo(response);

            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`❌ GitHub API Error (${response.status}):`, errorBody);
                
                throw new GitHubAPIError(
                    `GitHub API error: ${response.status} ${response.statusText}`,
                    response.status,
                    endpoint
                );
            }

            const data = await response.json();
            
            // Cache the response
            if (this.config.get('cache.enabled')) {
                this.cache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
                
                // Clean old cache entries
                this.cleanCache();
            }

            return data;
        } catch (error) {
            if (error instanceof GitHubAPIError) {
                throw error;
            }
            
            throw new GitHubAPIError(
                `Network error: ${error.message}`,
                0,
                endpoint
            );
        }
    }

    /**
     * Update rate limit information from response headers
     */
    updateRateLimitInfo(response) {
        this.rateLimitInfo = {
            limit: parseInt(response.headers.get('X-RateLimit-Limit')) || 0,
            remaining: parseInt(response.headers.get('X-RateLimit-Remaining')) || 0,
            reset: parseInt(response.headers.get('X-RateLimit-Reset')) || 0,
            used: parseInt(response.headers.get('X-RateLimit-Used')) || 0
        };
        
        console.log(`⚡ Rate limit: ${this.rateLimitInfo.remaining}/${this.rateLimitInfo.limit} remaining`);
    }

    /**
     * Get rate limit information
     */
    getRateLimitInfo() {
        return this.rateLimitInfo;
    }

    /**
     * Clean old cache entries
     */
    cleanCache() {
        const maxEntries = this.config.get('cache.maxEntries') || 100;
        
        if (this.cache.size > maxEntries) {
            const entries = Array.from(this.cache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            
            // Remove oldest entries
            const toRemove = entries.slice(0, this.cache.size - maxEntries);
            toRemove.forEach(([key]) => this.cache.delete(key));
            
            console.log(`🧹 Cleaned ${toRemove.length} old cache entries`);
        }
    }

    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }

    /**
     * Test GitHub API connection
     */
    async testConnection() {
        try {
            const user = await this.makeRequest('/user');
            const repo = await this.getRepository();
            
            return {
                success: true,
                user: user.login,
                repository: repo.name,
                permissions: repo.permissions
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                status: error.status
            };
        }
    }

    /**
     * Get repository information
     */
    async getRepository() {
        const { owner, repo } = this.getConfig();
        return await this.makeRequest(`/repos/${owner}/${repo}`);
    }

    /**
     * Fetch all relevant issues from GitHub
     */
    async fetchIssues(params = {}) {
        const config = this.getConfig();
        const { owner, repo } = config;
        const labels = config.labels || ['usage-analytics', 'frostbyte-analytics'];
        
        // Default parameters
        const defaultParams = {
            state: 'all',
            per_page: 100,
            sort: 'created',
            direction: 'desc',
            ...params
        };

        const queryString = new URLSearchParams(defaultParams).toString();
        const endpoint = `/repos/${owner}/${repo}/issues?${queryString}`;
        
        console.log(`📥 Fetching issues from: ${endpoint}`);
        console.log(`🏷️ Will filter for labels: ${labels.join(', ')}`);

        const allIssues = await this.makeRequest(endpoint);
        console.log(`📊 Total issues fetched: ${allIssues.length}`);
        
        // Filter issues that have any of our target labels
        const filteredIssues = allIssues.filter(issue => {
            const issueLabels = issue.labels?.map(l => l.name.toLowerCase()) || [];
            const hasTargetLabel = issueLabels.some(label => 
                labels.some(targetLabel => 
                    label.includes(targetLabel.toLowerCase()) || 
                    targetLabel.toLowerCase().includes(label)
                )
            );
            
            if (hasTargetLabel) {
                console.log(`✅ Issue #${issue.number} matches target labels:`, issueLabels);
            }
            
            return hasTargetLabel;
        });
        
        console.log(`🎯 Filtered to ${filteredIssues.length} relevant issues`);
        return filteredIssues;
    }

    /**
     * Get repository statistics
     */
    async getRepositoryStats() {
        const { owner, repo } = this.getConfig();
        
        try {
            const [repoInfo, contributors, releases] = await Promise.all([
                this.makeRequest(`/repos/${owner}/${repo}`),
                this.makeRequest(`/repos/${owner}/${repo}/contributors`),
                this.makeRequest(`/repos/${owner}/${repo}/releases`)
            ]);

            return {
                stars: repoInfo.stargazers_count,
                forks: repoInfo.forks_count,
                watchers: repoInfo.watchers_count,
                contributors: contributors.length,
                releases: releases.length,
                lastUpdate: new Date(repoInfo.updated_at),
                language: repoInfo.language,
                size: repoInfo.size
            };
        } catch (error) {
            console.warn('Failed to fetch repository stats:', error);
            return null;
        }
    }

    /**
     * Search issues with advanced filtering
     */
    async searchIssues(query, options = {}) {
        const { owner, repo } = this.getConfig();
        
        const searchQuery = `repo:${owner}/${repo} ${query}`;
        const params = new URLSearchParams({
            q: searchQuery,
            sort: options.sort || 'created',
            order: options.order || 'desc',
            per_page: options.per_page || 50,
            ...options
        });

        const endpoint = `/search/issues?${params}`;
        const result = await this.makeRequest(endpoint);
        
        return {
            total_count: result.total_count,
            items: result.items
        };
    }

    /**
     * Get issue comments
     */
    async getIssueComments(issueNumber) {
        const { owner, repo } = this.getConfig();
        return await this.makeRequest(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`);
    }

    /**
     * Get issue timeline
     */
    async getIssueTimeline(issueNumber) {
        const { owner, repo } = this.getConfig();
        return await this.makeRequest(`/repos/${owner}/${repo}/issues/${issueNumber}/timeline`);
    }

    /**
     * Get repository labels
     */
    async getLabels() {
        const { owner, repo } = this.getConfig();
        return await this.makeRequest(`/repos/${owner}/${repo}/labels`);
    }

    /**
     * Get commit activity for the repository
     */
    async getCommitActivity() {
        const { owner, repo } = this.getConfig();
        
        try {
            return await this.makeRequest(`/repos/${owner}/${repo}/stats/commit_activity`);
        } catch (error) {
            console.warn('Failed to fetch commit activity:', error);
            return [];
        }
    }

    /**
     * Validate configuration
     */
    validateConfig() {
        const config = this.getConfig();
        const errors = [];

        if (!config.owner) {
            errors.push('Repository owner is required');
        }

        if (!config.repo) {
            errors.push('Repository name is required');
        }

        if (!config.token) {
            errors.push('GitHub token is required');
        }

        if (!config.labels || !Array.isArray(config.labels) || config.labels.length === 0) {
            errors.push('At least one label must be specified');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

/**
 * Custom error class for GitHub API errors
 */
class GitHubAPIError extends Error {
    constructor(message, status, endpoint) {
        super(message);
        this.name = 'GitHubAPIError';
        this.status = status;
        this.endpoint = endpoint;
    }

    isAuthError() {
        return this.status === 401 || this.status === 403;
    }

    isRateLimitError() {
        return this.status === 403 && this.message.includes('rate limit');
    }

    isNotFoundError() {
        return this.status === 404;
    }
}

// Export classes
window.GitHubAPI = GitHubAPI;
window.GitHubAPIError = GitHubAPIError;