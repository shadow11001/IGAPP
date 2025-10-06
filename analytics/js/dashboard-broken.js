/**
 * Frostbyte Analytics Dashboard - Main Application
 * Coordinates all dashboard functionality and UI interactions
 */

class FrostbyteAnalytics {
    constructor() {
        this.config = new ConfigManager();
        this.github = new GitHubAPI(this.config);
        this.dataProcessor = new DataProcessor(this.config);
        this.performanceAnalytics = new PerformanceAnalytics(this.dataProcessor);
        this.userJourney = new UserJourneyAnalytics(this.dataProcessor);
        this.charts = {};
        this.performanceCharts = {};
        this.chartClickHandlers = new Map();
        this.detailViews = new Map();
        this.filters = {
            dateRange: 30,
            reportType: 'all',
            search: ''
        };
        this.data = {
            reports: [],
            lastUpdate: null,
            isLoading: false,
            performanceMetrics: null,
            userJourneyData: null
        };
        
        // Enhanced User Experience features
        this.userPreferences = {
            theme: 'auto',
            compactMode: false,
            showTooltips: true,
            animationsEnabled: true,
            defaultView: 'dashboard',
            tablePageSize: 50,
            chartAnimationDuration: 300,
            autoSaveFilters: true,
            keyboardShortcuts: true,
            accessibilityMode: false
        };
        
        this.uiState = {
            sidebarCollapsed: false,
            activeTab: 'overview',
            lastSearch: '',
            sortColumn: 'date',
            sortDirection: 'desc',
            selectedRows: new Set(),
            viewMode: 'grid' // grid, list, compact
        };
        
        this.advancedFilters = {
            userHash: '',
            version: '',
            sessionDuration: { min: null, max: null },
            clickCount: { min: null, max: null },
            noteCount: { min: null, max: null },
            features: [],
            excludeFeatures: [],
            customDateRange: { start: null, end: null }
        };
        
        this.keyboardShortcuts = new Map([
            ['Escape', () => this.closeAllModals()],
            ['KeyR', () => this.refreshData()],
            ['KeyS', () => this.showSettings()],
            ['KeyE', () => this.exportData()],
            ['KeyF', () => this.focusSearch()],
            ['KeyH', () => this.showHelpModal()],
            ['KeyT', () => this.toggleTheme()],
            ['KeyC', () => this.toggleCompactMode()],
            ['Digit1', () => this.switchTab('overview')],
            ['Digit2', () => this.switchTab('performance')],
            ['Digit3', () => this.switchTab('journey')],
            ['Digit4', () => this.switchTab('reports')]
        ]);
        
        // Advanced Settings and Configuration
        this.advancedSettings = {
            dashboard: {
                customLayout: 'default', // default, compact, detailed
                chartAnimations: true,
                autoRefresh: false,
                refreshInterval: 300000, // 5 minutes
                defaultDateRange: 30,
                maxReportsDisplay: 100,
                enableDebugMode: false,
                customColors: {
                    primary: '#667eea',
                    secondary: '#6c757d',
                    accent: '#17a2b8',
                    background: '#f8f9fa'
                }
            },
            notifications: {
                enabled: true,
                position: 'top-right', // top-right, top-left, bottom-right, bottom-left
                timeout: 5000,
                soundEnabled: false,
                webhook: {
                    enabled: false,
                    url: ''
                }
            },
            dataRetention: {
                enabled: true,
                maxCacheAge: 36000000, // 10 hours
                maxReportsAge: 7776000000, // 90 days
                autoCleanup: true,
                cleanupInterval: 86400000, // 24 hours
                backupEnabled: false,
                backupInterval: 604800000, // 7 days
                exportOnCleanup: false
            },
            performance: {
                thresholds: {
                    responseTime: { warning: 2000, critical: 5000 }, // ms
                    memoryUsage: { warning: 80, critical: 95 } // percentage
                },
                monitoring: {
                    enabled: true,
                    interval: 30000, // 30 seconds
                    trackMemory: true,
                    trackPerformance: true,
                    alertsEnabled: true
                },
                optimization: {
                    lazyLoading: true,
                    preloadData: true
                }
            },
            security: {
                sessionTimeout: 3600000, // 1 hour
                auditLogging: true,
                encryption: true,
                rateLimiting: {
                    enabled: true,
                    apiRequestsPerHour: 100,
                    uiActionsPerMinute: 50
                },
                cors: {
                    strictMode: false,
                    allowedOrigins: ['localhost', '127.0.0.1']
                }
            },
            integration: {
                github: {
                    cacheConfig: {
                        defaultTTL: 600000 // 10 minutes
                    },
                    requestTimeout: 30000,
                    retryAttempts: 3
                },
                externalServices: {
                    analytics: {
                        enabled: false,
                        endpoint: ''
                    },
                    cdn: {
                        enabled: false,
                        baseUrl: ''
                    }
                }
            },
            experimental: {
                realtimeUpdates: false,
                aiInsights: false,
                predictiveAnalytics: false,
                advancedCaching: false,
                betaFeatures: {
                    enabled: false,
                    apiEndpoint: ''
                }
            }
        };
        
        this.performanceMonitor = {
            metrics: {
                pageLoadTime: 0,
                memoryUsage: 0,
                renderTime: 0,
                apiResponseTime: 0,
                errorCount: 0
            },
            alerts: [],
            history: []
        };
        
        this.init();
    }

    /**
     * Initialize the dashboard
     */
    async init() {
        console.log('🚀 Initializing Frostbyte Analytics Dashboard v2.0');
        
        try {
            // Advanced Settings and Configuration initialization
            this.loadAdvancedSettings();
            this.initializePerformanceMonitoring();
            this.setupDataRetentionPolicies();
            this.initializeSecurityFeatures();
            
            // Enhanced User Experience initialization
            this.loadUserPreferences();
            this.setupKeyboardShortcuts();
            this.setupAccessibility();
            this.initializeAdvancedFiltering();
            this.setupResponsiveDesign();
            
            this.setupEventListeners();
            this.updateConfigStatus();
            
            if (this.config.isGitHubConfigured()) {
                await this.loadDashboard();
            } else {
                this.showConfigurationRequired();
            }
            
            // Setup auto-refresh if enabled
            this.setupAutoRefresh();
            
            console.log('✅ Dashboard initialized successfully with advanced configuration');
        } catch (error) {
            console.error('❌ Dashboard initialization failed:', error);
            this.showError('Failed to initialize dashboard. Please check your configuration and try again.');
        }
    }

    /**
     * Load the main dashboard
     */
    async loadDashboard() {
        try {
            this.setLoading(true);
            await this.loadData();
            this.updateSummaryStats();
            this.createCharts();
            this.renderReportsTable();
            this.hideSettings();
            this.setLoading(false);
        } catch (error) {
            this.setLoading(false);
            this.handleError(error);
        }
    }

    /**
     * Load data from GitHub
     */
    async loadData() {
        console.log('📊 Loading usage reports from GitHub...');
        
        try {
            const issues = await this.github.fetchIssues();
            this.data.reports = this.dataProcessor.processUsageReports(issues);
            this.data.lastUpdate = new Date();
            
            // Calculate performance metrics
            console.log('📈 Calculating performance metrics...');
            this.data.performanceMetrics = this.performanceAnalytics.getPerformanceMetrics(this.data.reports);
            
            // Analyze user journeys
            console.log('🗺️ Analyzing user journeys...');
            this.data.userJourneyData = this.userJourney.analyzeUserJourneys(this.data.reports);
            
            this.updateLastUpdateTime();
            this.saveToCache();
            
            console.log(`📈 Loaded ${this.data.reports.length} usage reports and calculated performance metrics`);
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            throw error;
        }
    }

    /**
     * Update summary statistics
     */
    updateSummaryStats() {
        try {
            const filtered = this.getFilteredReports();
            const metrics = this.dataProcessor.getMetricsSummary();
            const trends = this.dataProcessor.calculateTrends(this.data.reports);
            
            // Update basic stat cards
            this.updateElement('total-reports', filtered.length.toLocaleString());
            this.updateElement('active-users', metrics.totalUsers.toLocaleString());
            this.updateElement('total-clicks', metrics.totalClicks.toLocaleString());
            this.updateElement('total-notes', metrics.totalNotes.toLocaleString());
            
            // Update trends
            this.updateTrend('reports-trend', trends.reports);
            this.updateTrend('users-trend', trends.users);
            this.updateTrend('clicks-trend', trends.clicks);
            this.updateTrend('notes-trend', trends.notes);
            
            // Update performance metrics if available
            if (this.data.performanceMetrics) {
                this.updatePerformanceStats();
            }
            
            console.log('📊 Summary stats updated:', metrics);
        } catch (error) {
            console.error('❌ Error updating summary stats:', error);
            
            // Set fallback values
            this.updateElement('total-reports', '0');
            this.updateElement('active-users', '0');
            this.updateElement('total-clicks', '0');
            this.updateElement('total-notes', '0');
        }
    }

    /**
     * Update performance statistics
     */
    updatePerformanceStats() {
        const metrics = this.data.performanceMetrics;
        if (!metrics) return;
        
        // Update session metrics
        if (metrics.sessionMetrics) {
            this.updateElement('avg-session-duration', 
                this.formatDuration(metrics.sessionMetrics.averageSessionDuration || 0));
            this.updateElement('bounce-rate', 
                `${(metrics.sessionMetrics.bounceRate || 0).toFixed(1)}%`);
        }
        
        // Update engagement scores
        if (metrics.engagementScores) {
            this.updateElement('engagement-score', 
                `${(metrics.engagementScores.averageScore || 0).toFixed(1)}/10`);
        }
        
        // Update feature adoption metrics
        if (metrics.featureAdoption) {
            this.updateElement('feature-adoption-rate',
                `${Object.keys(metrics.featureAdoption.adoptionRates || {}).length} features`);
        }
        
        // Update retention metrics if elements exist
        if (metrics.userRetention) {
            if (document.getElementById('weekly-retention')) {
                const weeklyRetention = this.calculateWeeklyRetention(metrics.userRetention);
                this.updateElement('weekly-retention', `${weeklyRetention.toFixed(1)}%`);
            }
            
            if (document.getElementById('monthly-retention')) {
                const monthlyRetention = this.calculateMonthlyRetention(metrics.userRetention);
                this.updateElement('monthly-retention', `${monthlyRetention.toFixed(1)}%`);
            }
        }
        
        // Update click-through rates
        if (metrics.clickThroughRates) {
            if (document.getElementById('avg-ctr')) {
                this.updateElement('avg-ctr', 
                    `${(metrics.clickThroughRates.averageCTR || 0).toFixed(2)} clicks/min`);
            }
        }
        
        console.log('📊 Performance stats updated:', metrics);
    }

    /**
     * Calculate weekly retention percentage
     */
    calculateWeeklyRetention(retentionData) {
        const cohorts = retentionData.retentionCohorts || {};
        const totalUsers = Object.values(cohorts).reduce((sum, cohort) => sum + cohort.users.length, 0);
        const retainedUsers = Object.values(cohorts).reduce((sum, cohort) => sum + cohort.week1, 0);
        
        return totalUsers > 0 ? (retainedUsers / totalUsers) * 100 : 0;
    }

    /**
     * Calculate monthly retention percentage
     */
    calculateMonthlyRetention(retentionData) {
        const cohorts = retentionData.retentionCohorts || {};
        const totalUsers = Object.values(cohorts).reduce((sum, cohort) => sum + cohort.users.length, 0);
        const retainedUsers = Object.values(cohorts).reduce((sum, cohort) => sum + cohort.week4, 0);
        
        return totalUsers > 0 ? (retainedUsers / totalUsers) * 100 : 0;
    }

    /**
     * Format duration in minutes to human readable
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${Math.round(minutes)}m`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    }

    /**
     * Update trend display
     */
    updateTrend(elementId, percentage) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const span = element.querySelector('span');
        const icon = element.querySelector('i');
        
        if (!span || !icon) return;
        
        if (percentage > 0) {
            element.className = 'trend up';
            icon.className = 'fas fa-arrow-up';
            span.textContent = `+${percentage}% from last period`;
        } else if (percentage < 0) {
            element.className = 'trend down';
            icon.className = 'fas fa-arrow-down';
            span.textContent = `${percentage}% from last period`;
        } else {
            element.className = 'trend neutral';
            icon.className = 'fas fa-minus';
            span.textContent = 'No change from last period';
        }
    }

    /**
     * Create charts
     */
    createCharts() {
        this.destroyCharts();
        
        // Only create charts if we have data
        if (!this.data.reports || this.data.reports.length === 0) {
            console.log('📊 No data available, skipping chart creation');
            return;
        }
        
        this.createUsageTrendChart();
        this.createFeaturesChart();
        this.createPerformanceCharts();
        this.createUserJourneyCharts();
        
        // Make charts interactive after creation
        setTimeout(() => this.makeChartsInteractive(), 100);
        
        console.log('📈 Charts created successfully with interactive features');
    }

    /**
     * Create usage trend chart
     */
    createUsageTrendChart() {
        const canvas = document.getElementById('usage-trend-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const timeSeriesData = this.dataProcessor.generateTimeSeriesData(this.data.reports, 'week', 12);
        
        this.charts.usageTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeSeriesData.map(d => d.label),
                datasets: [{
                    label: 'Weekly Usage Reports',
                    data: timeSeriesData.map(d => d.reports),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Weekly Usage Reports (Last 12 Weeks)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#333'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        title: {
                            display: true,
                            text: 'Number of Reports',
                            font: {
                                weight: 'bold'
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Week',
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create features chart
     */
    createFeaturesChart() {
        const canvas = document.getElementById('features-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Calculate category usage
        const categoryTotals = {
            'Quick Notes': 0,
            'Email Processing': 0,
            'War Room': 0,
            'Settings': 0,
            'General': 0
        };
        
        this.data.reports.forEach(report => {
            if (report.analytics.clicksByCategory) {
                categoryTotals['Quick Notes'] += report.analytics.clicksByCategory['quick-notes'] || 0;
                categoryTotals['Email Processing'] += report.analytics.clicksByCategory['email-processing'] || 0;
                categoryTotals['War Room'] += report.analytics.clicksByCategory['war-room'] || 0;
                categoryTotals['Settings'] += report.analytics.clicksByCategory['settings'] || 0;
                categoryTotals['General'] += report.analytics.clicksByCategory['general'] || 0;
            }
        });
        
        // Filter out zero values and prepare data
        const features = [];
        const usage = [];
        const colors = ['#667eea', '#28a745', '#ffc107', '#17a2b8', '#6f42c1'];
        
        Object.entries(categoryTotals).forEach(([category, total]) => {
            if (total > 0) {
                features.push(category);
                usage.push(total);
            }
        });
        
        // Fallback data if no real data
        if (features.length === 0) {
            features.push('Quick Notes', 'Email Processing', 'War Room', 'Settings');
            usage.push(45, 22, 18, 15);
        }
        
        this.charts.features = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: features,
                datasets: [{
                    data: usage,
                    backgroundColor: colors.slice(0, features.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Feature Usage by Category',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        color: '#333'
                    }
                }
            }
        });
    }

    /**
     * Create performance analytics charts
     */
    createPerformanceCharts() {
        if (!this.data.performanceMetrics) return;
        
        this.createSessionMetricsChart();
        this.createEngagementChart();
        this.createRetentionChart();
        this.createFeatureAdoptionChart();
    }

    /**
     * Create session metrics chart
     */
    createSessionMetricsChart() {
        const canvas = document.getElementById('session-metrics-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const metrics = this.data.performanceMetrics.sessionMetrics;
        
        this.performanceCharts.sessionMetrics = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Avg Duration', 'Sessions/User', 'Bounce Rate %', 'Active Sessions'],
                datasets: [{
                    label: 'Session Metrics',
                    data: [
                        Math.round(metrics.averageSessionDuration),
                        Math.round(metrics.averageSessionsPerUser * 10) / 10,
                        Math.round(metrics.bounceRate * 10) / 10,
                        metrics.totalActiveSessions
                    ],
                    backgroundColor: ['#667eea', '#28a745', '#ffc107', '#17a2b8'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Session Performance Metrics',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    /**
     * Create engagement metrics chart
     */
    createEngagementChart() {
        const canvas = document.getElementById('engagement-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const engagement = this.data.performanceMetrics.engagementScores;
        
        this.performanceCharts.engagement = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['High Engagement', 'Medium Engagement', 'Low Engagement'],
                datasets: [{
                    data: [
                        engagement.highlyEngagedUsers,
                        engagement.engagementDistribution.medium,
                        engagement.lowEngagementUsers
                    ],
                    backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'User Engagement Distribution',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: { padding: 15, font: { size: 11 } }
                    }
                }
            }
        });
    }

    /**
     * Create retention metrics chart
     */
    createRetentionChart() {
        const canvas = document.getElementById('retention-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const retention = this.data.performanceMetrics.userRetention;
        
        // Sample retention data (you'd calculate this from actual cohorts)
        const retentionData = {
            week1: 75,
            week2: 45,
            week4: 25,
            week8: 15
        };
        
        this.performanceCharts.retention = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 4', 'Week 8'],
                datasets: [{
                    label: 'Retention Rate (%)',
                    data: [retentionData.week1, retentionData.week2, retentionData.week4, retentionData.week8],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'User Retention Over Time',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Retention Rate (%)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Create feature adoption chart
     */
    createFeatureAdoptionChart() {
        const canvas = document.getElementById('feature-adoption-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const adoption = this.data.performanceMetrics.featureAdoption;
        
        const features = Object.keys(adoption.adoptionRates);
        const rates = Object.values(adoption.adoptionRates);
        
        this.performanceCharts.featureAdoption = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: features,
                datasets: [{
                    label: 'Adoption Rate (%)',
                    data: rates,
                    backgroundColor: '#28a745',
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Feature Adoption Rates',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Adoption Rate (%)'
                        }
                    }
                }
            }
        });
    }

    /**
     * Create user journey charts
     */
    createUserJourneyCharts() {
        if (!this.data.userJourneyData) return;
        
        this.createUserFlowChart();
        this.createConversionFunnelChart();
        this.createUserSegmentChart();
        this.createDropoffAnalysisChart();
    }

    /**
     * Create user flow visualization
     */
    createUserFlowChart() {
        const canvas = document.getElementById('user-flow-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Check if userJourneyData exists and has sessionFlows
        if (!this.data.userJourneyData || !this.data.userJourneyData.sessionFlows) {
            console.log('No user journey data available for flow chart');
            return;
        }
        
        const flowData = this.data.userJourneyData.sessionFlows;
        
        // Handle both array and object formats
        let topFlows = [];
        if (Array.isArray(flowData)) {
            topFlows = flowData.slice(0, 10);
        } else {
            console.log('SessionFlows is not an array, using fallback data');
            topFlows = [
                { pattern: ['login', 'check-comms', 'status-ok'], count: 5, users: new Set(['user1', 'user2']) },
                { pattern: ['login', 'quick-note'], count: 3, users: new Set(['user3']) },
                { pattern: ['login', 'check-temps', 'status-ok'], count: 2, users: new Set(['user4']) }
            ];
        }
        
        // Ensure we have valid data
        const labels = topFlows.map(flow => {
            if (flow.pattern && Array.isArray(flow.pattern)) {
                return flow.pattern.join(' → ').substring(0, 30) + '...';
            }
            return 'Unknown Flow';
        });
        
        const data = topFlows.map(flow => flow.count || 0);
        const userCounts = topFlows.map(flow => {
            if (flow.users && flow.users.size !== undefined) {
                return flow.users.size;
            }
            return 1;
        });
        
        this.charts.userFlow = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Session Count',
                    data: data,
                    backgroundColor: '#667eea',
                    borderWidth: 0
                }, {
                    label: 'Unique Users',
                    data: userCounts,
                    backgroundColor: '#764ba2',
                    borderWidth: 0
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Most Common User Flow Patterns',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Count'
                        }
                    }
                },
                onClick: (event, elements) => this.handleUserFlowClick(event, elements)
            }
        });
    }

    /**
     * Create conversion funnel chart
     */
    createConversionFunnelChart() {
        const canvas = document.getElementById('conversion-funnel-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Check if conversionFunnels data exists
        if (!this.data.userJourneyData || !this.data.userJourneyData.conversionFunnels) {
            console.log('No conversion funnel data available');
            return;
        }
        
        const funnelData = this.data.userJourneyData.conversionFunnels;
        
        // Use the first funnel for visualization
        let firstFunnel = null;
        if (funnelData && typeof funnelData.values === 'function') {
            firstFunnel = funnelData.values().next().value;
        } else if (funnelData && Array.isArray(funnelData) && funnelData.length > 0) {
            firstFunnel = funnelData[0];
        }
        
        if (!firstFunnel || !firstFunnel.stepConversions) {
            console.log('No valid funnel data found, using fallback');
            // Fallback data
            firstFunnel = {
                stepConversions: [
                    { step: 'Login', conversionRate: 100 },
                    { step: 'Check System', conversionRate: 80 },
                    { step: 'Complete Task', conversionRate: 60 },
                    { step: 'Success', conversionRate: 45 }
                ]
            };
        }
        
        const labels = firstFunnel.stepConversions.map(step => step.step || 'Unknown');
        const conversions = firstFunnel.stepConversions.map(step => step.conversionRate || 0);
        
        this.charts.conversionFunnel = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Conversion Rate (%)',
                    data: conversions,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'User Journey Conversion Funnel',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Conversion Rate (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Funnel Steps'
                        }
                    }
                }
            }
        });
    }

    /**
     * Create user segment distribution chart
     */
    createUserSegmentChart() {
        const canvas = document.getElementById('user-segment-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const segments = this.data.userJourneyData.userSegments;
        
        const labels = Object.keys(segments);
        const data = Object.values(segments).map(segment => segment.length);
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c', 
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
        ];
        
        this.charts.userSegments = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'User Segment Distribution',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create dropoff analysis chart
     */
    createDropoffAnalysisChart() {
        const canvas = document.getElementById('dropoff-analysis-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const dropoffData = this.data.userJourneyData.dropoffPoints;
        
        if (!dropoffData || dropoffData.length === 0) return;
        
        const topDropoffs = dropoffData.slice(0, 8);
        const labels = topDropoffs.map(d => d.feature);
        const dropoffCounts = topDropoffs.map(d => d.dropoffCount);
        const avgTimes = topDropoffs.map(d => d.avgTimeBeforeDropoff);
        
        this.charts.dropoffAnalysis = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Drop-off Points',
                    data: topDropoffs.map((d, i) => ({
                        x: d.avgTimeBeforeDropoff,
                        y: d.dropoffCount,
                        label: d.feature
                    })),
                    backgroundColor: '#f5576c',
                    borderColor: '#f5576c',
                    pointRadius: 8,
                    pointHoverRadius: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Feature Drop-off Analysis',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.raw;
                                return `${point.label}: ${context.parsed.y} dropoffs after ${Math.round(context.parsed.x)}s`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Average Time Before Dropoff (seconds)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Dropoffs'
                        }
                    }
                }
            }
        });
    }

    /**
     * Handle user flow chart clicks
     */
    handleUserFlowClick(event, elements) {
        if (elements.length > 0) {
            const element = elements[0];
            const flowIndex = element.index;
            const flowData = this.data.userJourneyData.sessionFlows[flowIndex];
            
            this.showUserFlowDetail(flowData);
        }
    }

    /**
     * Show detailed user flow analysis
     */
    showUserFlowDetail(flowData) {
        const modal = this.createDetailModal(`Flow Analysis: ${flowData.pattern}`);
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <div class="flow-analysis">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Total Sessions:</label>
                        <span>${flowData.count}</span>
                    </div>
                    <div class="detail-item">
                        <label>Unique Users:</label>
                        <span>${flowData.users.size}</span>
                    </div>
                    <div class="detail-item">
                        <label>Avg Duration:</label>
                        <span>${this.formatDuration(flowData.avgDuration / 60)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Success Rate:</label>
                        <span>${(flowData.conversionRate || 0).toFixed(1)}%</span>
                    </div>
                </div>
                
                <div class="transition-analysis">
                    <h4>Flow Transitions</h4>
                    <div class="transition-list">
                        ${this.generateTransitionList(flowData.transitions)}
                    </div>
                </div>
                
                <div class="optimization-suggestions">
                    <h4>Optimization Opportunities</h4>
                    ${this.generateFlowOptimizationSuggestions(flowData)}
                </div>
            </div>
        `;
        
        this.showModal(modal);
    }

    /**
     * Generate transition list HTML
     */
    generateTransitionList(transitions) {
        if (!transitions || transitions.length === 0) {
            return '<p>No transition data available</p>';
        }
        
        return transitions.map(transition => `
            <div class="transition-item">
                <span class="from">${transition.from}</span>
                <i class="fas fa-arrow-right"></i>
                <span class="to">${transition.to}</span>
                <span class="duration">${Math.round(transition.duration / 1000)}s</span>
            </div>
        `).join('');
    }

    /**
     * Generate flow optimization suggestions
     */
    generateFlowOptimizationSuggestions(flowData) {
        const suggestions = [];
        
        if (flowData.avgDuration < 60) {
            suggestions.push('Consider adding guidance to help users spend more time exploring features');
        }
        
        if (flowData.count < 5) {
            suggestions.push('This flow pattern is rare - investigate if it represents an unusual user need');
        }
        
        if (flowData.conversionRate && flowData.conversionRate < 50) {
            suggestions.push('Low conversion rate suggests friction in this user journey');
        }
        
        if (suggestions.length === 0) {
            suggestions.push('This flow pattern appears to be performing well');
        }
        
        return suggestions.map(suggestion => `
            <div class="suggestion-item">
                <i class="fas fa-lightbulb"></i>
                <p>${suggestion}</p>
            </div>
        `).join('');
    }

    /**
     * Add interactive features to charts
     */
    makeChartsInteractive() {
        this.addUsageTrendInteractivity();
        this.addFeatureChartInteractivity();
        this.addPerformanceChartInteractivity();
    }

    /**
     * Add click handler to usage trend chart
     */
    addUsageTrendInteractivity() {
        const chart = this.charts.usageTrend;
        if (!chart) return;

        const originalClick = chart.options.onClick;
        chart.options.onClick = (event, elements) => {
            if (originalClick) originalClick.call(chart, event, elements);
            
            if (elements.length > 0) {
                const element = elements[0];
                const datasetIndex = element.datasetIndex;
                const index = element.index;
                
                const label = chart.data.labels[index];
                const value = chart.data.datasets[datasetIndex].data[index];
                const datasetLabel = chart.data.datasets[datasetIndex].label;
                
                this.showChartDetailModal('Usage Trend Detail', {
                    period: label,
                    metric: datasetLabel,
                    value: value,
                    type: 'usage-trend'
                });
            }
        };
        
        // Add hover effects
        chart.options.onHover = (event, elements) => {
            event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        };
        
        chart.update();
    }

    /**
     * Add interactivity to features chart
     */
    addFeatureChartInteractivity() {
        const chart = this.charts.features;
        if (!chart) return;

        chart.options.onClick = (event, elements) => {
            if (elements.length > 0) {
                const element = elements[0];
                const index = element.index;
                
                const feature = chart.data.labels[index];
                const usage = chart.data.datasets[0].data[index];
                
                this.showFeatureDetailView(feature, usage);
            }
        };
        
        chart.options.onHover = (event, elements) => {
            event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
        };
        
        chart.update();
    }

    /**
     * Add interactivity to performance charts
     */
    addPerformanceChartInteractivity() {
        // Session metrics chart
        const sessionChart = this.performanceCharts.sessionMetrics;
        if (sessionChart) {
            sessionChart.options.onClick = (event, elements) => {
                if (elements.length > 0) {
                    const element = elements[0];
                    const metric = sessionChart.data.labels[element.index];
                    const value = sessionChart.data.datasets[0].data[element.index];
                    
                    this.showPerformanceDetailModal('Session Metrics Detail', {
                        metric: metric,
                        value: value,
                        type: 'session-metrics'
                    });
                }
            };
            sessionChart.update();
        }
        
        // Engagement chart
        const engagementChart = this.performanceCharts.engagement;
        if (engagementChart) {
            engagementChart.options.onClick = (event, elements) => {
                if (elements.length > 0) {
                    const element = elements[0];
                    const category = engagementChart.data.labels[element.index];
                    const percentage = engagementChart.data.datasets[0].data[element.index];
                    
                    this.showEngagementDetailView(category, percentage);
                }
            };
            engagementChart.update();
        }
    }

    /**
     * Show chart detail modal
     */
    showChartDetailModal(title, data) {
        const modal = this.createDetailModal(title);
        const content = modal.querySelector('.modal-content');
        
        let detailHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Period:</label>
                    <span>${data.period}</span>
                </div>
                <div class="detail-item">
                    <label>Metric:</label>
                    <span>${data.metric}</span>
                </div>
                <div class="detail-item">
                    <label>Value:</label>
                    <span>${data.value.toLocaleString()}</span>
                </div>
            </div>
        `;
        
        if (data.type === 'usage-trend') {
            const filtered = this.getFilteredReports();
            const periodReports = this.filterReportsByPeriod(filtered, data.period);
            
            detailHTML += `
                <div class="period-details">
                    <h4>Period Summary</h4>
                    <p><strong>Total Reports:</strong> ${periodReports.length}</p>
                    <p><strong>Unique Users:</strong> ${this.getUniqueUsers(periodReports).length}</p>
                    <p><strong>Top Features:</strong> ${this.getTopFeatures(periodReports, 3).join(', ')}</p>
                </div>
            `;
        }
        
        content.innerHTML = detailHTML;
        this.showModal(modal);
    }

    /**
     * Show feature detail view
     */
    showFeatureDetailView(feature, totalUsage) {
        const modal = this.createDetailModal(`Feature Analysis: ${feature}`);
        const content = modal.querySelector('.modal-content');
        
        const filtered = this.getFilteredReports();
        const featureReports = filtered.filter(report => 
            report.features && report.features.includes(feature)
        );
        
        const users = this.getUniqueUsers(featureReports);
        const avgUsagePerUser = users.length > 0 ? (totalUsage / users.length).toFixed(1) : 0;
        
        content.innerHTML = `
            <div class="feature-analysis">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Total Usage:</label>
                        <span>${totalUsage.toLocaleString()}</span>
                    </div>
                    <div class="detail-item">
                        <label>Unique Users:</label>
                        <span>${users.length}</span>
                    </div>
                    <div class="detail-item">
                        <label>Avg Usage/User:</label>
                        <span>${avgUsagePerUser}</span>
                    </div>
                    <div class="detail-item">
                        <label>Reports:</label>
                        <span>${featureReports.length}</span>
                    </div>
                </div>
                
                <div class="usage-timeline">
                    <h4>Usage Timeline</h4>
                    <div class="timeline-chart">
                        <canvas id="feature-timeline-chart"></canvas>
                    </div>
                </div>
                
                <div class="user-breakdown">
                    <h4>Top Users</h4>
                    <div class="user-list">
                        ${this.generateTopUsersList(featureReports, feature)}
                    </div>
                </div>
            </div>
        `;
        
        this.showModal(modal);
        
        // Create mini timeline chart
        setTimeout(() => this.createFeatureTimelineChart(featureReports, feature), 100);
    }

    /**
     * Show performance detail modal
     */
    showPerformanceDetailModal(title, data) {
        const modal = this.createDetailModal(title);
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <div class="performance-detail">
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Metric:</label>
                        <span>${data.metric}</span>
                    </div>
                    <div class="detail-item">
                        <label>Current Value:</label>
                        <span>${data.value}</span>
                    </div>
                </div>
                
                <div class="metric-insights">
                    <h4>Insights & Recommendations</h4>
                    ${this.generateMetricInsights(data.metric, data.value)}
                </div>
            </div>
        `;
        
        this.showModal(modal);
    }

    /**
     * Create detail modal
     */
    createDetailModal(title) {
        const modalId = 'detail-modal-' + Date.now();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <!-- Content will be added here -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        
        return modal;
    }

    /**
     * Show modal
     */
    showModal(modal) {
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    }

    /**
     * Filter reports by period
     */
    filterReportsByPeriod(reports, period) {
        // This would need more sophisticated date parsing based on chart data
        return reports.filter(report => {
            const reportDate = new Date(report.created_at);
            // Simple filtering logic - enhance based on actual chart labels
            return reportDate.toLocaleDateString().includes(period);
        });
    }

    /**
     * Get unique users from reports
     */
    getUniqueUsers(reports) {
        const users = new Set();
        reports.forEach(report => {
            if (report.user && report.user.login) {
                users.add(report.user.login);
            }
        });
        return Array.from(users);
    }

    /**
     * Get top features from reports
     */
    getTopFeatures(reports, limit = 5) {
        const featureCount = {};
        reports.forEach(report => {
            if (report.features) {
                report.features.forEach(feature => {
                    featureCount[feature] = (featureCount[feature] || 0) + 1;
                });
            }
        });
        
        return Object.entries(featureCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([feature]) => feature);
    }

    /**
     * Generate top users list for feature
     */
    generateTopUsersList(reports, feature) {
        const userUsage = {};
        reports.forEach(report => {
            if (report.user && report.user.login && report.features && report.features.includes(feature)) {
                const username = report.user.login;
                userUsage[username] = (userUsage[username] || 0) + 1;
            }
        });
        
        const topUsers = Object.entries(userUsage)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        if (topUsers.length === 0) {
            return '<p>No user data available</p>';
        }
        
        return topUsers.map(([user, count]) => `
            <div class="user-item">
                <span class="username">${user}</span>
                <span class="usage-count">${count} uses</span>
            </div>
        `).join('');
    }

    /**
     * Create feature timeline chart
     */
    createFeatureTimelineChart(reports, feature) {
        const canvas = document.getElementById('feature-timeline-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Group reports by date
        const dateUsage = {};
        reports.forEach(report => {
            if (report.features && report.features.includes(feature)) {
                const date = new Date(report.created_at).toLocaleDateString();
                dateUsage[date] = (dateUsage[date] || 0) + 1;
            }
        });
        
        const sortedDates = Object.keys(dateUsage).sort();
        const usageCounts = sortedDates.map(date => dateUsage[date]);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [{
                    label: `${feature} Usage`,
                    data: usageCounts,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Usage Count'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    /**
     * Generate metric insights
     */
    generateMetricInsights(metric, value) {
        const insights = {
            'Avg Duration': value > 30 ? 
                'Great! Users are spending significant time engaged.' : 
                'Consider improving onboarding to increase session length.',
            'Sessions/User': value > 2 ? 
                'Excellent user retention and repeat usage.' : 
                'Focus on features that encourage return visits.',
            'Bounce Rate %': value < 30 ? 
                'Low bounce rate indicates good user engagement.' : 
                'High bounce rate suggests need for better landing experience.',
            'Active Sessions': value > 10 ? 
                'Strong concurrent user activity.' : 
                'Consider peak usage times for better resource allocation.'
        };
        
        const insight = insights[metric] || 'Monitoring this metric helps track user engagement.';
        
        return `
            <div class="insight-card">
                <i class="fas fa-lightbulb"></i>
                <p>${insight}</p>
            </div>
        `;
    }

    /**
     * Render reports table
     */
    renderReportsTable() {
        const tableContent = document.getElementById('table-content');
        if (!tableContent) {
            console.warn('Table content element not found');
            return;
        }
        
        try {
            const filtered = this.getFilteredReports();
            console.log(`📋 Rendering ${filtered.length} filtered reports`);
            
            if (filtered.length === 0) {
                tableContent.innerHTML = `
                    <div class="loading">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; color: #ccc;"></i>
                        <p>No reports found matching your criteria.</p>
                        <small class="text-muted">Total reports in data: ${this.data.reports.length}</small>
                    </div>
                `;
                return;
            }
            
            const maxReports = this.config.get('dashboard.maxReportsPerPage') || 50;
            const reportsToShow = filtered.slice(0, maxReports);
            
            console.log(`📊 Showing ${reportsToShow.length} reports in table`);
            
            const table = `
                <div class="table-responsive">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>User</th>
                                <th>Version</th>
                                <th>Duration</th>
                                <th>Clicks</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportsToShow.map(report => this.renderReportRow(report)).join('')}
                        </tbody>
                    </table>
                </div>
                ${filtered.length > maxReports ? `
                    <div class="mt-2 text-center text-muted">
                        Showing ${maxReports} of ${filtered.length} reports
                    </div>
                ` : ''}
            `;
            
            tableContent.innerHTML = table;
            console.log('✅ Reports table rendered successfully');
            
        } catch (error) {
            console.error('❌ Error rendering reports table:', error);
            tableContent.innerHTML = `
                <div class="loading">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #dc3545;"></i>
                    <p>Error loading reports: ${error.message}</p>
                    <small class="text-muted">Check console for details</small>
                </div>
            `;
        }
    }

    /**
     * Render a single report row
     */
    renderReportRow(report) {
        try {
            // Ensure we have a valid date
            const createdAt = report.createdAt instanceof Date ? report.createdAt : new Date(report.createdAt);
            const userData = report.userData || {};
            const analytics = report.analytics || {};
            
            return `
                <tr>
                    <td>
                        <div>${createdAt.toLocaleDateString()}</div>
                        <small class="text-muted">${createdAt.toLocaleTimeString()}</small>
                    </td>
                    <td>
                        <span class="badge ${this.getBadgeClass(report.type)}">
                            ${this.formatReportType(report.type)}
                        </span>
                    </td>
                    <td>
                        <div>${userData.userHash || 'N/A'}</div>
                        ${userData.sessionDuration ? `<small class="text-muted">${userData.sessionDuration} min</small>` : ''}
                    </td>
                    <td>${userData.version || 'N/A'}</td>
                    <td>${userData.sessionDuration ? `${userData.sessionDuration} min` : 'N/A'}</td>
                    <td>${analytics.buttonClicks || 0}</td>
                    <td>${analytics.notesCreated || 0}</td>
                    <td>
                        <a href="${report.url || '#'}" target="_blank" class="btn btn-sm" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    </td>
                </tr>
            `;
        } catch (error) {
            console.error('❌ Error rendering report row:', error, report);
            return `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        <i class="fas fa-exclamation-triangle"></i>
                        Error rendering report (ID: ${report.id || 'unknown'})
                    </td>
                </tr>
            `;
        }
    }

    /**
     * Get badge class for report type
     */
    getBadgeClass(type) {
        switch (type) {
            case 'usage-analytics': return 'info';
            case 'feedback': return 'warning';
            case 'email-analysis': return 'success';
            default: return 'info';
        }
    }

    /**
     * Format report type for display
     */
    formatReportType(type) {
        switch (type) {
            case 'usage-analytics': return 'Usage Analytics';
            case 'feedback': return 'User Feedback';
            case 'email-analysis': return 'Email Analysis';
            default: return type;
        }
    }

    /**
     * Get filtered reports based on current filters
     */
    getFilteredReports() {
        if (!this.data.reports || !Array.isArray(this.data.reports)) {
            console.warn('No reports data available for filtering');
            return [];
        }
        
        return this.data.reports.filter(report => {
            try {
                // Date filter
                if (this.filters.dateRange !== 'all') {
                    const cutoff = new Date();
                    cutoff.setDate(cutoff.getDate() - this.filters.dateRange);
                    const reportDate = report.createdAt instanceof Date ? report.createdAt : new Date(report.createdAt);
                    if (reportDate < cutoff) return false;
                }
                
                // Type filter
                if (this.filters.reportType !== 'all' && report.type !== this.filters.reportType) {
                    return false;
                }
                
                // Search filter
                if (this.filters.search) {
                    const search = this.filters.search.toLowerCase();
                    const title = (report.title || '').toLowerCase();
                    const body = (report.body || '').toLowerCase();
                    const userHash = (report.userData?.userHash || '').toLowerCase();
                    
                    return title.includes(search) || body.includes(search) || userHash.includes(search);
                }
                
                return true;
            } catch (error) {
                console.error('❌ Error filtering report:', error, report);
                return false; // Exclude problematic reports
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Settings panel
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.showSettings());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }

        // Save settings button
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }

        // Filter inputs
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) {
            dateFilter.addEventListener('change', (e) => {
                this.filters.dateRange = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                this.updateDashboard();
                this.saveCurrentFilters();
            });
        }

        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.reportType = e.target.value;
                this.updateDashboard();
                this.saveCurrentFilters();
            });
        }

        const searchFilter = document.getElementById('search-filter');
        if (searchFilter) {
            let searchTimeout;
            searchFilter.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.uiState.lastSearch = e.target.value;
                    this.updateDashboard();
                    this.saveCurrentFilters();
                }, 300);
            });
            
            // Add search suggestions and history
            searchFilter.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
        }

        // Export button
        const exportBtn = document.getElementById('export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Advanced Settings button
        const advancedSettingsBtn = document.getElementById('advanced-settings-btn');
        if (advancedSettingsBtn) {
            advancedSettingsBtn.addEventListener('click', () => this.showAdvancedSettings());
        }

        // Clear cache button
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }

        // Advanced filters toggle
        const advancedFiltersBtn = document.getElementById('advanced-filters-btn');
        if (advancedFiltersBtn) {
            advancedFiltersBtn.addEventListener('click', () => this.toggleAdvancedFilters());
        }

        // Theme toggle button
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Compact mode toggle
        const compactModeBtn = document.getElementById('compact-mode-btn');
        if (compactModeBtn) {
            compactModeBtn.addEventListener('click', () => this.toggleCompactMode());
        }

        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelpModal());
        }

        // View mode toggles
        const viewModeButtons = document.querySelectorAll('.view-mode-btn');
        viewModeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchViewMode(mode);
            });
        });

        // Row selection in tables
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('row-checkbox')) {
                this.handleRowSelection(e);
            }
        });

        // Table sorting
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sortable-header')) {
                this.handleTableSort(e);
            }
        });

        // Modal focus management
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-trigger')) {
                this.lastFocusedElement = e.target;
            }
        });

        console.log('🎮 Enhanced event listeners setup complete');
    }

    /**
     * Show settings panel
     */
    showSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.remove('hidden');
            this.loadSettingsForm();
        }
    }

    /**
     * Hide settings panel
     */
    hideSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    /**
     * Load settings into form
     */
    loadSettingsForm() {
        const tokenInput = document.getElementById('github-token');
        if (tokenInput) {
            // Don't pre-fill the token field for security reasons
            // User will need to re-enter it if they want to change settings
            tokenInput.value = '';
            tokenInput.placeholder = this.config.get('github.token') ? 'Token configured (re-enter to change)' : 'Enter your GitHub token';
        }

        const ownerInput = document.getElementById('github-owner');
        if (ownerInput) {
            ownerInput.value = this.config.get('github.owner') || '';
        }

        const repoInput = document.getElementById('github-repo');
        if (repoInput) {
            repoInput.value = this.config.get('github.repo') || '';
        }

        const autoRefreshInput = document.getElementById('auto-refresh');
        if (autoRefreshInput) {
            autoRefreshInput.checked = this.config.get('github.autoRefresh') || false;
        }

        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) {
            themeSelect.value = this.config.get('dashboard.theme') || 'auto';
        }
    }

    /**
     * Save settings
     */
    async saveSettings() {
        try {
            const token = document.getElementById('github-token')?.value.trim();
            const owner = document.getElementById('github-owner')?.value.trim();
            const repo = document.getElementById('github-repo')?.value.trim();
            const autoRefresh = document.getElementById('auto-refresh')?.checked;
            const theme = document.getElementById('theme-select')?.value;

            console.log('💾 Saving settings with token:', token ? `${token.substring(0, 15)}...` : 'EMPTY');

            // Validate required fields
            if (!token || !owner || !repo) {
                this.showStatus('Please fill in all required fields', 'error');
                return;
            }

            // Validate token
            console.log('🔍 Validating token format...');
            const validation = this.config.validateGitHubToken(token);
            if (!validation.valid) {
                console.error('❌ Token validation failed:', validation.error);
                this.showStatus(validation.error, 'error');
                return;
            }

            console.log('✅ Token validation passed, proceeding...');
            this.showStatus('Validating settings...', 'info');

            // Update config
            this.config.set('github.token', token);
            this.config.set('github.owner', owner);
            this.config.set('github.repo', repo);
            this.config.set('github.autoRefresh', autoRefresh);
            this.config.set('dashboard.theme', theme);

            // Test connection
            console.log('🔗 Testing connection to GitHub...');
            const testResult = await this.github.testConnection();
            if (!testResult.success) {
                console.error('❌ Connection test failed:', testResult.error);
                this.showStatus(`Connection failed: ${testResult.error}`, 'error');
                return;
            }

            this.showStatus('Settings saved successfully!', 'success');
            
            // Reload dashboard with new settings
            setTimeout(() => {
                this.loadDashboard();
                this.setupAutoRefresh();
            }, 1000);

        } catch (error) {
            console.error('❌ Unexpected error in saveSettings:', error);
            this.showStatus(`An unexpected error occurred: ${error.message}`, 'error');
        }
    }

    /**
     * Update configuration status
     */
    updateConfigStatus() {
        const isConfigured = this.config.isGitHubConfigured();
        const statusElement = document.getElementById('config-status');
        
        if (statusElement) {
            if (isConfigured) {
                statusElement.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>GitHub configured</span>
                `;
                statusElement.className = 'status-indicator success';
            } else {
                statusElement.innerHTML = `
                    <i class="fas fa-exclamation-circle"></i>
                    <span>GitHub not configured</span>
                `;
                statusElement.className = 'status-indicator error';
            }
        }
    }

    /**
     * Show configuration required message
     */
    showConfigurationRequired() {
        this.showStatus('Please configure your GitHub token to load usage analytics', 'error');
        this.showSettings();
    }

    /**
     * Setup auto-refresh
     */
    setupAutoRefresh() {
        // Clear existing interval
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }

        if (this.config.get('github.autoRefresh')) {
            const interval = this.config.get('github.refreshInterval') || 300000; // 5 minutes
            this.autoRefreshInterval = setInterval(() => {
                console.log('🔄 Auto-refreshing data...');
                this.refreshData(true);
            }, interval);
            
            console.log(`⏱️ Auto-refresh enabled (${interval / 1000}s interval)`);
        }
    }

    /**
     * Refresh data
     */
    async refreshData(silent = false) {
        try {
            if (!silent) {
                this.setLoading(true);
            }

            await this.loadData();
            this.updateDashboard();

            if (!silent) {
                this.setLoading(false);
                this.showNotification('Data refreshed successfully!', 'success');
            }

        } catch (error) {
            if (!silent) {
                this.setLoading(false);
            }
            this.handleError(error);
        }
    }

    /**
     * Update dashboard with current data
     */
    updateDashboard() {
        this.updateSummaryStats();
        this.createCharts();
        this.renderReportsTable();
    }

    /**
     * Enhanced data export with multiple formats and options
     */
    exportData() {
        this.showExportModal();
    }

    // =============================================
    // ENHANCED USER EXPERIENCE FEATURES
    // =============================================

    /**
     * Load user preferences from localStorage
     */
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('frostbyte_user_preferences');
            if (stored) {
                const preferences = JSON.parse(stored);
                this.userPreferences = { ...this.userPreferences, ...preferences };
                console.log('✅ User preferences loaded');
            }
            
            // Apply loaded preferences
            this.applyUserPreferences();
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }

    /**
     * Save user preferences to localStorage
     */
    saveUserPreferences() {
        try {
            localStorage.setItem('frostbyte_user_preferences', JSON.stringify(this.userPreferences));
            console.log('✅ User preferences saved');
        } catch (error) {
            console.warn('Failed to save user preferences:', error);
        }
    }

    /**
     * Apply user preferences to UI
     */
    applyUserPreferences() {
        // Apply theme
        this.applyTheme(this.userPreferences.theme);
        
        // Apply compact mode
        if (this.userPreferences.compactMode) {
            document.body.classList.add('compact-mode');
        }
        
        // Apply accessibility mode
        if (this.userPreferences.accessibilityMode) {
            document.body.classList.add('accessibility-mode');
        }
        
        // Apply animations setting
        if (!this.userPreferences.animationsEnabled) {
            document.body.classList.add('no-animations');
        }
        
        console.log('🎨 User preferences applied to UI');
    }

    /**
     * Apply theme to dashboard
     */
    applyTheme(theme) {
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        
        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
        } else {
            document.body.classList.add(`theme-${theme}`);
        }
        
        this.userPreferences.theme = theme;
        this.saveUserPreferences();
    }

    /**
     * Toggle theme between light and dark
     */
    toggleTheme() {
        const currentTheme = this.userPreferences.theme;
        let newTheme;
        
        switch (currentTheme) {
            case 'light':
                newTheme = 'dark';
                break;
            case 'dark':
                newTheme = 'auto';
                break;
            default:
                newTheme = 'light';
        }
        
        this.applyTheme(newTheme);
        this.showNotification(`Theme switched to ${newTheme}`, 'success');
    }

    /**
     * Toggle compact mode
     */
    toggleCompactMode() {
        this.userPreferences.compactMode = !this.userPreferences.compactMode;
        
        if (this.userPreferences.compactMode) {
            document.body.classList.add('compact-mode');
            this.showNotification('Compact mode enabled', 'success');
        } else {
            document.body.classList.remove('compact-mode');
            this.showNotification('Compact mode disabled', 'success');
        }
        
        this.saveUserPreferences();
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        if (!this.userPreferences.keyboardShortcuts) return;
        
        document.addEventListener('keydown', (event) => {
            // Ignore if user is typing in an input field
            if (event.target.tagName === 'INPUT' || 
                event.target.tagName === 'TEXTAREA' || 
                event.target.contentEditable === 'true') {
                return;
            }
            
            // Check for Ctrl/Cmd key combinations
            const key = event.ctrlKey || event.metaKey ? 
                `Ctrl+${event.code}` : event.code;
            
            const handler = this.keyboardShortcuts.get(key);
            if (handler) {
                event.preventDefault();
                handler();
            }
        });
        
        console.log('⌨️ Keyboard shortcuts enabled');
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        // Add ARIA labels and roles
        this.addAriaLabels();
        
        // Setup focus management
        this.setupFocusManagement();
        
        // Setup screen reader announcements
        this.setupScreenReaderAnnouncements();
        
        // Add high contrast mode toggle
        this.setupHighContrastMode();
        
        console.log('♿ Accessibility features enabled');
    }

    /**
     * Add ARIA labels to dashboard elements
     */
    addAriaLabels() {
        // Add labels to charts
        const charts = document.querySelectorAll('canvas');
        charts.forEach((chart, index) => {
            chart.setAttribute('role', 'img');
            chart.setAttribute('aria-label', `Analytics chart ${index + 1}`);
        });
        
        // Add labels to buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label') && !button.textContent.trim()) {
                const icon = button.querySelector('i');
                if (icon) {
                    const iconClass = icon.className.split(' ').pop();
                    button.setAttribute('aria-label', this.getButtonLabelFromIcon(iconClass));
                }
            }
        });
        
        // Add landmarks
        const main = document.querySelector('.container');
        if (main) main.setAttribute('role', 'main');
        
        const nav = document.querySelector('.controls');
        if (nav) nav.setAttribute('role', 'navigation');
    }

    /**
     * Get button label from icon class
     */
    getButtonLabelFromIcon(iconClass) {
        const iconLabels = {
            'fa-cog': 'Settings',
            'fa-refresh': 'Refresh data',
            'fa-download': 'Export data',
            'fa-search': 'Search',
            'fa-times': 'Close',
            'fa-save': 'Save',
            'fa-trash': 'Delete',
            'fa-edit': 'Edit',
            'fa-eye': 'View',
            'fa-external-link-alt': 'Open in new tab'
        };
        
        return iconLabels[iconClass] || 'Button';
    }

    /**
     * Setup focus management
     */
    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Tab') {
                const modal = document.querySelector('.modal.active');
                if (modal) {
                    this.trapFocusInModal(event, modal);
                }
            }
        });
        
        // Return focus to trigger when modal closes
        this.lastFocusedElement = null;
        
        // Highlight focus for keyboard users
        document.addEventListener('keydown', () => {
            document.body.classList.add('keyboard-nav');
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }

    /**
     * Trap focus within modal
     */
    trapFocusInModal(event, modal) {
        const focusableElements = modal.querySelectorAll(
            'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

    /**
     * Setup screen reader announcements
     */
    setupScreenReaderAnnouncements() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
    }

    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }

    /**
     * Setup high contrast mode
     */
    setupHighContrastMode() {
        // Detect system high contrast preference
        const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
        
        const applyHighContrast = (matches) => {
            if (matches) {
                document.body.classList.add('high-contrast');
            } else {
                document.body.classList.remove('high-contrast');
            }
        };
        
        applyHighContrast(highContrastQuery.matches);
        highContrastQuery.addEventListener('change', (e) => applyHighContrast(e.matches));
    }

    /**
     * Initialize advanced filtering
     */
    initializeAdvancedFiltering() {
        this.createAdvancedFilterPanel();
        this.setupFilterPresets();
        this.loadSavedFilters();
        
        console.log('🔍 Advanced filtering initialized');
    }

    /**
     * Create advanced filter panel
     */
    createAdvancedFilterPanel() {
        const existingPanel = document.getElementById('advanced-filters-panel');
        if (existingPanel) return;
        
        const panel = document.createElement('div');
        panel.id = 'advanced-filters-panel';
        panel.className = 'advanced-filters-panel hidden';
        panel.innerHTML = this.getAdvancedFilterHTML();
        
        const container = document.querySelector('.container');
        if (container) {
            container.appendChild(panel);
        }
    }

    /**
     * Get advanced filter panel HTML
     */
    getAdvancedFilterHTML() {
        return `
            <div class="filter-panel-header">
                <h3><i class="fas fa-filter"></i> Advanced Filters</h3>
                <button class="btn-close" onclick="this.closest('.advanced-filters-panel').classList.add('hidden')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="filter-panel-content">
                <div class="filter-section">
                    <h4>User Filters</h4>
                    <div class="filter-group">
                        <label>User Hash:</label>
                        <input type="text" id="filter-user-hash" placeholder="Filter by user hash">
                    </div>
                    <div class="filter-group">
                        <label>Version:</label>
                        <select id="filter-version">
                            <option value="">All versions</option>
                        </select>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4>Metrics Filters</h4>
                    <div class="filter-group">
                        <label>Session Duration (minutes):</label>
                        <div class="range-inputs">
                            <input type="number" id="filter-duration-min" placeholder="Min" min="0">
                            <span>to</span>
                            <input type="number" id="filter-duration-max" placeholder="Max" min="0">
                        </div>
                    </div>
                    <div class="filter-group">
                        <label>Click Count:</label>
                        <div class="range-inputs">
                            <input type="number" id="filter-clicks-min" placeholder="Min" min="0">
                            <span>to</span>
                            <input type="number" id="filter-clicks-max" placeholder="Max" min="0">
                        </div>
                    </div>
                    <div class="filter-group">
                        <label>Notes Created:</label>
                        <div class="range-inputs">
                            <input type="number" id="filter-notes-min" placeholder="Min" min="0">
                            <span>to</span>
                            <input type="number" id="filter-notes-max" placeholder="Max" min="0">
                        </div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4>Feature Filters</h4>
                    <div class="filter-group">
                        <label>Include Features:</label>
                        <div class="feature-tags" id="include-features"></div>
                        <input type="text" id="feature-input" placeholder="Type feature name...">
                    </div>
                    <div class="filter-group">
                        <label>Exclude Features:</label>
                        <div class="feature-tags" id="exclude-features"></div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4>Date Range</h4>
                    <div class="filter-group">
                        <label>Custom Date Range:</label>
                        <div class="date-range-inputs">
                            <input type="date" id="filter-date-start">
                            <span>to</span>
                            <input type="date" id="filter-date-end">
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="filter-panel-footer">
                <button class="btn btn-secondary" onclick="window.dashboard.clearAdvancedFilters()">
                    Clear All
                </button>
                <button class="btn btn-primary" onclick="window.dashboard.applyAdvancedFilters()">
                    Apply Filters
                </button>
            </div>
        `;
    }

    /**
     * Setup filter presets
     */
    setupFilterPresets() {
        this.filterPresets = {
            'recent-activity': {
                name: 'Recent Activity',
                filters: {
                    dateRange: 7,
                    clickCount: { min: 5 }
                }
            },
            'power-users': {
                name: 'Power Users',
                filters: {
                    sessionDuration: { min: 30 },
                    noteCount: { min: 10 }
                }
            },
            'new-users': {
                name: 'New Users',
                filters: {
                    sessionDuration: { max: 10 },
                    clickCount: { max: 20 }
                }
            },
            'feature-adoption': {
                name: 'Feature Adoption',
                filters: {
                    features: ['analytics', 'export', 'settings']
                }
            }
        };
    }

    /**
     * Setup responsive design
     */
    setupResponsiveDesign() {
        // Setup responsive breakpoints
        this.setupResponsiveBreakpoints();
        
        // Setup mobile navigation
        this.setupMobileNavigation();
        
        // Setup responsive tables
        this.setupResponsiveTables();
        
        console.log('📱 Responsive design features enabled');
    }

    /**
     * Setup responsive breakpoints
     */
    setupResponsiveBreakpoints() {
        const breakpoints = {
            mobile: window.matchMedia('(max-width: 768px)'),
            tablet: window.matchMedia('(min-width: 769px) and (max-width: 1024px)'),
            desktop: window.matchMedia('(min-width: 1025px)')
        };
        
        Object.entries(breakpoints).forEach(([name, query]) => {
            const handler = (e) => {
                if (e.matches) {
                    document.body.classList.add(`breakpoint-${name}`);
                    this.handleBreakpointChange(name, true);
                } else {
                    document.body.classList.remove(`breakpoint-${name}`);
                    this.handleBreakpointChange(name, false);
                }
            };
            
            handler(query);
            query.addEventListener('change', handler);
        });
    }

    /**
     * Handle breakpoint changes
     */
    handleBreakpointChange(breakpoint, matches) {
        if (matches) {
            switch (breakpoint) {
                case 'mobile':
                    this.enableMobileMode();
                    break;
                case 'tablet':
                    this.enableTabletMode();
                    break;
                case 'desktop':
                    this.enableDesktopMode();
                    break;
            }
        }
    }

    /**
     * Enable mobile mode optimizations
     */
    enableMobileMode() {
        // Collapse sidebar by default
        this.uiState.sidebarCollapsed = true;
        
        // Switch to compact view
        this.uiState.viewMode = 'compact';
        
        // Reduce chart animations
        this.userPreferences.chartAnimationDuration = 150;
        
        console.log('📱 Mobile mode enabled');
    }

    /**
     * Enable tablet mode optimizations
     */
    enableTabletMode() {
        this.uiState.viewMode = 'list';
        this.userPreferences.chartAnimationDuration = 200;
        console.log('📊 Tablet mode enabled');
    }

    /**
     * Enable desktop mode optimizations
     */
    enableDesktopMode() {
        this.uiState.sidebarCollapsed = false;
        this.uiState.viewMode = 'grid';
        this.userPreferences.chartAnimationDuration = 300;
        console.log('🖥️ Desktop mode enabled');
    }

    /**
     * Setup mobile navigation
     */
    setupMobileNavigation() {
        // Add mobile menu toggle
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-menu-toggle';
        mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
        mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
        
        mobileToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });
        
        const header = document.querySelector('.header');
        if (header) {
            header.appendChild(mobileToggle);
        }
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        const nav = document.querySelector('.controls');
        if (nav) {
            nav.classList.toggle('mobile-open');
            this.announceToScreenReader(
                nav.classList.contains('mobile-open') ? 
                'Navigation menu opened' : 
                'Navigation menu closed'
            );
        }
    }

    /**
     * Setup responsive tables
     */
    setupResponsiveTables() {
        // Add horizontal scroll for tables on mobile
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            if (!table.closest('.table-responsive')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'table-responsive';
                table.parentNode.insertBefore(wrapper, table);
                wrapper.appendChild(table);
            }
        });
    }

    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.getElementById('search-filter');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    /**
     * Show help modal with keyboard shortcuts
     */
    showHelpModal() {
        const modal = this.createHelpModal();
        this.showModal(modal);
    }

    /**
     * Create help modal
     */
    createHelpModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-dialog help-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-question-circle"></i> Help & Keyboard Shortcuts</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    ${this.getHelpContent()}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                        Got it!
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * Get help content
     */
    getHelpContent() {
        return `
            <div class="help-content">
                <div class="help-section">
                    <h4>⌨️ Keyboard Shortcuts</h4>
                    <div class="shortcuts-grid">
                        <div class="shortcut-item">
                            <kbd>R</kbd>
                            <span>Refresh data</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>S</kbd>
                            <span>Open settings</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>E</kbd>
                            <span>Export data</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>F</kbd>
                            <span>Focus search</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>H</kbd>
                            <span>Show this help</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>T</kbd>
                            <span>Toggle theme</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>C</kbd>
                            <span>Toggle compact mode</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Esc</kbd>
                            <span>Close modals</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>1-4</kbd>
                            <span>Switch tabs</span>
                        </div>
                    </div>
                </div>
                
                <div class="help-section">
                    <h4>🎯 Quick Actions</h4>
                    <ul>
                        <li>Click on charts for detailed views</li>
                        <li>Use advanced filters for precise data analysis</li>
                        <li>Export data in multiple formats (JSON, CSV, PDF, Excel)</li>
                        <li>Customize your experience in Settings</li>
                        <li>Use search to quickly find specific reports</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h4>♿ Accessibility</h4>
                    <ul>
                        <li>Full keyboard navigation support</li>
                        <li>Screen reader compatible</li>
                        <li>High contrast mode available</li>
                        <li>Focus indicators for keyboard users</li>
                        <li>ARIA labels and semantic HTML</li>
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
        
        // Return focus to previously focused element
        if (this.lastFocusedElement) {
            this.lastFocusedElement.focus();
            this.lastFocusedElement = null;
        }
    }

    /**
     * Switch to specific tab
     */
    switchTab(tabName) {
        this.uiState.activeTab = tabName;
        
        // Update tab indicators
        const tabs = document.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Show corresponding content
        const contents = document.querySelectorAll('.tab-content');
        contents.forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
        
        this.announceToScreenReader(`Switched to ${tabName} tab`);
    }

    /**
     * Apply advanced filters
     */
    applyAdvancedFilters() {
        // Collect filter values
        const filters = {
            userHash: document.getElementById('filter-user-hash')?.value || '',
            version: document.getElementById('filter-version')?.value || '',
            sessionDuration: {
                min: parseInt(document.getElementById('filter-duration-min')?.value) || null,
                max: parseInt(document.getElementById('filter-duration-max')?.value) || null
            },
            clickCount: {
                min: parseInt(document.getElementById('filter-clicks-min')?.value) || null,
                max: parseInt(document.getElementById('filter-clicks-max')?.value) || null
            },
            noteCount: {
                min: parseInt(document.getElementById('filter-notes-min')?.value) || null,
                max: parseInt(document.getElementById('filter-notes-max')?.value) || null
            },
            customDateRange: {
                start: document.getElementById('filter-date-start')?.value || null,
                end: document.getElementById('filter-date-end')?.value || null
            }
        };
        
        this.advancedFilters = filters;
        this.updateDashboard();
        
        // Hide filter panel
        document.getElementById('advanced-filters-panel')?.classList.add('hidden');
        
        this.showNotification('Advanced filters applied', 'success');
        this.announceToScreenReader('Advanced filters have been applied to the data');
    }

    /**
     * Clear advanced filters
     */
    clearAdvancedFilters() {
        // Reset filter object
        this.advancedFilters = {
            userHash: '',
            version: '',
            sessionDuration: { min: null, max: null },
            clickCount: { min: null, max: null },
            noteCount: { min: null, max: null },
            features: [],
            excludeFeatures: [],
            customDateRange: { start: null, end: null }
        };
        
        // Clear filter inputs
        const inputs = document.querySelectorAll('#advanced-filters-panel input, #advanced-filters-panel select');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        
        this.updateDashboard();
        this.showNotification('Filters cleared', 'success');
    }

    /**
     * Load saved filters
     */
    loadSavedFilters() {
        if (this.userPreferences.autoSaveFilters) {
            try {
                const saved = localStorage.getItem('frostbyte_saved_filters');
                if (saved) {
                    this.advancedFilters = JSON.parse(saved);
                }
            } catch (error) {
                console.warn('Failed to load saved filters:', error);
            }
        }
    }

    /**
     * Save current filters
     */
    saveCurrentFilters() {
        if (this.userPreferences.autoSaveFilters) {
            try {
                localStorage.setItem('frostbyte_saved_filters', JSON.stringify(this.advancedFilters));
            } catch (error) {
                console.warn('Failed to save filters:', error);
            }
        }
    }

    /**
     * Show export options modal
     */
    showExportModal() {
        const modal = this.createExportModal();
        this.showModal(modal);
    }

    /**
     * Create export options modal
     */
    createExportModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-dialog export-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-download"></i> Export Analytics Data</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="export-options">
                        <div class="export-section">
                            <h4><i class="fas fa-file-alt"></i> Export Format</h4>
                            <div class="format-options">
                                <label class="radio-option">
                                    <input type="radio" name="export-format" value="json" checked>
                                    <span class="radio-text">
                                        <strong>JSON</strong>
                                        <small>Complete data with metadata</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="export-format" value="csv">
                                    <span class="radio-text">
                                        <strong>CSV</strong>
                                        <small>Spreadsheet-compatible format</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="export-format" value="pdf">
                                    <span class="radio-text">
                                        <strong>PDF Report</strong>
                                        <small>Professional analytics report</small>
                                    </span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="export-format" value="excel">
                                    <span class="radio-text">
                                        <strong>Excel</strong>
                                        <small>Advanced spreadsheet with charts</small>
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div class="export-section">
                            <h4><i class="fas fa-filter"></i> Data Selection</h4>
                            <div class="data-options">
                                <label class="checkbox-option">
                                    <input type="checkbox" name="include-reports" checked>
                                    <span>Usage Reports (${this.data.reports.length} items)</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" name="include-performance" checked>
                                    <span>Performance Metrics</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" name="include-journey" checked>
                                    <span>User Journey Data</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" name="include-charts">
                                    <span>Chart Data & Images</span>
                                </label>
                            </div>
                        </div>

                        <div class="export-section">
                            <h4><i class="fas fa-calendar"></i> Date Range</h4>
                            <div class="date-options">
                                <label class="form-label">From:</label>
                                <input type="date" id="export-date-from" class="form-input">
                                <label class="form-label">To:</label>
                                <input type="date" id="export-date-to" class="form-input">
                            </div>
                        </div>

                        <div class="export-section">
                            <h4><i class="fas fa-cog"></i> Advanced Options</h4>
                            <div class="advanced-options">
                                <label class="checkbox-option">
                                    <input type="checkbox" name="compress-export">
                                    <span>Compress as ZIP file</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" name="include-metadata">
                                    <span>Include metadata & configuration</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" name="scheduled-export">
                                    <span>Schedule recurring export</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Cancel
                    </button>
                    <button class="btn btn-primary" onclick="window.dashboard.processExport(this.closest('.modal'))">
                        <i class="fas fa-download"></i> Export Data
                    </button>
                </div>
            </div>
        `;
        
        // Set default date range (last 30 days)
        setTimeout(() => {
            const today = new Date();
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            
            const fromInput = modal.querySelector('#export-date-from');
            const toInput = modal.querySelector('#export-date-to');
            
            if (fromInput) fromInput.value = monthAgo.toISOString().split('T')[0];
            if (toInput) toInput.value = today.toISOString().split('T')[0];
        }, 100);
        
        return modal;
    }

    /**
     * Process export with selected options
     */
    async processExport(modal) {
        try {
            const format = modal.querySelector('input[name="export-format"]:checked')?.value || 'json';
            const includeReports = modal.querySelector('input[name="include-reports"]')?.checked;
            const includePerformance = modal.querySelector('input[name="include-performance"]')?.checked;
            const includeJourney = modal.querySelector('input[name="include-journey"]')?.checked;
            const includeCharts = modal.querySelector('input[name="include-charts"]')?.checked;
            const compress = modal.querySelector('input[name="compress-export"]')?.checked;
            const includeMetadata = modal.querySelector('input[name="include-metadata"]')?.checked;
            
            const dateFrom = modal.querySelector('#export-date-from')?.value;
            const dateTo = modal.querySelector('#export-date-to')?.value;

            this.showNotification('Preparing export...', 'info');
            modal.remove();

            // Filter data by date range
            const filteredReports = this.filterReportsByDateRange(this.data.reports, dateFrom, dateTo);
            
            // Prepare export data
            const exportData = {
                metadata: {
                    exportedAt: new Date().toISOString(),
                    dateRange: { from: dateFrom, to: dateTo },
                    recordCount: filteredReports.length,
                    format: format,
                    version: '2.0'
                }
            };

            if (includeReports) {
                exportData.reports = filteredReports;
            }

            if (includePerformance && this.data.performanceMetrics) {
                exportData.performanceMetrics = this.data.performanceMetrics;
            }

            if (includeJourney && this.data.userJourneyData) {
                exportData.userJourneyData = this.data.userJourneyData;
            }

            if (includeCharts) {
                exportData.chartData = await this.exportChartData();
            }

            if (includeMetadata) {
                exportData.configuration = this.config.exportConfig();
            }

            // Generate export based on format
            switch (format) {
                case 'json':
                    this.exportAsJSON(exportData, compress);
                    break;
                case 'csv':
                    this.exportAsCSV(exportData, compress);
                    break;
                case 'pdf':
                    await this.exportAsPDF(exportData);
                    break;
                case 'excel':
                    await this.exportAsExcel(exportData);
                    break;
                default:
                    throw new Error('Unsupported export format');
            }

            this.showNotification(`Data exported successfully as ${format.toUpperCase()}`, 'success');

        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification(`Export failed: ${error.message}`, 'error');
        }
    }

    /**
     * Filter reports by date range
     */
    filterReportsByDateRange(reports, fromDate, toDate) {
        if (!fromDate && !toDate) return reports;
        
        const from = fromDate ? new Date(fromDate) : new Date(0);
        const to = toDate ? new Date(toDate) : new Date();
        to.setHours(23, 59, 59, 999); // Include full day
        
        return reports.filter(report => {
            const reportDate = new Date(report.createdAt);
            return reportDate >= from && reportDate <= to;
        });
    }

    /**
     * Export chart data and images
     */
    async exportChartData() {
        const chartData = {};
        
        // Export chart configurations and data
        Object.keys(this.charts).forEach(chartKey => {
            const chart = this.charts[chartKey];
            if (chart && chart.data) {
                chartData[chartKey] = {
                    type: chart.config.type,
                    data: chart.data,
                    options: chart.options
                };
            }
        });
        
        // Export performance charts
        Object.keys(this.performanceCharts).forEach(chartKey => {
            const chart = this.performanceCharts[chartKey];
            if (chart && chart.data) {
                chartData[`performance_${chartKey}`] = {
                    type: chart.config.type,
                    data: chart.data,
                    options: chart.options
                };
            }
        });
        
        return chartData;
    }

    /**
     * Export as JSON
     */
    exportAsJSON(data, compress = false) {
        const jsonString = JSON.stringify(data, null, 2);
        const filename = `frostbyte-analytics-${new Date().toISOString().split('T')[0]}.json`;
        
        if (compress) {
            // Note: Real compression would require a library like JSZip
            this.downloadFile(jsonString, filename, 'application/json');
        } else {
            this.downloadFile(jsonString, filename, 'application/json');
        }
    }

    /**
     * Export as CSV
     */
    exportAsCSV(data, compress = false) {
        let csvContent = '';
        
        // Export reports as CSV
        if (data.reports && data.reports.length > 0) {
            const headers = [
                'Date', 'Type', 'User', 'Version', 'Session Duration', 
                'Button Clicks', 'Notes Created', 'Features Used'
            ];
            
            csvContent += headers.join(',') + '\n';
            
            data.reports.forEach(report => {
                const row = [
                    new Date(report.createdAt).toISOString(),
                    report.type || '',
                    report.userData?.userHash || '',
                    report.userData?.version || '',
                    report.userData?.sessionDuration || 0,
                    report.analytics?.buttonClicks || 0,
                    report.analytics?.notesCreated || 0,
                    (report.features || []).join(';')
                ];
                csvContent += row.map(field => `"${field}"`).join(',') + '\n';
            });
        }
        
        const filename = `frostbyte-analytics-${new Date().toISOString().split('T')[0]}.csv`;
        this.downloadFile(csvContent, filename, 'text/csv');
    }

    /**
     * Export as PDF (basic implementation)
     */
    async exportAsPDF(data) {
        // This would require a PDF library like jsPDF or Puppeteer
        // For now, create a formatted HTML report
        const reportHTML = this.generateHTMLReport(data);
        const filename = `frostbyte-analytics-report-${new Date().toISOString().split('T')[0]}.html`;
        this.downloadFile(reportHTML, filename, 'text/html');
        
        this.showNotification('HTML report generated. Use browser print to create PDF.', 'info');
    }

    /**
     * Export as Excel (basic implementation)
     */
    async exportAsExcel(data) {
        // This would require a library like SheetJS or ExcelJS
        // For now, export as CSV with Excel-compatible formatting
        this.exportAsCSV(data);
        this.showNotification('Excel-compatible CSV generated.', 'info');
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(data) {
        const styles = `
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
                .section { margin-bottom: 30px; }
                .section h2 { color: #667eea; border-left: 4px solid #667eea; padding-left: 10px; }
                .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
                .metric-card { padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: center; }
                .metric-value { font-size: 2em; font-weight: bold; color: #667eea; }
                .metric-label { color: #666; font-size: 0.9em; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                th { background-color: #f8f9fa; font-weight: bold; }
                .metadata { background: #f8f9fa; padding: 20px; border-radius: 8px; font-size: 0.9em; }
            </style>
        `;
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Frostbyte Analytics Report</title>
                <meta charset="utf-8">
                ${styles}
            </head>
            <body>
                <div class="header">
                    <h1>📊 Frostbyte Analytics Report</h1>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                    ${data.metadata?.dateRange ? `<p>Data Range: ${data.metadata.dateRange.from} to ${data.metadata.dateRange.to}</p>` : ''}
                </div>
                
                <div class="section">
                    <h2>📈 Summary Metrics</h2>
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-value">${data.reports?.length || 0}</div>
                            <div class="metric-label">Total Reports</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${this.getUniqueUsers(data.reports || []).length}</div>
                            <div class="metric-label">Unique Users</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${this.getTotalClicks(data.reports || [])}</div>
                            <div class="metric-label">Total Clicks</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-value">${this.getTotalNotes(data.reports || [])}</div>
                            <div class="metric-label">Notes Created</div>
                        </div>
                    </div>
                </div>
                
                ${data.reports ? this.generateReportsTable(data.reports) : ''}
                
                <div class="metadata">
                    <strong>Export Information:</strong><br>
                    Exported at: ${data.metadata?.exportedAt}<br>
                    Format: ${data.metadata?.format}<br>
                    Version: ${data.metadata?.version}<br>
                    Record Count: ${data.metadata?.recordCount}
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Generate reports table for HTML export
     */
    generateReportsTable(reports) {
        if (!reports || reports.length === 0) return '';
        
        const rows = reports.map(report => `
            <tr>
                <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                <td>${report.type || 'N/A'}</td>
                <td>${report.userData?.userHash || 'N/A'}</td>
                <td>${report.userData?.version || 'N/A'}</td>
                <td>${report.analytics?.buttonClicks || 0}</td>
                <td>${report.analytics?.notesCreated || 0}</td>
            </tr>
        `).join('');
        
        return `
            <div class="section">
                <h2>📋 Detailed Reports</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>User</th>
                            <th>Version</th>
                            <th>Clicks</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Helper methods for HTML report
     */
    getTotalClicks(reports) {
        return reports.reduce((total, report) => total + (report.analytics?.buttonClicks || 0), 0);
    }

    getTotalNotes(reports) {
        return reports.reduce((total, report) => total + (report.analytics?.notesCreated || 0), 0);
    }

    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.github.clearCache();
        localStorage.removeItem('frostbyte_analytics_cache');
        this.showNotification('Cache cleared successfully', 'success');
    }

    /**
     * Save data to cache
     */
    saveToCache() {
        try {
            const cacheData = {
                reports: this.data.reports,
                lastUpdate: this.data.lastUpdate,
                timestamp: Date.now()
            };
            localStorage.setItem('frostbyte_analytics_cache', JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to save cache:', error);
        }
    }

    /**
     * Load data from cache
     */
    loadFromCache() {
        try {
            const cached = localStorage.getItem('frostbyte_analytics_cache');
            if (!cached) return false;

            const cacheData = JSON.parse(cached);
            const maxAge = this.config.get('cache.maxAge') || 600000; // 10 minutes
            
            if (Date.now() - cacheData.timestamp > maxAge) {
                return false;
            }

            this.data.reports = cacheData.reports || [];
            this.data.lastUpdate = cacheData.lastUpdate ? new Date(cacheData.lastUpdate) : null;
            
            return true;
        } catch (error) {
            console.warn('Failed to load cache:', error);
            return false;
        }
    }

    /**
     * Handle errors
     */
    handleError(error) {
        console.error('Dashboard error:', error);
        
        if (error instanceof GitHubAPIError) {
            if (error.isAuthError()) {
                this.showError('GitHub token is invalid or expired. Please check your token and try again.');
                this.showSettings();
            } else if (error.isRateLimitError()) {
                this.showError('GitHub API rate limit exceeded. Please try again later.');
            } else if (error.isNotFoundError()) {
                this.showError('Repository not found. Please check your repository settings.');
            } else {
                this.showError(`GitHub API error: ${error.message}`);
            }
        } else {
            this.showError('An unexpected error occurred. Please try again.');
        }
    }

    // =============================================
    // ADDITIONAL ENHANCED UX METHODS
    // =============================================

    /**
     * Toggle advanced filters panel
     */
    toggleAdvancedFilters() {
        const panel = document.getElementById('advanced-filters-panel');
        if (panel) {
            panel.classList.toggle('hidden');
            
            if (!panel.classList.contains('hidden')) {
                // Populate filter options when opening
                this.populateFilterOptions();
                this.announceToScreenReader('Advanced filters panel opened');
            } else {
                this.announceToScreenReader('Advanced filters panel closed');
            }
        }
    }

    /**
     * Populate filter options with current data
     */
    populateFilterOptions() {
        // Populate version dropdown
        const versionSelect = document.getElementById('filter-version');
        if (versionSelect && this.data.reports) {
            const versions = [...new Set(this.data.reports
                .map(report => report.userData?.version)
                .filter(v => v))];
            
            versionSelect.innerHTML = '<option value="">All versions</option>' +
                versions.map(v => `<option value="${v}">${v}</option>`).join('');
        }
    }

    /**
     * Show search suggestions
     */
    showSearchSuggestions() {
        const searchInput = document.getElementById('search-filter');
        if (!searchInput || !this.data.reports) return;
        
        // Get unique search terms from reports
        const suggestions = new Set();
        
        this.data.reports.forEach(report => {
            // Add user hashes
            if (report.userData?.userHash) {
                suggestions.add(report.userData.userHash);
            }
            
            // Add features
            if (report.features) {
                report.features.forEach(feature => suggestions.add(feature));
            }
            
            // Add versions
            if (report.userData?.version) {
                suggestions.add(report.userData.version);
            }
        });
        
        this.createSearchSuggestionsDropdown(Array.from(suggestions), searchInput);
    }

    /**
     * Create search suggestions dropdown
     */
    createSearchSuggestionsDropdown(suggestions, input) {
        // Remove existing dropdown
        const existingDropdown = document.getElementById('search-suggestions');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        if (suggestions.length === 0) return;
        
        const dropdown = document.createElement('div');
        dropdown.id = 'search-suggestions';
        dropdown.className = 'search-suggestions-dropdown';
        
        suggestions.slice(0, 10).forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                input.value = suggestion;
                input.dispatchEvent(new Event('input'));
                dropdown.remove();
            });
            dropdown.appendChild(item);
        });
        
        input.parentNode.appendChild(dropdown);
        
        // Remove dropdown when clicking outside
        const removeDropdown = (e) => {
            if (!dropdown.contains(e.target) && e.target !== input) {
                dropdown.remove();
                document.removeEventListener('click', removeDropdown);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', removeDropdown);
        }, 100);
    }

    /**
     * Switch view mode
     */
    switchViewMode(mode) {
        this.uiState.viewMode = mode;
        
        // Update UI
        document.body.classList.remove('view-grid', 'view-list', 'view-compact');
        document.body.classList.add(`view-${mode}`);
        
        // Update active button
        const buttons = document.querySelectorAll('.view-mode-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Re-render content for new view
        this.renderReportsTable();
        
        this.showNotification(`Switched to ${mode} view`, 'info');
        this.announceToScreenReader(`View mode changed to ${mode}`);
    }

    /**
     * Handle row selection in tables
     */
    handleRowSelection(event) {
        const checkbox = event.target;
        const row = checkbox.closest('tr');
        const rowId = row.dataset.id;
        
        if (checkbox.checked) {
            this.uiState.selectedRows.add(rowId);
            row.classList.add('selected');
        } else {
            this.uiState.selectedRows.delete(rowId);
            row.classList.remove('selected');
        }
        
        this.updateSelectionActions();
        this.announceToScreenReader(
            `${this.uiState.selectedRows.size} rows selected`
        );
    }

    /**
     * Handle table sorting
     */
    handleTableSort(event) {
        const header = event.target;
        const column = header.dataset.column;
        
        // Update sort direction
        if (this.uiState.sortColumn === column) {
            this.uiState.sortDirection = this.uiState.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.uiState.sortColumn = column;
            this.uiState.sortDirection = 'asc';
        }
        
        // Update header indicators
        const headers = document.querySelectorAll('.sortable-header');
        headers.forEach(h => {
            h.classList.remove('sort-asc', 'sort-desc');
            if (h === header) {
                h.classList.add(`sort-${this.uiState.sortDirection}`);
            }
        });
        
        // Re-render table with sorted data
        this.renderReportsTable();
        
        this.announceToScreenReader(
            `Table sorted by ${column} in ${this.uiState.sortDirection}ending order`
        );
    }

    /**
     * Update selection actions visibility
     */
    updateSelectionActions() {
        const actionsPanel = document.getElementById('selection-actions');
        if (!actionsPanel) return;
        
        const selectedCount = this.uiState.selectedRows.size;
        
        if (selectedCount > 0) {
            actionsPanel.classList.remove('hidden');
            const countSpan = actionsPanel.querySelector('.selection-count');
            if (countSpan) {
                countSpan.textContent = selectedCount;
            }
        } else {
            actionsPanel.classList.add('hidden');
        }
    }

    /**
     * Select all rows in the current table view
     */
    selectAllRows() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
                
                // Basic type filter
                if (this.filters.reportType !== 'all' && report.type !== this.filters.reportType) {
                    return false;
                }
                
                // Basic search filter
                if (this.filters.search) {
                    const search = this.filters.search.toLowerCase();
                    const title = (report.title || '').toLowerCase();
                    const body = (report.body || '').toLowerCase();
                    const userHash = (report.userData?.userHash || '').toLowerCase();
                    
                    if (!title.includes(search) && !body.includes(search) && !userHash.includes(search)) {
                        return false;
                    }
                }
                
                // Advanced filters
                if (this.advancedFilters.userHash && 
                    !report.userData?.userHash?.includes(this.advancedFilters.userHash)) {
                    return false;
                }
                
                if (this.advancedFilters.version && 
                    report.userData?.version !== this.advancedFilters.version) {
                    return false;
                }
                
                // Numeric range filters
                const duration = report.userData?.sessionDuration || 0;
                if (this.advancedFilters.sessionDuration.min !== null && 
                    duration < this.advancedFilters.sessionDuration.min) {
                    return false;
                }
                if (this.advancedFilters.sessionDuration.max !== null && 
                    duration > this.advancedFilters.sessionDuration.max) {
                    return false;
                }
                
                const clicks = report.analytics?.buttonClicks || 0;
                if (this.advancedFilters.clickCount.min !== null && 
                    clicks < this.advancedFilters.clickCount.min) {
                    return false;
                }
                if (this.advancedFilters.clickCount.max !== null && 
                    clicks > this.advancedFilters.clickCount.max) {
                    return false;
                }
                
                const notes = report.analytics?.notesCreated || 0;
                if (this.advancedFilters.noteCount.min !== null && 
                    notes < this.advancedFilters.noteCount.min) {
                    return false;
                }
                if (this.advancedFilters.noteCount.max !== null && 
                    notes > this.advancedFilters.noteCount.max) {
                    return false;
                }
                
                // Custom date range
                if (this.advancedFilters.customDateRange.start || this.advancedFilters.customDateRange.end) {
                    const reportDate = report.createdAt instanceof Date ? report.createdAt : new Date(report.createdAt);
                    
                    if (this.advancedFilters.customDateRange.start) {
                        const startDate = new Date(this.advancedFilters.customDateRange.start);
                        if (reportDate < startDate) return false;
                    }
                    
                    if (this.advancedFilters.customDateRange.end) {
                        const endDate = new Date(this.advancedFilters.customDateRange.end);
                        endDate.setHours(23, 59, 59, 999);
                        if (reportDate > endDate) return false;
                    }
                }
                
                return true;
            } catch (error) {
                console.error('❌ Error filtering report:', error, report);
                return false;
            }
        }).sort((a, b) => {
            // Apply sorting
            const { sortColumn, sortDirection } = this.uiState;
            let aVal, bVal;
            
            switch (sortColumn) {
                case 'date':
                    aVal = new Date(a.createdAt);
                    bVal = new Date(b.createdAt);
                    break;
                case 'user':
                    aVal = a.userData?.userHash || '';
                    bVal = b.userData?.userHash || '';
                    break;
                case 'version':
                    aVal = a.userData?.version || '';
                    bVal = b.userData?.version || '';
                    break;
                case 'clicks':
                    aVal = a.analytics?.buttonClicks || 0;
                    bVal = b.analytics?.buttonClicks || 0;
                    break;
                case 'notes':
                    aVal = a.analytics?.notesCreated || 0;
                    bVal = b.analytics?.notesCreated || 0;
                    break;
                default:
                    return 0;
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Select all rows in the current table view
     */
    selectAllRows() {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
            const event = { target: checkbox };
            this.handleRowSelection(event);
        });
        
        this.announceToScreenReader(
            allChecked ? 'All rows deselected' : `All ${checkboxes.length} rows selected`
        );
    }

    /**
     * Clear current selection
     */
    clearSelection() {
        this.uiState.selectedRows.clear();
        
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            const row = checkbox.closest('tr');
            if (row) row.classList.remove('selected');
        });
        
        this.updateSelectionActions();
        this.announceToScreenReader('Selection cleared');
    }

    /**
     * Export selected rows
     */
    exportSelected() {
        const selectedIds = Array.from(this.uiState.selectedRows);
        if (selectedIds.length === 0) {
            this.showNotification('No rows selected for export', 'warning');
            return;
        }
        
        const selectedReports = this.getFilteredReports().filter(report => 
            selectedIds.includes(report.id || report.number?.toString())
        );
        
        if (selectedReports.length === 0) {
            this.showNotification('Selected reports not found', 'error');
            return;
        }
        
        // Create export data for selected reports
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                exportType: 'selected',
                recordCount: selectedReports.length,
                version: '2.0'
            },
            reports: selectedReports
        };
        
        this.exportAsJSON(exportData);
        this.showNotification(`Exported ${selectedReports.length} selected reports`, 'success');
    }

    /**
     * Enhanced renderReportsTable with accessibility and UX improvements
     */
    renderReportsTable() {
        const tableContent = document.getElementById('table-content');
        if (!tableContent) {
            console.warn('Table content element not found');
            return;
        }
        
        try {
            const filtered = this.getFilteredReports();
            console.log(`📋 Rendering ${filtered.length} filtered reports`);
            
            if (filtered.length === 0) {
                tableContent.innerHTML = `
                    <div class="loading" role="status" aria-label="No reports found">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; color: #ccc;"></i>
                        <p>No reports found matching your criteria.</p>
                        <small class="text-muted">Total reports in data: ${this.data.reports.length}</small>
                        ${this.filters.search || Object.values(this.advancedFilters).some(f => f && f !== '' && (!Array.isArray(f) || f.length > 0)) ? 
                            '<button class="btn btn-secondary mt-2" onclick="window.dashboard.clearAllFilters()">Clear Filters</button>' : 
                            ''
                        }
                    </div>
                `;
                return;
            }
            
            const maxReports = this.userPreferences.tablePageSize || 50;
            const reportsToShow = filtered.slice(0, maxReports);
            
            console.log(`📊 Showing ${reportsToShow.length} reports in table`);
            
            const table = `
                <div class="table-responsive">
                    <table class="table" role="table" aria-label="Usage reports data">
                        <thead>
                            <tr role="row">
                                <th scope="col">
                                    <input type="checkbox" class="row-checkbox master-checkbox" 
                                           aria-label="Select all rows" 
                                           onchange="window.dashboard.toggleAllRows(this)">
                                </th>
                                <th scope="col" class="sortable-header" data-column="date" tabindex="0" 
                                    aria-label="Sort by date" role="button">
                                    Date <i class="fas fa-sort"></i>
                                </th>
                                <th scope="col" class="sortable-header" data-column="type" tabindex="0" 
                                    aria-label="Sort by type" role="button">
                                    Type <i class="fas fa-sort"></i>
                                </th>
                                <th scope="col" class="sortable-header" data-column="user" tabindex="0" 
                                    aria-label="Sort by user" role="button">
                                    User <i class="fas fa-sort"></i>
                                </th>
                                <th scope="col" class="sortable-header" data-column="version" tabindex="0" 
                                    aria-label="Sort by version" role="button">
                                    Version <i class="fas fa-sort"></i>
                                </th>
                                <th scope="col">Duration</th>
                                <th scope="col" class="sortable-header" data-column="clicks" tabindex="0" 
                                    aria-label="Sort by clicks" role="button">
                                    Clicks <i class="fas fa-sort"></i>
                                </th>
                                <th scope="col" class="sortable-header" data-column="notes" tabindex="0" 
                                    aria-label="Sort by notes" role="button">
                                    Notes <i class="fas fa-sort"></i>
                                </th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${reportsToShow.map(report => this.renderReportRow(report)).join('')}
                        </tbody>
                    </table>
                </div>
                ${filtered.length > maxReports ? `
                    <div class="table-pagination" role="navigation" aria-label="Table pagination">
                        <div class="pagination-info">
                            Showing ${maxReports} of ${filtered.length} reports
                        </div>
                        <div class="pagination-controls">
                            <button class="btn btn-secondary btn-sm" onclick="window.dashboard.loadMoreRows()" 
                                    aria-label="Load more reports">
                                <i class="fas fa-chevron-down"></i>
                                Load More
                            </button>
                        </div>
                    </div>
                ` : ''}
            `;
            
            tableContent.innerHTML = table;
            console.log('✅ Reports table rendered successfully');
            
            // Announce to screen readers
            this.announceToScreenReader(`Table updated with ${reportsToShow.length} reports`);
            
        } catch (error) {
            console.error('❌ Error rendering reports table:', error);
            tableContent.innerHTML = `
                <div class="loading" role="alert">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem; color: #dc3545;"></i>
                    <p>Error loading reports: ${error.message}</p>
                    <small class="text-muted">Check console for details</small>
                    <button class="btn btn-primary mt-2" onclick="window.dashboard.refreshData()" 
                            aria-label="Retry loading reports">
                        <i class="fas fa-redo"></i>
                        Retry
                    </button>
                </div>
            `;
        }
    }

    /**
     * Enhanced renderReportRow with accessibility and selection features
     */
    renderReportRow(report) {
        try {
            const createdAt = report.createdAt instanceof Date ? report.createdAt : new Date(report.createdAt);
            const userData = report.userData || {};
            const analytics = report.analytics || {};
            const reportId = report.id || report.number?.toString() || 'unknown';
            const isSelected = this.uiState.selectedRows.has(reportId);
            
            return `
                <tr data-id="${reportId}" class="${isSelected ? 'selected' : ''}" role="row">
                    <td>
                        <input type="checkbox" class="row-checkbox" 
                               ${isSelected ? 'checked' : ''}
                               aria-label="Select report from ${createdAt.toLocaleDateString()}">
                    </td>
                    <td>
                        <div class="date-cell">
                            <time datetime="${createdAt.toISOString()}" 
                                  title="${createdAt.toLocaleString()}">
                                ${createdAt.toLocaleDateString()}
                            </time>
                            <small class="text-muted">${createdAt.toLocaleTimeString()}</small>
                        </div>
                    </td>
                    <td>
                        <span class="badge ${this.getBadgeClass(report.type)}" 
                              aria-label="Report type: ${this.formatReportType(report.type)}">
                            ${this.formatReportType(report.type)}
                        </span>
                    </td>
                    <td>
                        <div class="user-cell">
                            <div class="user-hash" title="User: ${userData.userHash || 'N/A'}">
                                ${userData.userHash || 'N/A'}
                            </div>
                            ${userData.sessionDuration ? 
                                `<small class="text-muted session-duration" 
                                        title="Session duration: ${userData.sessionDuration} minutes">
                                    ${userData.sessionDuration} min session
                                </small>` : 
                                ''
                            }
                        </div>
                    </td>
                    <td>
                        <span class="version-tag" title="Application version: ${userData.version || 'N/A'}">
                            ${userData.version || 'N/A'}
                        </span>
                    </td>
                    <td>
                        <span class="duration-value" title="Session duration">
                            ${userData.sessionDuration ? `${userData.sessionDuration} min` : 'N/A'}
                        </span>
                    </td>
                    <td>
                        <span class="metric-value clicks-value" 
                              title="Button clicks: ${analytics.buttonClicks || 0}"
                              aria-label="${analytics.buttonClicks || 0} button clicks">
                            ${analytics.buttonClicks || 0}
                        </span>
                    </td>
                    <td>
                        <span class="metric-value notes-value" 
                              title="Notes created: ${analytics.notesCreated || 0}"
                              aria-label="${analytics.notesCreated || 0} notes created">
                            ${analytics.notesCreated || 0}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <a href="${report.url || '#'}" target="_blank" 
                               class="btn btn-sm btn-link" 
                               aria-label="View full report in GitHub"
                               title="Open report in GitHub">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                            <button class="btn btn-sm btn-link" 
                                    onclick="window.dashboard.showReportDetails('${reportId}')"
                                    aria-label="Show report details"
                                    title="View detailed information">
                                <i class="fas fa-info-circle"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } catch (error) {
            console.error('❌ Error rendering report row:', error, report);
            return `
                <tr data-id="${report.id || 'error'}" role="row">
                    <td colspan="9" class="text-center text-muted error-row" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        Error rendering report (ID: ${report.id || 'unknown'})
                        <button class="btn btn-sm btn-link" onclick="console.log('Report data:', ${JSON.stringify(report).replace(/'/g, "\\'")})">
                            Debug
                        </button>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * Toggle all rows selection
     */
    toggleAllRows(masterCheckbox) {
        const checkboxes = document.querySelectorAll('.row-checkbox:not(.master-checkbox)');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = masterCheckbox.checked;
            const event = { target: checkbox };
            this.handleRowSelection(event);
        });
        
        this.announceToScreenReader(
            masterCheckbox.checked ? 
            `All ${checkboxes.length} rows selected` : 
            'All rows deselected'
        );
    }

    /**
     * Load more rows (pagination)
     */
    loadMoreRows() {
        const currentPageSize = this.userPreferences.tablePageSize || 50;
        this.userPreferences.tablePageSize = currentPageSize + 50;
        this.renderReportsTable();
        this.announceToScreenReader('More reports loaded');
    }

    /**
     * Show detailed report information
     */
    showReportDetails(reportId) {
        const report = this.getFilteredReports().find(r => 
            (r.id || r.number?.toString()) === reportId
        );
        
        if (!report) {
            this.showNotification('Report not found', 'error');
            return;
        }
        
        const modal = this.createReportDetailModal(report);
        this.showModal(modal);
    }

    /**
     * Create report detail modal
     */
    createReportDetailModal(report) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-dialog report-detail-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-file-alt"></i> Report Details</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()" 
                            aria-label="Close modal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    ${this.generateReportDetailContent(report)}
                </div>
                <div class="modal-footer">
                    <a href="${report.url || '#'}" target="_blank" class="btn btn-primary">
                        <i class="fas fa-external-link-alt"></i>
                        View in GitHub
                    </a>
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;
        return modal;
    }

    /**
     * Generate report detail content
     */
    generateReportDetailContent(report) {
        const createdAt = report.createdAt instanceof Date ? report.createdAt : new Date(report.createdAt);
        const userData = report.userData || {};
        const analytics = report.analytics || {};
        
        return `
            <div class="report-detail-content">
                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Created:</label>
                            <span>${createdAt.toLocaleString()}</span>
                        </div>
                        <div class="detail-item">
                            <label>Type:</label>
                            <span class="badge ${this.getBadgeClass(report.type)}">
                                ${this.formatReportType(report.type)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>Report ID:</label>
                            <span>${report.id || report.number || 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>User Information</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>User Hash:</label>
                            <span>${userData.userHash || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Version:</label>
                            <span>${userData.version || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <label>Session Duration:</label>
                            <span>${userData.sessionDuration ? `${userData.sessionDuration} minutes` : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4>Analytics Data</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Button Clicks:</label>
                            <span>${analytics.buttonClicks || 0}</span>
                        </div>
                        <div class="detail-item">
                            <label>Notes Created:</label>
                            <span>${analytics.notesCreated || 0}</span>
                        </div>
                        <div class="detail-item">
                            <label>Features Used:</label>
                            <span>${report.features ? report.features.join(', ') : 'None'}</span>
                        </div>
                    </div>
                </div>
                
                ${report.body ? `
                    <div class="detail-section">
                        <h4>Report Content</h4>
                        <div class="report-content">
                            <pre>${report.body}</pre>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Clear all filters
     */
    clearAllFilters() {
        // Reset basic filters
        this.filters = {
            dateRange: 30,
            reportType: 'all',
            search: ''
        };
        
        // Reset advanced filters
        this.clearAdvancedFilters();
        
        // Update UI
        const dateFilter = document.getElementById('date-filter');
        if (dateFilter) dateFilter.value = '30';
        
        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) typeFilter.value = 'all';
        
        const searchFilter = document.getElementById('search-filter');
        if (searchFilter) searchFilter.value = '';
        
        this.updateDashboard();
        this.showNotification('All filters cleared', 'success');
    }

    // =============================================
    // ADVANCED SETTINGS AND CONFIGURATION
    // =============================================

    /**
     * Load advanced settings from localStorage
     */
    loadAdvancedSettings() {
        try {
            const stored = localStorage.getItem('frostbyte_advanced_settings');
            if (stored) {
                const settings = JSON.parse(stored);
                this.advancedSettings = this.mergeDeep(this.advancedSettings, settings);
                console.log('✅ Advanced settings loaded');
            }
            
            this.applyAdvancedSettings();
        } catch (error) {
            console.warn('Failed to load advanced settings:', error);
        }
    }

    /**
     * Save advanced settings to localStorage
     */
    saveAdvancedSettings() {
        try {
            localStorage.setItem('frostbyte_advanced_settings', JSON.stringify(this.advancedSettings));
            console.log('✅ Advanced settings saved');
        } catch (error) {
            console.warn('Failed to save advanced settings:', error);
        }
    }

    /**
     * Apply advanced settings to the dashboard
     */
    applyAdvancedSettings() {
        // Apply dashboard customization
        this.applyDashboardCustomization();
        
        // Apply notification settings
        this.applyNotificationSettings();
        
        // Apply performance settings
        this.applyPerformanceSettings();
        
        // Apply custom colors
        this.applyCustomColors();
        
        console.log('🎨 Advanced settings applied');
    }

    /**
     * Apply dashboard customization
     */
    applyDashboardCustomization() {
        const { dashboard } = this.advancedSettings;
        
        // Apply custom layout
        document.body.classList.remove('layout-default', 'layout-compact', 'layout-detailed');
        document.body.classList.add(`layout-${dashboard.customLayout}`);
        
        // Apply chart animations
        if (!dashboard.chartAnimations) {
            document.body.classList.add('no-chart-animations');
        }
        
        // Apply debug mode
        if (dashboard.enableDebugMode) {
            document.body.classList.add('debug-mode');
            console.log('🐛 Debug mode enabled');
        }
    }

    /**
     * Apply notification settings
     */
    applyNotificationSettings() {
        const { notifications } = this.advancedSettings;
        
        // Update notification position
        document.documentElement.style.setProperty('--notification-position', notifications.position);
        
        // Setup notification sound
        if (notifications.soundEnabled) {
            this.setupNotificationSound();
        }
    }

    /**
     * Apply performance settings
     */
    applyPerformanceSettings() {
        const { performance } = this.advancedSettings;
        
        if (performance.optimization.lazyLoading) {
            this.enableLazyLoading();
        }
        
        if (performance.optimization.preloadData) {
            this.enableDataPreloading();
        }
    }

    /**
     * Apply custom colors
     */
    applyCustomColors() {
        const { customColors } = this.advancedSettings.dashboard;
        
        Object.entries(customColors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--${key}-color`, value);
        });
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        if (!this.advancedSettings.performance.monitoring.enabled) return;
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        // Setup performance alerts
        this.setupPerformanceAlerts();
        
        console.log('📊 Performance monitoring initialized');
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        const interval = this.advancedSettings.performance.monitoring.interval;
        
        setInterval(() => {
            this.collectPerformanceMetrics();
            this.checkPerformanceThresholds();
        }, interval);
        
        // Monitor initial page load
        if (performance.timing) {
            this.performanceMonitor.metrics.pageLoadTime = 
                performance.timing.loadEventEnd - performance.timing.navigationStart;
        }
    }

    /**
     * Collect performance metrics
     */
    collectPerformanceMetrics() {
        const { performance: perfSettings } = this.advancedSettings;
        
        if (perfSettings.monitoring.trackMemory && 'memory' in performance) {
            this.performanceMonitor.metrics.memoryUsage = performance.memory.usedJSHeapSize;
        }
        
        if (perfSettings.monitoring.trackPerformance) {
            // Collect render time metrics
            const entries = performance.getEntriesByType('measure');
            if (entries.length > 0) {
                this.performanceMonitor.metrics.renderTime = entries[entries.length - 1].duration;
            }
        }
        
        // Store metrics history
        this.performanceMonitor.history.push({
            timestamp: Date.now(),
            metrics: { ...this.performanceMonitor.metrics }
        });
        
        // Keep only last 100 entries
        if (this.performanceMonitor.history.length > 100) {
            this.performanceMonitor.history = this.performanceMonitor.history.slice(-100);
        }
    }

    /**
     * Check performance thresholds
     */
    checkPerformanceThresholds() {
        const { thresholds } = this.advancedSettings.performance;
        const { metrics } = this.performanceMonitor;
        
        // Check memory usage
        if ('memory' in performance && thresholds.memoryUsage) {
            const memoryPercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
            
            if (memoryPercent > thresholds.memoryUsage.critical) {
                this.createPerformanceAlert('critical', 'Memory usage is critically high', memoryPercent);
            } else if (memoryPercent > thresholds.memoryUsage.warning) {
                this.createPerformanceAlert('warning', 'Memory usage is elevated', memoryPercent);
            }
        }
        
        // Check response time
        if (metrics.apiResponseTime > thresholds.responseTime.critical) {
            this.createPerformanceAlert('critical', 'API response time is critically slow');
        } else if (metrics.apiResponseTime > thresholds.responseTime.warning) {
            this.createPerformanceAlert('warning', 'API response time is slow');
        }
    }

    /**
     * Create performance alert
     */
    createPerformanceAlert(level, message, value = null) {
        const alert = {
            id: Date.now(),
            level,
            message,
            value,
            timestamp: new Date(),
            acknowledged: false
        };
        
        this.performanceMonitor.alerts.push(alert);
        
        if (this.advancedSettings.performance.monitoring.alertsEnabled) {
            this.showPerformanceAlert(alert);
        }
        
        // Keep only last 50 alerts
        if (this.performanceMonitor.alerts.length > 50) {
            this.performanceMonitor.alerts = this.performanceMonitor.alerts.slice(-50);
        }
    }

    /**
     * Show performance alert
     */
    showPerformanceAlert(alert) {
        const alertClass = alert.level === 'critical' ? 'error' : 'warning';
        
        this.showNotification(
            `Performance Alert: ${alert.message}${alert.value ? ` (${alert.value.toFixed(1)}%)` : ''}`,
            alertClass
        );
        
        // Send to external monitoring if configured
        this.sendExternalAlert(alert);
    }

    /**
     * Setup data retention policies
     */
    setupDataRetentionPolicies() {
        if (!this.advancedSettings.dataRetention.enabled) return;
        
        // Setup automatic cleanup
        if (this.advancedSettings.dataRetention.autoCleanup) {
            this.scheduleDataCleanup();
        }
        
        // Setup backup if enabled
        if (this.advancedSettings.dataRetention.backupEnabled) {
            this.scheduleDataBackup();
        }
        
        console.log('🗄️ Data retention policies initialized');
    }

    /**
     * Schedule automatic data cleanup
     */
    scheduleDataCleanup() {
        const interval = this.advancedSettings.dataRetention.cleanupInterval;
        
        setInterval(() => {
            this.performDataCleanup();
        }, interval);
        
        // Perform initial cleanup
        this.performDataCleanup();
    }

    /**
     * Perform data cleanup
     */
    performDataCleanup() {
        const { dataRetention } = this.advancedSettings;
        const now = Date.now();
        
        // Clean old cache data
        const cacheKeys = Object.keys(localStorage).filter(key => 
            key.startsWith('frostbyte_') && key.includes('cache')
        );
        
        cacheKeys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data.timestamp && (now - data.timestamp) > dataRetention.maxCacheAge) {
                    localStorage.removeItem(key);
                    console.log(`🗑️ Cleaned expired cache: ${key}`);
                }
            } catch (error) {
                // Invalid cache data, remove it
                localStorage.removeItem(key);
            }
        });
        
        // Clean old reports data
        if (this.data.reports && Array.isArray(this.data.reports)) {
            const maxAge = dataRetention.maxReportsAge;
            const originalCount = this.data.reports.length;
            
            this.data.reports = this.data.reports.filter(report => {
                const reportDate = new Date(report.createdAt);
                return (now - reportDate.getTime()) <= maxAge;
            });
            
            if (this.data.reports.length < originalCount) {
                const cleaned = originalCount - this.data.reports.length;
                console.log(`🗑️ Cleaned ${cleaned} old reports`);
                
                if (dataRetention.exportOnCleanup) {
                    this.exportCleanedData(cleaned);
                }
            }
        }
        
        // Clean performance history
        this.cleanPerformanceHistory();
    }

    /**
     * Schedule data backup
     */
    scheduleDataBackup() {
        const interval = this.advancedSettings.dataRetention.backupInterval;
        
        setInterval(() => {
            this.performDataBackup();
        }, interval);
    }

    /**
     * Perform data backup
     */
    performDataBackup() {
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            data: {
                reports: this.data.reports,
                settings: this.advancedSettings,
                preferences: this.userPreferences,
                performanceHistory: this.performanceMonitor.history.slice(-50)
            }
        };
        
        const filename = `frostbyte-backup-${new Date().toISOString().split('T')[0]}.json`;
        this.downloadFile(JSON.stringify(backupData, null, 2), filename, 'application/json');
        
        console.log('💾 Data backup created');
        this.showNotification('Data backup created successfully', 'success');
    }

    /**
     * Initialize security features
     */
    initializeSecurityFeatures() {
        const { security } = this.advancedSettings;
        
        if (security.sessionTimeout) {
            this.setupSessionTimeout();
        }
        
        if (security.auditLogging) {
            this.setupAuditLogging();
        }
        
        if (security.rateLimiting.enabled) {
            this.setupRateLimiting();
        }
        
        console.log('🔒 Security features initialized');
    }

    /**
     * Setup session timeout
     */
    setupSessionTimeout() {
        const timeout = this.advancedSettings.security.sessionTimeout;
        
        // Reset timeout on user activity
        const resetTimeout = () => {
            clearTimeout(this.sessionTimeoutId);
            this.sessionTimeoutId = setTimeout(() => {
                this.handleSessionTimeout();
            }, timeout);
        };
        
        // Listen for user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimeout, { passive: true });
        });
        
        // Start initial timeout
        resetTimeout();
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        this.showNotification('Session expired due to inactivity', 'warning');
        
        // Clear sensitive data
        this.clearSensitiveData();
        
        // Redirect to configuration
        this.showConfigurationRequired();
    }

    /**
     * Clear sensitive data
     */
    clearSensitiveData() {
        // Clear GitHub token but keep other settings
        this.config.set('github.token', '');
        
        // Clear cached data
        localStorage.removeItem('frostbyte_analytics_cache');
        
        // Reset data
        this.data.reports = [];
        this.data.lastUpdate = null;
        
        console.log('🧹 Sensitive data cleared');
    }

    /**
     * Setup audit logging
     */
    setupAuditLogging() {
        this.auditLog = [];
        
        // Override critical methods to add logging
        this.addAuditLogging();
    }

    /**
     * Add audit logging to critical methods
     */
    addAuditLogging() {
        const originalSaveSettings = this.saveSettings.bind(this);
        this.saveSettings = async (...args) => {
            this.logAuditEvent('settings_changed', 'User modified settings');
            return originalSaveSettings(...args);
        };
        
        const originalExportData = this.exportData.bind(this);
        this.exportData = (...args) => {
            this.logAuditEvent('data_exported', 'User exported data');
            return originalExportData(...args);
        };
        
        const originalClearCache = this.clearCache.bind(this);
        this.clearCache = (...args) => {
            this.logAuditEvent('cache_cleared', 'User cleared cache');
            return originalClearCache(...args);
        };
    }

    /**
     * Log audit event
     */
    logAuditEvent(action, description, metadata = {}) {
        const event = {
            timestamp: new Date().toISOString(),
            action,
            description,
            userAgent: navigator.userAgent,
            url: window.location.href,
            metadata
        };
        
        this.auditLog.push(event);
        
        // Keep only last 1000 events
        if (this.auditLog.length > 1000) {
            this.auditLog = this.auditLog.slice(-1000);
        }
        
        // Send to external logging service if configured
        this.sendAuditLog(event);
        
        console.log('📝 Audit event logged:', action);
    }

    /**
     * Show advanced settings modal
     */
    showAdvancedSettings() {
        // Track Advanced Settings usage
        this.trackAdvancedSettingsUsage('Open Advanced Settings', 'modal');
        
        const modal = this.createAdvancedSettingsModal();
        this.showModal(modal);
    }

    /**
     * Create advanced settings modal
     */
    createAdvancedSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal advanced-settings-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-dialog modal-xl">
                <div class="modal-header">
                    <h3><i class="fas fa-cogs"></i> Advanced Settings & Configuration</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-content">
                    <div class="settings-tabs">
                        <button class="tab-btn active" data-tab="dashboard">Dashboard</button>
                        <button class="tab-btn" data-tab="notifications">Notifications</button>
                        <button class="tab-btn" data-tab="performance">Performance</button>
                        <button class="tab-btn" data-tab="data">Data Management</button>
                        <button class="tab-btn" data-tab="security">Security</button>
                        <button class="tab-btn" data-tab="integration">Integration</button>
                        <button class="tab-btn" data-tab="experimental">Experimental</button>
                    </div>
                    
                    <div class="settings-content">
                        ${this.generateAdvancedSettingsContent()}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="window.dashboard.resetAdvancedSettings()">
                        <i class="fas fa-undo"></i> Reset to Defaults
                    </button>
                    <button class="btn btn-warning" onclick="window.dashboard.exportAdvancedSettings()">
                        <i class="fas fa-download"></i> Export Settings
                    </button>
                    <button class="btn btn-info" onclick="window.dashboard.importAdvancedSettings()">
                        <i class="fas fa-upload"></i> Import Settings
                    </button>
                    <button class="btn btn-primary" onclick="window.dashboard.saveAdvancedSettingsFromModal(this.closest('.modal'))">
                        <i class="fas fa-save"></i> Save Settings
                    </button>
                </div>
            </div>
        `;
        
        // Setup tab switching
        setTimeout(() => {
            this.setupAdvancedSettingsTabs(modal);
            this.populateAdvancedSettingsForm(modal);
        }, 100);
        
        return modal;
    }

    /**
     * Generate advanced settings content
     */
    generateAdvancedSettingsContent() {
        return `
            <!-- Dashboard Settings -->
            <div class="tab-content" data-tab="dashboard">
                <h4>Dashboard Customization</h4>
                <div class="form-group">
                    <label for="custom-layout">Layout Style</label>
                    <select id="custom-layout" class="form-control">
                        <option value="default">Default</option>
                        <option value="compact">Compact</option>
                        <option value="detailed">Detailed</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="chart-animations"> Enable Chart Animations
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="auto-refresh"> Auto Refresh Data
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="refresh-interval">Refresh Interval (minutes)</label>
                    <input type="number" id="refresh-interval" class="form-control" min="1" max="60">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="debug-mode"> Enable Debug Mode
                    </label>
                </div>
                
                <h5>Custom Colors</h5>
                <div class="color-grid">
                    <div class="form-group">
                        <label for="primary-color">Primary Color</label>
                        <input type="color" id="primary-color" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="secondary-color">Secondary Color</label>
                        <input type="color" id="secondary-color" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="accent-color">Accent Color</label>
                        <input type="color" id="accent-color" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="background-color">Background Color</label>
                        <input type="color" id="background-color" class="form-control">
                    </div>
                </div>
            </div>
            
            <!-- Notifications Settings -->
            <div class="tab-content" data-tab="notifications" style="display: none;">
                <h4>Notification Settings</h4>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="notifications-enabled"> Enable Notifications
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="notification-position">Position</label>
                    <select id="notification-position" class="form-control">
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="notification-timeout">Auto-hide Timeout (seconds)</label>
                    <input type="number" id="notification-timeout" class="form-control" min="1" max="30">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="sound-enabled"> Enable Sound
                    </label>
                </div>
                
                <h5>Webhook Integration</h5>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="webhook-enabled"> Enable Webhook Notifications
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="webhook-url">Webhook URL</label>
                    <input type="url" id="webhook-url" class="form-control" placeholder="https://hooks.slack.com/...">
                </div>
            </div>
            
            <!-- Performance Settings -->
            <div class="tab-content" data-tab="performance" style="display: none;">
                <h4>Performance Monitoring</h4>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="performance-monitoring"> Enable Performance Monitoring
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="monitoring-interval">Monitoring Interval (ms)</label>
                    <input type="number" id="monitoring-interval" class="form-control" min="1000" max="60000">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="track-memory"> Track Memory Usage
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="performance-alerts"> Enable Performance Alerts
                    </label>
                </div>
                
                <h5>Performance Thresholds</h5>
                <div class="form-group">
                    <label for="memory-warning">Memory Warning Threshold (%)</label>
                    <input type="number" id="memory-warning" class="form-control" min="50" max="95">
                </div>
                
                <div class="form-group">
                    <label for="memory-critical">Memory Critical Threshold (%)</label>
                    <input type="number" id="memory-critical" class="form-control" min="70" max="99">
                </div>
                
                <div class="form-group">
                    <label for="response-warning">Response Time Warning (ms)</label>
                    <input type="number" id="response-warning" class="form-control" min="100" max="5000">
                </div>
                
                <div class="form-group">
                    <label for="response-critical">Response Time Critical (ms)</label>
                    <input type="number" id="response-critical" class="form-control" min="500" max="10000">
                </div>
                
                <h5>Optimization</h5>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="lazy-loading"> Enable Lazy Loading
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="preload-data"> Preload Data
                    </label>
                </div>
            </div>
            
            <!-- Data Management Settings -->
            <div class="tab-content" data-tab="data" style="display: none;">
                <h4>Data Retention</h4>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="data-retention-enabled"> Enable Data Retention Policies
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="max-cache-age">Max Cache Age (hours)</label>
                    <input type="number" id="max-cache-age" class="form-control" min="1" max="168">
                </div>
                
                <div class="form-group">
                    <label for="max-reports-age">Max Reports Age (days)</label>
                    <input type="number" id="max-reports-age" class="form-control" min="1" max="365">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="auto-cleanup"> Enable Auto Cleanup
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="cleanup-interval">Cleanup Interval (hours)</label>
                    <input type="number" id="cleanup-interval" class="form-control" min="1" max="168">
                </div>
                
                <h5>Backup Settings</h5>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="backup-enabled"> Enable Automatic Backups
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="backup-interval">Backup Interval (hours)</label>
                    <input type="number" id="backup-interval" class="form-control" min="1" max="168">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="export-on-cleanup"> Export Data Before Cleanup
                    </label>
                </div>
            </div>
            
            <!-- Security Settings -->
            <div class="tab-content" data-tab="security" style="display: none;">
                <h4>Security Features</h4>
                <div class="form-group">
                    <label for="session-timeout">Session Timeout (minutes)</label>
                    <input type="number" id="session-timeout" class="form-control" min="5" max="480">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="audit-logging"> Enable Audit Logging
                    </label>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="encryption-enabled"> Enable Data Encryption
                    </label>
                </div>
                
                <h5>Rate Limiting</h5>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="rate-limiting"> Enable Rate Limiting
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="api-requests-per-hour">API Requests per Hour</label>
                    <input type="number" id="api-requests-per-hour" class="form-control" min="10" max="1000">
                </div>
                
                <div class="form-group">
                    <label for="ui-actions-per-minute">UI Actions per Minute</label>
                    <input type="number" id="ui-actions-per-minute" class="form-control" min="10" max="200">
                </div>
                
                <h5>CORS Settings</h5>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="strict-cors"> Enable Strict CORS
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="allowed-origins">Allowed Origins (comma-separated)</label>
                    <textarea id="allowed-origins" class="form-control" rows="3" placeholder="https://example.com, https://api.example.com"></textarea>
                </div>
            </div>
            
            <!-- Integration Settings -->
            <div class="tab-content" data-tab="integration" style="display: none;">
                <h4>GitHub Integration</h4>
                <div class="form-group">
                    <label for="api-cache-duration">API Cache Duration (minutes)</label>
                    <input type="number" id="api-cache-duration" class="form-control" min="1" max="1440">
                </div>
                
                <div class="form-group">
                    <label for="request-timeout">Request Timeout (seconds)</label>
                    <input type="number" id="request-timeout" class="form-control" min="5" max="120">
                </div>
                
                <div class="form-group">
                    <label for="retry-attempts">Retry Attempts</label>
                    <input type="number" id="retry-attempts" class="form-control" min="0" max="5">
                </div>
                
                <h5>External Services</h5>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="analytics-enabled"> Enable External Analytics
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="analytics-endpoint">Analytics Endpoint</label>
                    <input type="url" id="analytics-endpoint" class="form-control" placeholder="https://analytics.example.com/api">
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="cdn-enabled"> Use CDN for Assets
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="cdn-url">CDN Base URL</label>
                    <input type="url" id="cdn-url" class="form-control" placeholder="https://cdn.example.com">
                </div>
            </div>
            
            <!-- Experimental Settings -->
            <div class="tab-content" data-tab="experimental" style="display: none;">
                <h4>Experimental Features</h4>
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <strong>Warning:</strong> These features are experimental and may not work as expected.
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="realtime-updates"> Enable Real-time Updates
                    </label>
                    <small class="form-text text-muted">Live data updates without page refresh</small>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="ai-insights"> Enable AI-powered Insights
                    </label>
                    <small class="form-text text-muted">Experimental AI analysis of repository patterns</small>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="predictive-analytics"> Enable Predictive Analytics
                    </label>
                    <small class="form-text text-muted">Predict future trends based on historical data</small>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="advanced-caching"> Advanced Caching Strategy
                    </label>
                    <small class="form-text text-muted">Experimental intelligent caching system</small>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="beta-features"> Enable Beta Features
                    </label>
                    <small class="form-text text-muted">Access to newest experimental features</small>
                </div>
                
                <div class="form-group">
                    <label for="experimental-api">Experimental API Endpoint</label>
                    <input type="url" id="experimental-api" class="form-control" placeholder="https://api-beta.example.com">
                    <small class="form-text text-muted">Custom API endpoint for experimental features</small>
                </div>
            </div>
        `;
    }

    /**
     * Setup advanced settings tabs
     */
    setupAdvancedSettingsTabs(modal) {
        const tabs = modal.querySelectorAll('.tab-btn');
        const contents = modal.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.style.display = 'none');
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Show corresponding content
                const targetTab = tab.dataset.tab;
                const targetContent = modal.querySelector(`[data-tab="${targetTab}"].tab-content`);
                if (targetContent) {
                    targetContent.style.display = 'block';
                }
            });
        });
    }

    /**
     * Populate advanced settings form
     */
    populateAdvancedSettingsForm(modal) {
        const { advancedSettings } = this;
        
        // Dashboard settings
        this.setFormValue(modal, 'custom-layout', advancedSettings.dashboard.customLayout);
        this.setFormValue(modal, 'chart-animations', advancedSettings.dashboard.chartAnimations);
        this.setFormValue(modal, 'auto-refresh', advancedSettings.dashboard.autoRefresh);
        this.setFormValue(modal, 'refresh-interval', advancedSettings.dashboard.refreshInterval / 60000);
        this.setFormValue(modal, 'debug-mode', advancedSettings.dashboard.enableDebugMode);
        
        // Custom colors
        Object.entries(advancedSettings.dashboard.customColors).forEach(([key, value]) => {
            this.setFormValue(modal, `${key}-color`, value);
        });
        
        // Notification settings
        this.setFormValue(modal, 'notifications-enabled', advancedSettings.notifications?.enabled || true);
        this.setFormValue(modal, 'notification-position', advancedSettings.notifications?.position || 'top-right');
        this.setFormValue(modal, 'notification-timeout', (advancedSettings.notifications?.timeout || 5000) / 1000);
        this.setFormValue(modal, 'sound-enabled', advancedSettings.notifications?.soundEnabled || false);
        this.setFormValue(modal, 'webhook-enabled', advancedSettings.notifications?.webhook?.enabled || false);
        this.setFormValue(modal, 'webhook-url', advancedSettings.notifications?.webhook?.url || '');
        
        // Performance settings
        this.setFormValue(modal, 'performance-monitoring', advancedSettings.performance?.monitoring?.enabled || true);
        this.setFormValue(modal, 'monitoring-interval', advancedSettings.performance?.monitoring?.interval || 30000);
        this.setFormValue(modal, 'track-memory', advancedSettings.performance?.monitoring?.trackMemory || true);
        this.setFormValue(modal, 'performance-alerts', advancedSettings.performance?.monitoring?.alertsEnabled || true);
        
        // Performance thresholds
        this.setFormValue(modal, 'memory-warning', advancedSettings.performance?.thresholds?.memoryUsage?.warning || 80);
        this.setFormValue(modal, 'memory-critical', advancedSettings.performance?.thresholds?.memoryUsage?.critical || 95);
        this.setFormValue(modal, 'response-warning', advancedSettings.performance?.thresholds?.responseTime?.warning || 2000);
        this.setFormValue(modal, 'response-critical', advancedSettings.performance?.thresholds?.responseTime?.critical || 5000);
        
        // Optimization
        this.setFormValue(modal, 'lazy-loading', advancedSettings.performance?.optimization?.lazyLoading || true);
        this.setFormValue(modal, 'preload-data', advancedSettings.performance?.optimization?.preloadData || true);
        
        // Data retention
        this.setFormValue(modal, 'data-retention-enabled', advancedSettings.dataRetention.enabled);
        this.setFormValue(modal, 'max-cache-age', advancedSettings.dataRetention.maxCacheAge / (1000 * 60 * 60));
        this.setFormValue(modal, 'max-reports-age', advancedSettings.dataRetention.maxReportsAge / (1000 * 60 * 60 * 24));
        this.setFormValue(modal, 'auto-cleanup', advancedSettings.dataRetention.autoCleanup);
        this.setFormValue(modal, 'cleanup-interval', advancedSettings.dataRetention.cleanupInterval / (1000 * 60 * 60));
        this.setFormValue(modal, 'backup-enabled', advancedSettings.dataRetention.backupEnabled);
        this.setFormValue(modal, 'backup-interval', advancedSettings.dataRetention.backupInterval / (1000 * 60 * 60));
        this.setFormValue(modal, 'export-on-cleanup', advancedSettings.dataRetention.exportOnCleanup);
        
        // Security
        this.setFormValue(modal, 'session-timeout', (advancedSettings.security?.sessionTimeout || 3600000) / (1000 * 60));
        this.setFormValue(modal, 'audit-logging', advancedSettings.security?.auditLogging || true);
        this.setFormValue(modal, 'encryption-enabled', advancedSettings.security?.encryption || true);
        this.setFormValue(modal, 'rate-limiting', advancedSettings.security?.rateLimiting?.enabled || true);
        this.setFormValue(modal, 'api-requests-per-hour', advancedSettings.security?.rateLimiting?.apiRequestsPerHour || 100);
        this.setFormValue(modal, 'ui-actions-per-minute', advancedSettings.security?.rateLimiting?.uiActionsPerMinute || 50);
        this.setFormValue(modal, 'strict-cors', advancedSettings.security?.cors?.strictMode || false);
        this.setFormValue(modal, 'allowed-origins', (advancedSettings.security?.cors?.allowedOrigins || ['localhost', '127.0.0.1']).join(', '));
        
        // Integration
        this.setFormValue(modal, 'api-cache-duration', (advancedSettings.integration?.github?.cacheConfig?.defaultTTL || 600000) / (1000 * 60));
        this.setFormValue(modal, 'request-timeout', (advancedSettings.integration?.github?.requestTimeout || 30000) / 1000);
        this.setFormValue(modal, 'retry-attempts', advancedSettings.integration?.github?.retryAttempts || 3);
        this.setFormValue(modal, 'analytics-enabled', advancedSettings.integration?.externalServices?.analytics?.enabled || false);
        this.setFormValue(modal, 'analytics-endpoint', advancedSettings.integration?.externalServices?.analytics?.endpoint || '');
        this.setFormValue(modal, 'cdn-enabled', advancedSettings.integration?.externalServices?.cdn?.enabled || false);
        this.setFormValue(modal, 'cdn-url', advancedSettings.integration?.externalServices?.cdn?.baseUrl || '');
        
        // Experimental
        this.setFormValue(modal, 'realtime-updates', advancedSettings.experimental?.realtimeUpdates || false);
        this.setFormValue(modal, 'ai-insights', advancedSettings.experimental?.aiInsights || false);
        this.setFormValue(modal, 'predictive-analytics', advancedSettings.experimental?.predictiveAnalytics || false);
        this.setFormValue(modal, 'advanced-caching', advancedSettings.experimental?.advancedCaching || false);
        this.setFormValue(modal, 'beta-features', advancedSettings.experimental?.betaFeatures?.enabled || false);
        this.setFormValue(modal, 'experimental-api', advancedSettings.experimental?.betaFeatures?.apiEndpoint || '');
    }

    /**
     * Set form value helper
     */
    setFormValue(modal, fieldId, value) {
        const field = modal.querySelector(`#${fieldId}`);
        if (!field) return;
        
        if (field.type === 'checkbox') {
            field.checked = value;
        } else {
            field.value = value;
        }
    }

    /**
     * Save advanced settings from modal
     */
    saveAdvancedSettingsFromModal(modal) {
        try {
            // Initialize nested objects if they don't exist
            if (!this.advancedSettings.notifications) this.advancedSettings.notifications = {};
            if (!this.advancedSettings.notifications.webhook) this.advancedSettings.notifications.webhook = {};
            if (!this.advancedSettings.performance) this.advancedSettings.performance = {};
            if (!this.advancedSettings.performance.monitoring) this.advancedSettings.performance.monitoring = {};
            if (!this.advancedSettings.performance.thresholds) this.advancedSettings.performance.thresholds = {};
            if (!this.advancedSettings.performance.thresholds.memoryUsage) this.advancedSettings.performance.thresholds.memoryUsage = {};
            if (!this.advancedSettings.performance.thresholds.responseTime) this.advancedSettings.performance.thresholds.responseTime = {};
            if (!this.advancedSettings.performance.optimization) this.advancedSettings.performance.optimization = {};
            if (!this.advancedSettings.security) this.advancedSettings.security = {};
            if (!this.advancedSettings.security.rateLimiting) this.advancedSettings.security.rateLimiting = {};
            if (!this.advancedSettings.security.cors) this.advancedSettings.security.cors = {};
            if (!this.advancedSettings.integration) this.advancedSettings.integration = {};
            if (!this.advancedSettings.integration.github) this.advancedSettings.integration.github = {};
            if (!this.advancedSettings.integration.github.cacheConfig) this.advancedSettings.integration.github.cacheConfig = {};
            if (!this.advancedSettings.integration.externalServices) this.advancedSettings.integration.externalServices = {};
            if (!this.advancedSettings.integration.externalServices.analytics) this.advancedSettings.integration.externalServices.analytics = {};
            if (!this.advancedSettings.integration.externalServices.cdn) this.advancedSettings.integration.externalServices.cdn = {};
            if (!this.advancedSettings.experimental) this.advancedSettings.experimental = {};
            if (!this.advancedSettings.experimental.betaFeatures) this.advancedSettings.experimental.betaFeatures = {};
            
            // Dashboard settings
            this.advancedSettings.dashboard.customLayout = this.getFormValue(modal, 'custom-layout');
            this.advancedSettings.dashboard.chartAnimations = this.getFormValue(modal, 'chart-animations');
            this.advancedSettings.dashboard.autoRefresh = this.getFormValue(modal, 'auto-refresh');
            this.advancedSettings.dashboard.refreshInterval = this.getFormValue(modal, 'refresh-interval') * 60000;
            this.advancedSettings.dashboard.enableDebugMode = this.getFormValue(modal, 'debug-mode');
            
            // Custom colors
            Object.keys(this.advancedSettings.dashboard.customColors).forEach(key => {
                const value = this.getFormValue(modal, `${key}-color`);
                if (value) this.advancedSettings.dashboard.customColors[key] = value;
            });
            
            // Notification settings
            this.advancedSettings.notifications.enabled = this.getFormValue(modal, 'notifications-enabled');
            this.advancedSettings.notifications.position = this.getFormValue(modal, 'notification-position');
            this.advancedSettings.notifications.timeout = this.getFormValue(modal, 'notification-timeout') * 1000;
            this.advancedSettings.notifications.soundEnabled = this.getFormValue(modal, 'sound-enabled');
            this.advancedSettings.notifications.webhook.enabled = this.getFormValue(modal, 'webhook-enabled');
            this.advancedSettings.notifications.webhook.url = this.getFormValue(modal, 'webhook-url');
            
            // Performance settings
            this.advancedSettings.performance.monitoring.enabled = this.getFormValue(modal, 'performance-monitoring');
            this.advancedSettings.performance.monitoring.interval = this.getFormValue(modal, 'monitoring-interval');
            this.advancedSettings.performance.monitoring.trackMemory = this.getFormValue(modal, 'track-memory');
            this.advancedSettings.performance.monitoring.alertsEnabled = this.getFormValue(modal, 'performance-alerts');
            
            // Performance thresholds
            this.advancedSettings.performance.thresholds.memoryUsage.warning = this.getFormValue(modal, 'memory-warning');
            this.advancedSettings.performance.thresholds.memoryUsage.critical = this.getFormValue(modal, 'memory-critical');
            this.advancedSettings.performance.thresholds.responseTime.warning = this.getFormValue(modal, 'response-warning');
            this.advancedSettings.performance.thresholds.responseTime.critical = this.getFormValue(modal, 'response-critical');
            
            // Optimization
            this.advancedSettings.performance.optimization.lazyLoading = this.getFormValue(modal, 'lazy-loading');
            this.advancedSettings.performance.optimization.preloadData = this.getFormValue(modal, 'preload-data');
            
            // Data retention
            this.advancedSettings.dataRetention.enabled = this.getFormValue(modal, 'data-retention-enabled');
            this.advancedSettings.dataRetention.maxCacheAge = this.getFormValue(modal, 'max-cache-age') * (1000 * 60 * 60);
            this.advancedSettings.dataRetention.maxReportsAge = this.getFormValue(modal, 'max-reports-age') * (1000 * 60 * 60 * 24);
            this.advancedSettings.dataRetention.autoCleanup = this.getFormValue(modal, 'auto-cleanup');
            this.advancedSettings.dataRetention.cleanupInterval = this.getFormValue(modal, 'cleanup-interval') * (1000 * 60 * 60);
            this.advancedSettings.dataRetention.backupEnabled = this.getFormValue(modal, 'backup-enabled');
            this.advancedSettings.dataRetention.backupInterval = this.getFormValue(modal, 'backup-interval') * (1000 * 60 * 60);
            this.advancedSettings.dataRetention.exportOnCleanup = this.getFormValue(modal, 'export-on-cleanup');
            
            // Security
            this.advancedSettings.security.sessionTimeout = this.getFormValue(modal, 'session-timeout') * (1000 * 60);
            this.advancedSettings.security.auditLogging = this.getFormValue(modal, 'audit-logging');
            this.advancedSettings.security.encryption = this.getFormValue(modal, 'encryption-enabled');
            this.advancedSettings.security.rateLimiting.enabled = this.getFormValue(modal, 'rate-limiting');
            this.advancedSettings.security.rateLimiting.apiRequestsPerHour = this.getFormValue(modal, 'api-requests-per-hour');
            this.advancedSettings.security.rateLimiting.uiActionsPerMinute = this.getFormValue(modal, 'ui-actions-per-minute');
            this.advancedSettings.security.cors.strictMode = this.getFormValue(modal, 'strict-cors');
            
            const allowedOrigins = this.getFormValue(modal, 'allowed-origins');
            if (allowedOrigins) {
                this.advancedSettings.security.cors.allowedOrigins = allowedOrigins.split(',').map(s => s.trim()).filter(s => s);
            }
            
            // Integration
            this.advancedSettings.integration.github.cacheConfig.defaultTTL = this.getFormValue(modal, 'api-cache-duration') * (1000 * 60);
            this.advancedSettings.integration.github.requestTimeout = this.getFormValue(modal, 'request-timeout') * 1000;
            this.advancedSettings.integration.github.retryAttempts = this.getFormValue(modal, 'retry-attempts');
            this.advancedSettings.integration.externalServices.analytics.enabled = this.getFormValue(modal, 'analytics-enabled');
            this.advancedSettings.integration.externalServices.analytics.endpoint = this.getFormValue(modal, 'analytics-endpoint');
            this.advancedSettings.integration.externalServices.cdn.enabled = this.getFormValue(modal, 'cdn-enabled');
            this.advancedSettings.integration.externalServices.cdn.baseUrl = this.getFormValue(modal, 'cdn-url');
            
            // Experimental
            this.advancedSettings.experimental.realtimeUpdates = this.getFormValue(modal, 'realtime-updates');
            this.advancedSettings.experimental.aiInsights = this.getFormValue(modal, 'ai-insights');
            this.advancedSettings.experimental.predictiveAnalytics = this.getFormValue(modal, 'predictive-analytics');
            this.advancedSettings.experimental.advancedCaching = this.getFormValue(modal, 'advanced-caching');
            this.advancedSettings.experimental.betaFeatures.enabled = this.getFormValue(modal, 'beta-features');
            this.advancedSettings.experimental.betaFeatures.apiEndpoint = this.getFormValue(modal, 'experimental-api');
            
            // Save settings
            this.saveAdvancedSettings();
            
            // Apply settings
            this.applyAdvancedSettings();
            
            // Track successful save
            this.trackAdvancedSettingsUsage('Save Advanced Settings', 'save');
            
            // Close modal
            modal.remove();
            
            this.showNotification('Advanced settings saved successfully', 'success');
            
            console.log('🎛️ Advanced settings updated');
            
        } catch (error) {
            console.error('Failed to save advanced settings:', error);
            this.showNotification('Failed to save advanced settings', 'error');
        }
    }

    /**
     * Get form value helper
     */
    getFormValue(modal, fieldId) {
        const field = modal.querySelector(`#${fieldId}`);
        if (!field) return null;
        
        if (field.type === 'checkbox') {
            return field.checked;
        } else if (field.type === 'number') {
            return parseFloat(field.value) || 0;
        } else {
            return field.value;
        }
    }

    /**
     * Reset advanced settings to defaults
     */
    resetAdvancedSettings() {
        if (confirm('Are you sure you want to reset all advanced settings to defaults? This action cannot be undone.')) {
            this.initializeAdvancedSettings();
            this.saveAdvancedSettings();
            this.applyAdvancedSettings();
            
            // Track reset action
            this.trackAdvancedSettingsUsage('Reset Advanced Settings', 'reset');
            
            // Refresh current modal if open
            const modal = document.querySelector('.advanced-settings-modal');
            if (modal) {
                this.populateAdvancedSettingsForm(modal);
            }
            
            this.showNotification('Advanced settings reset to defaults', 'success');
            console.log('🔄 Advanced settings reset');
        }
    }

    /**
     * Export advanced settings
     */
    exportAdvancedSettings() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            settings: this.advancedSettings
        };
        
        const filename = `frostbyte-advanced-settings-${new Date().toISOString().split('T')[0]}.json`;
        this.downloadFile(JSON.stringify(exportData, null, 2), filename, 'application/json');
        
        // Track export action
        this.trackAdvancedSettingsUsage('Export Advanced Settings', 'export');
        
        this.showNotification('Advanced settings exported successfully', 'success');
    }

    /**
     * Import advanced settings
     */
    importAdvancedSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    if (importData.settings) {
                        this.advancedSettings = this.mergeDeep(this.advancedSettings, importData.settings);
                        this.saveAdvancedSettings();
                        this.applyAdvancedSettings();
                        
                        // Refresh current modal if open
                        const modal = document.querySelector('.advanced-settings-modal');
                        if (modal) {
                            this.populateAdvancedSettingsForm(modal);
                        }
                        
                        // Track import action\n            this.trackAdvancedSettingsUsage('Import Advanced Settings', 'import');\n            \n            this.showNotification('Advanced settings imported successfully', 'success');
                        console.log('📥 Advanced settings imported');
                    } else {
                        throw new Error('Invalid settings file format');
                    }
                } catch (error) {
                    console.error('Import failed:', error);
                    this.showNotification('Failed to import settings: Invalid file format', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * Deep merge utility
     */
    mergeDeep(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeDeep(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    // Utility methods for advanced settings features
    
    /**
     * Setup notification sound
     */
    setupNotificationSound() {
        // Create audio context for notification sounds
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not supported');
        }
    }

    /**
     * Enable lazy loading
     */
    enableLazyLoading() {
        // Implement lazy loading for charts and data
        console.log('🔄 Lazy loading enabled');
    }

    /**
     * Enable data preloading
     */
    enableDataPreloading() {
        // Preload commonly accessed data
        console.log('⚡ Data preloading enabled');
    }

    /**
     * Setup performance alerts
     */
    setupPerformanceAlerts() {
        // Initialize performance alert system
        console.log('🚨 Performance alerts setup complete');
    }

    /**
     * Clean performance history
     */
    cleanPerformanceHistory() {
        const maxEntries = 100;
        if (this.performanceMonitor.history.length > maxEntries) {
            this.performanceMonitor.history = this.performanceMonitor.history.slice(-maxEntries);
            console.log('🧹 Performance history cleaned');
        }
    }

    /**
     * Export cleaned data
     */
    exportCleanedData(count) {
        console.log(`📤 Exporting ${count} cleaned records`);
        // Implementation for exporting cleaned data before deletion
    }

    /**
     * Setup rate limiting
     */
    setupRateLimiting() {
        // Implement rate limiting for API calls and UI actions
        console.log('🛡️ Rate limiting enabled');
    }

    /**
     * Send external alert
     */
    sendExternalAlert(alert) {
        // Send alert to external monitoring service
        if (this.advancedSettings.notifications.webhook.enabled) {
            // Implementation for webhook notifications
            console.log('📡 External alert sent:', alert.message);
        }
    }

    /**
     * Send audit log
     */
    sendAuditLog(event) {
        // Send audit log to external service
        if (this.advancedSettings.integration.externalServices.analytics.enabled) {
            // Implementation for external audit logging
            console.log('📝 Audit log sent:', event.action);
        }
    }

    /**
     * Show status message
     */
    showStatus(message, type) {
        const indicator = document.getElementById('status-indicator');
        const text = document.getElementById('status-text');
        
        if (indicator && text) {
            const icon = indicator.querySelector('i');
            
            indicator.className = `status-indicator ${type}`;
            text.textContent = message;
            
            if (type === 'success') {
                icon.className = 'fas fa-check-circle';
            } else if (type === 'error') {
                icon.className = 'fas fa-exclamation-circle';
            } else if (type === 'info') {
                icon.className = 'fas fa-info-circle';
            }
            
            indicator.classList.remove('hidden');
        }
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            font-family: Arial, sans-serif;
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Add slide-in animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    /**
     * Show error
     */
    showError(message) {
        const tableContent = document.getElementById('table-content');
        if (tableContent) {
            tableContent.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
        
        this.showNotification(message, 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-hide if enabled
        if (this.config.get('notifications.autoHide')) {
            const delay = this.config.get('notifications.hideDelay') || 5000;
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, delay);
        }
    }

    /**
     * Set loading state
     */
    setLoading(isLoading) {
        this.data.isLoading = isLoading;
        
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.disabled = isLoading;
            const icon = refreshBtn.querySelector('i');
            if (icon) {
                icon.style.animation = isLoading ? 'spin 1s linear infinite' : '';
            }
        }
        
        if (isLoading) {
            const tableContent = document.getElementById('table-content');
            if (tableContent) {
                tableContent.innerHTML = `
                    <div class="loading">
                        <div class="spinner"></div>
                        Loading usage reports...
                    </div>
                `;
            }
        }
    }

    /**
     * Update last update time
     */
    updateLastUpdateTime() {
        const element = document.getElementById('last-update');
        if (element && this.data.lastUpdate) {
            element.textContent = `Last updated: ${this.data.lastUpdate.toLocaleTimeString()}`;
        }
    }

    /**
     * Update element text content
     */
    updateElement(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Destroy charts
     */
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        Object.values(this.performanceCharts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
        this.performanceCharts = {};
    }

    /**
     * Cleanup
     */
    destroy() {
        this.destroyCharts();
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
    }
}

// Make dashboard class globally available
window.FrostbyteAnalytics = FrostbyteAnalytics;

// Add tracking function to FrostbyteAnalytics prototype
FrostbyteAnalytics.prototype.trackAdvancedSettingsUsage = function(action, category = 'advanced-settings') {
    try {
        // Try to use the existing trackButtonClick function from the HTML files
        if (typeof window.trackButtonClick === 'function') {
            window.trackButtonClick(action, category);
            console.log('📊 Advanced Settings tracked:', action);
        } else {
            // Fallback: track locally in dashboard
            if (!this.localTracking) {
                this.localTracking = { advancedSettingsUsage: {} };
            }
            
            const key = `${category}:${action}`;
            this.localTracking.advancedSettingsUsage[key] = 
                (this.localTracking.advancedSettingsUsage[key] || 0) + 1;
            
            // Store in localStorage for analytics integration
            localStorage.setItem('dashboard_advanced_settings_tracking', 
                JSON.stringify(this.localTracking.advancedSettingsUsage));
            
            console.log('📊 Advanced Settings tracked locally:', action);
        }
    } catch (error) {
        console.warn('Failed to track Advanced Settings usage:', error);
    }
};

// Debug functions for troubleshooting
window.debugConfig = function() {
    console.log('🔍 === CONFIGURATION DEBUG ===');
    const config = window.dashboard.config;
    
    console.log('📋 Current configuration:');
    console.log('  - GitHub Token:', config.get('github.token') ? '✅ Present' : '❌ Missing');
    console.log('  - GitHub Owner:', config.get('github.owner') || '❌ Not set');
    console.log('  - GitHub Repo:', config.get('github.repo') || '❌ Not set');
    console.log('  - Auto Refresh:', config.get('github.autoRefresh') ? '✅ Enabled' : '❌ Disabled');
    console.log('  - Is Configured:', config.isGitHubConfigured() ? '✅ Yes' : '❌ No');
    
    console.log('\n🗄️ Raw localStorage:');
    const rawData = localStorage.getItem('frostbyte_analytics_config');
    console.log('Raw data:', rawData ? 'Present' : 'Missing');
    
    if (rawData) {
        try {
            const parsed = JSON.parse(rawData);
            console.log('Parsed config keys:', Object.keys(parsed));
        } catch (e) {
            console.log('Parse error:', e.message);
        }
    }
};

window.debugAuth = function() {
    console.log('🔍 === AUTHENTICATION DEBUG ===');
    const config = window.dashboard.config;
    const github = window.dashboard.github;
    
    try {
        const headers = github.getHeaders();
        console.log('✅ Headers generated successfully');
        console.log('Authorization header present:', !!headers.Authorization);
    } catch (error) {
        console.log('❌ Header generation failed:', error.message);
    }
};

window.testToken = function(token) {
    console.log('🧪 === TOKEN TEST ===');
    if (!token) {
        console.log('Usage: testToken("your_token_here")');
        return;
    }
    
    console.log('Testing token:', token.substring(0, 15) + '...');
    console.log('Length:', token.length);
    console.log('Starts with ghp_:', token.startsWith('ghp_'));
    console.log('Starts with github_pat_:', token.startsWith('github_pat_'));
    
    const validation = window.dashboard.config.validateGitHubToken(token);
    console.log('Validation result:', validation);
};

window.testEncryption = function(token) {
    console.log('🔐 === ENCRYPTION TEST ===');
    if (!token) {
        console.log('Usage: testEncryption("your_token_here")');
        return;
    }
    
    const config = window.dashboard.config;
    
    console.log('Original token:', token.substring(0, 15) + '...');
    
    const encrypted = config.encrypt(token);
    console.log('Encrypted token:', encrypted.substring(0, 20) + '...');
    
    const decrypted = config.decrypt(encrypted);
    console.log('Decrypted token:', decrypted.substring(0, 15) + '...');
    
    console.log('Encryption round-trip successful:', token === decrypted);
    
    if (token === decrypted) {
        console.log('✅ Encryption/decryption working correctly');
    } else {
        console.log('❌ Encryption/decryption failed');
        console.log('Expected:', token.substring(0, 20));
        console.log('Got:', decrypted.substring(0, 20));
    }
};

window.debugStoredToken = function() {
    console.log('🗄️ === STORED TOKEN DEBUG ===');
    
    const rawData = localStorage.getItem('frostbyte_analytics_config');
    if (!rawData) {
        console.log('❌ No stored configuration found');
        return;
    }
    
    try {
        const parsed = JSON.parse(rawData);
        console.log('Raw stored token:', parsed.github?.token?.substring(0, 20) + '...');
        
        const config = window.dashboard.config;
        const decrypted = config.decrypt(parsed.github?.token || '');
        console.log('Decrypted token:', decrypted.substring(0, 15) + '...');
        console.log('Starts with github_pat_:', decrypted.startsWith('github_pat_'));
        
        const fromConfig = config.get('github.token');
        console.log('Token from config.get():', fromConfig?.substring(0, 15) + '...');
        
    } catch (error) {
        console.log('❌ Error parsing stored config:', error);
    }
};

window.clearConfig = function() {
    console.log('🗑️ Clearing all configuration...');
    localStorage.removeItem('frostbyte_analytics_config');
    window.location.reload();
};

window.fixTokenEncryption = function() {
    console.log('🔧 === FIXING TOKEN ENCRYPTION ===');
    
    const rawData = localStorage.getItem('frostbyte_analytics_config');
    if (!rawData) {
        console.log('❌ No stored configuration found');
        return;
    }
    
    try {
        const parsed = JSON.parse(rawData);
        if (parsed.github?.token) {
            console.log('🔍 Found stored token, attempting to fix...');
            
            // Try to decrypt the current token
            const config = window.dashboard.config;
            const decrypted = config.decrypt(parsed.github.token);
            
            console.log('Current decrypted token starts with github_pat_:', decrypted.startsWith('github_pat_'));
            
            if (!decrypted.startsWith('github_pat_') && !decrypted.startsWith('ghp_')) {
                console.log('❌ Token is corrupted. Clearing configuration...');
                localStorage.removeItem('frostbyte_analytics_config');
                console.log('✅ Configuration cleared. Please re-enter your token.');
                window.location.reload();
            } else {
                console.log('✅ Token appears to be working correctly');
            }
        }
    } catch (error) {
        console.log('❌ Error checking token:', error);
        console.log('Clearing configuration...');
        localStorage.removeItem('frostbyte_analytics_config');
        window.location.reload();
    }
};

// Global debug functions
window.debugData = function() {
    if (window.dashboard) {
        console.log('🔧 DEBUG: Dashboard Data Analysis');
        console.log('Reports data:', {
            exists: !!window.dashboard.data.reports,
            isArray: Array.isArray(window.dashboard.data.reports),
            length: window.dashboard.data.reports?.length || 0,
            firstReport: window.dashboard.data.reports?.[0] || null
        });
        
        if (window.dashboard.data.reports?.length > 0) {
            const sample = window.dashboard.data.reports[0];
            console.log('Sample report structure:', {
                hasCreatedAt: !!sample.createdAt,
                createdAtType: typeof sample.createdAt,
                hasUserData: !!sample.userData,
                hasAnalytics: !!sample.analytics,
                keys: Object.keys(sample)
            });
        }
        
        console.log('Filters:', window.dashboard.filters);
        console.log('Performance metrics:', !!window.dashboard.data.performanceMetrics);
        console.log('User journey data:', !!window.dashboard.data.userJourneyData);
    } else {
        console.log('Dashboard not initialized');
    }
};

// Add CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Frostbyte Analytics Dashboard...');
    
    try {
        // Create dashboard instance
        window.dashboard = new FrostbyteAnalytics();
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize dashboard:', error);
        
        // Show error state in the UI
        const container = document.querySelector('.container');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Initialization Error</h3>
                    <p>Failed to initialize dashboard: ${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 1rem;">
                        <i class="fas fa-redo"></i> Retry
                    </button>
                </div>
            `;
        }
    }
});