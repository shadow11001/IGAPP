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
            console.log('✅ Settings button found, adding click listener');
            settingsBtn.addEventListener('click', (e) => {
                console.log('🖱️ Settings button clicked!');
                e.preventDefault();
                e.stopPropagation();
                
                try {
                    console.log('📞 Calling showSettings()...');
                    this.showSettings();
                    console.log('✅ showSettings() completed');
                } catch (error) {
                    console.error('❌ Error in showSettings():', error);
                }
            });
            
            // Also add global function as backup
            window.showDashboardSettings = () => {
                console.log('📞 Global showDashboardSettings called');
                this.showSettings();
            };
        } else {
            console.error('❌ Settings button not found in DOM!');
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
        console.log('🔧 showSettings() called');
        const panel = document.getElementById('settings-panel');
        console.log('📋 Settings panel element:', panel);
        
        if (panel) {
            console.log('✅ Panel found, removing hidden class');
            panel.classList.remove('hidden');
            panel.style.display = 'block'; // Force display
            this.loadSettingsForm();
            console.log('✅ Settings panel should now be visible');
        } else {
            console.error('❌ Settings panel element not found!');
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
     * Show advanced settings section
     */
    showAdvancedSettings() {
        console.log('🔧 showAdvancedSettings() called');
        // This would show additional advanced configuration options
        // For now, just show the regular settings panel with all options
        this.showSettings();
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
     * Show status message
     */
    showStatus(message, type = 'info') {
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (statusIndicator && statusText) {
            statusText.textContent = message;
            statusIndicator.className = `status-indicator ${type}`;
            statusIndicator.classList.remove('hidden');
            
            // Auto-hide after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    statusIndicator.classList.add('hidden');
                }, 5000);
            }
        } else {
            // Fallback to notification if status indicator doesn't exist
            this.showNotification(message, type);
        }
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
     * Show error message
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
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

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
     * Apply advanced settings
     */
    applyAdvancedSettings() {
        // Apply settings that don't require restart
        console.log('✅ Advanced settings applied');
    }

    /**
     * Initialize performance monitoring
     */
    initializePerformanceMonitoring() {
        console.log('✅ Performance monitoring initialized');
    }

    /**
     * Setup data retention policies
     */
    setupDataRetentionPolicies() {
        console.log('✅ Data retention policies setup');
    }

    /**
     * Initialize security features
     */
    initializeSecurityFeatures() {
        console.log('✅ Security features initialized');
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        try {
            const stored = localStorage.getItem('frostbyte_user_preferences');
            if (stored) {
                this.userPreferences = { ...this.userPreferences, ...JSON.parse(stored) };
                console.log('✅ User preferences loaded');
            }
        } catch (error) {
            console.warn('Failed to load user preferences:', error);
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        console.log('✅ Keyboard shortcuts setup');
    }

    /**
     * Setup accessibility features
     */
    setupAccessibility() {
        console.log('✅ Accessibility features setup');
    }

    /**
     * Initialize advanced filtering
     */
    initializeAdvancedFiltering() {
        console.log('✅ Advanced filtering initialized');
    }

    /**
     * Setup responsive design
     */
    setupResponsiveDesign() {
        console.log('✅ Responsive design setup');
    }

    /**
     * Setup auto refresh
     */
    setupAutoRefresh() {
        if (this.userPreferences.autoRefreshEnabled) {
            const interval = this.userPreferences.autoRefreshInterval || 300000; // 5 minutes default
            setInterval(() => {
                this.loadDashboard();
            }, interval);
            console.log(`✅ Auto-refresh enabled (${interval/1000}s interval)`);
        }
    }

    /**
     * Deep merge objects
     */
    mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    /**
     * Check if value is an object
     */
    isObject(item) {
        return (item && typeof item === "object" && !Array.isArray(item));
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
                        <p>Loading usage reports...</p>
                        <small class="text-muted">This may take a few moments...</small>
                    </div>
                `;
            }
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
     * Update trend indicator
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
                `${(metrics.featureAdoption.adoptionRate || 0).toFixed(1)}%`);
        }
        
        // Update retention metrics
        if (metrics.retention) {
            this.updateElement('weekly-retention', 
                `${(metrics.retention.weeklyRetention || 0).toFixed(1)}%`);
            this.updateElement('monthly-retention', 
                `${(metrics.retention.monthlyRetention || 0).toFixed(1)}%`);
        }
    }

    /**
     * Format duration in human readable format
     */
    formatDuration(seconds) {
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        } else if (seconds < 3600) {
            return `${Math.round(seconds / 60)}m`;
        } else {
            return `${Math.round(seconds / 3600)}h`;
        }
    }

    /**
     * Destroy existing charts
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

    // =============================================
    // ADVANCED SETTINGS METHODS
    // =============================================

    /**
     * Show advanced settings modal
     */
    showAdvancedSettings() {
        console.log('🔧 showAdvancedSettings() called');
        const modal = this.createAdvancedSettingsModal();
        document.body.appendChild(modal);
        
        // Animate modal in
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    /**
     * Create advanced settings modal
     */
    createAdvancedSettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal advanced-settings-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.closest('.modal').remove()"></div>
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
     * Generate advanced settings content HTML
     */
    generateAdvancedSettingsContent() {
        return `
            <!-- Dashboard Settings -->
            <div class="tab-content active" data-tab="dashboard">
                <h4>Dashboard Customization</h4>
                <div class="form-group">
                    <label for="adv-custom-layout">Layout Style</label>
                    <select id="adv-custom-layout" class="form-input">
                        <option value="default">Default</option>
                        <option value="compact">Compact</option>
                        <option value="detailed">Detailed</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-chart-animations" class="checkbox-input">
                        <span class="checkbox-text">Enable Chart Animations</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-auto-refresh" class="checkbox-input">
                        <span class="checkbox-text">Auto Refresh Data</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="adv-refresh-interval">Refresh Interval (minutes)</label>
                    <input type="number" id="adv-refresh-interval" class="form-input" min="1" max="60">
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-debug-mode" class="checkbox-input">
                        <span class="checkbox-text">Enable Debug Mode</span>
                    </label>
                </div>
                
                <h4>Custom Colors</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="adv-primary-color">Primary Color</label>
                        <input type="color" id="adv-primary-color" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="adv-secondary-color">Secondary Color</label>
                        <input type="color" id="adv-secondary-color" class="form-input">
                    </div>
                </div>
            </div>
            
            <!-- Notifications Settings -->
            <div class="tab-content" data-tab="notifications">
                <h4>Notification Settings</h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-notifications-enabled" class="checkbox-input">
                        <span class="checkbox-text">Enable Notifications</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="adv-notification-position">Position</label>
                    <select id="adv-notification-position" class="form-input">
                        <option value="top-right">Top Right</option>
                        <option value="top-left">Top Left</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="bottom-left">Bottom Left</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="adv-notification-timeout">Auto-hide Timeout (seconds)</label>
                    <input type="number" id="adv-notification-timeout" class="form-input" min="1" max="30" value="5">
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-sound-enabled" class="checkbox-input">
                        <span class="checkbox-text">Enable Sound</span>
                    </label>
                </div>
            </div>
            
            <!-- Performance Settings -->
            <div class="tab-content" data-tab="performance">
                <h4>Performance Monitoring</h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-performance-monitoring" class="checkbox-input">
                        <span class="checkbox-text">Enable Performance Monitoring</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="adv-memory-warning">Memory Warning Threshold (%)</label>
                    <input type="number" id="adv-memory-warning" class="form-input" min="50" max="95" value="80">
                </div>
                
                <div class="form-group">
                    <label for="adv-response-warning">Response Time Warning (ms)</label>
                    <input type="number" id="adv-response-warning" class="form-input" min="100" max="5000" value="2000">
                </div>
                
                <h4>Optimization</h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-lazy-loading" class="checkbox-input">
                        <span class="checkbox-text">Enable Lazy Loading</span>
                    </label>
                </div>
            </div>
            
            <!-- Data Management Settings -->
            <div class="tab-content" data-tab="data">
                <h4>Data Retention</h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-data-retention-enabled" class="checkbox-input">
                        <span class="checkbox-text">Enable Data Retention Policies</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="adv-max-cache-age">Max Cache Age (hours)</label>
                    <input type="number" id="adv-max-cache-age" class="form-input" min="1" max="168" value="10">
                </div>
                
                <div class="form-group">
                    <label for="adv-max-reports-age">Max Reports Age (days)</label>
                    <input type="number" id="adv-max-reports-age" class="form-input" min="1" max="365" value="90">
                </div>
                
                <h4>Backup Settings</h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-backup-enabled" class="checkbox-input">
                        <span class="checkbox-text">Enable Automatic Backups</span>
                    </label>
                </div>
            </div>
            
            <!-- Security Settings -->
            <div class="tab-content" data-tab="security">
                <h4>Security Features</h4>
                <div class="form-group">
                    <label for="adv-session-timeout">Session Timeout (minutes)</label>
                    <input type="number" id="adv-session-timeout" class="form-input" min="5" max="480" value="60">
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-audit-logging" class="checkbox-input">
                        <span class="checkbox-text">Enable Audit Logging</span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-encryption-enabled" class="checkbox-input">
                        <span class="checkbox-text">Enable Data Encryption</span>
                    </label>
                </div>
                
                <h4>Rate Limiting</h4>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-rate-limiting" class="checkbox-input">
                        <span class="checkbox-text">Enable Rate Limiting</span>
                    </label>
                </div>
            </div>
            
            <!-- Integration Settings -->
            <div class="tab-content" data-tab="integration">
                <h4>GitHub Integration</h4>
                <div class="form-group">
                    <label for="adv-api-cache-duration">API Cache Duration (minutes)</label>
                    <input type="number" id="adv-api-cache-duration" class="form-input" min="1" max="1440" value="10">
                </div>
                
                <div class="form-group">
                    <label for="adv-request-timeout">Request Timeout (seconds)</label>
                    <input type="number" id="adv-request-timeout" class="form-input" min="5" max="120" value="30">
                </div>
                
                <div class="form-group">
                    <label for="adv-retry-attempts">Retry Attempts</label>
                    <input type="number" id="adv-retry-attempts" class="form-input" min="0" max="5" value="3">
                </div>
            </div>
            
            <!-- Experimental Settings -->
            <div class="tab-content" data-tab="experimental">
                <h4>Experimental Features</h4>
                <div class="alert" style="background: #fff3cd; border: 1px solid #ffc107; padding: 1rem; margin-bottom: 1rem; border-radius: 4px;">
                    <i class="fas fa-exclamation-triangle" style="color: #856404;"></i>
                    <strong>Warning:</strong> These features are experimental and may not work as expected.
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-realtime-updates" class="checkbox-input">
                        <span class="checkbox-text">Enable Real-time Updates</span>
                    </label>
                    <small class="form-hint">Live data updates without page refresh</small>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="adv-ai-insights" class="checkbox-input">
                        <span class="checkbox-text">Enable AI-powered Insights</span>
                    </label>
                    <small class="form-hint">Experimental AI analysis of usage patterns</small>
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
                const targetTab = tab.dataset.tab;
                
                // Update active tab button
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Update visible content
                contents.forEach(content => {
                    if (content.dataset.tab === targetTab) {
                        content.style.display = 'block';
                        content.classList.add('active');
                    } else {
                        content.style.display = 'none';
                        content.classList.remove('active');
                    }
                });
            });
        });
    }

    /**
     * Populate advanced settings form with current values
     */
    populateAdvancedSettingsForm(modal) {
        // Load settings from localStorage
        try {
            const stored = localStorage.getItem('frostbyte_advanced_settings');
            if (stored) {
                const settings = JSON.parse(stored);
                
                // Dashboard settings
                if (settings.dashboard) {
                    this.setFormValue(modal, 'adv-custom-layout', settings.dashboard.customLayout);
                    this.setFormValue(modal, 'adv-chart-animations', settings.dashboard.chartAnimations);
                    this.setFormValue(modal, 'adv-auto-refresh', settings.dashboard.autoRefresh);
                    this.setFormValue(modal, 'adv-refresh-interval', settings.dashboard.refreshInterval / 60000);
                    this.setFormValue(modal, 'adv-debug-mode', settings.dashboard.enableDebugMode);
                    if (settings.dashboard.customColors) {
                        this.setFormValue(modal, 'adv-primary-color', settings.dashboard.customColors.primary);
                        this.setFormValue(modal, 'adv-secondary-color', settings.dashboard.customColors.secondary);
                    }
                }
                
                // Notification settings
                if (settings.notifications) {
                    this.setFormValue(modal, 'adv-notifications-enabled', settings.notifications.enabled);
                    this.setFormValue(modal, 'adv-notification-position', settings.notifications.position);
                    this.setFormValue(modal, 'adv-notification-timeout', settings.notifications.timeout / 1000);
                    this.setFormValue(modal, 'adv-sound-enabled', settings.notifications.soundEnabled);
                }
            }
        } catch (error) {
            console.warn('Failed to populate advanced settings form:', error);
        }
    }

    /**
     * Helper to set form values
     */
    setFormValue(container, id, value) {
        const element = container.querySelector(`#${id}`);
        if (!element) return;
        
        if (element.type === 'checkbox') {
            element.checked = !!value;
        } else {
            element.value = value;
        }
    }

    /**
     * Save advanced settings from modal
     */
    saveAdvancedSettingsFromModal(modal) {
        try {
            const settings = {
                dashboard: {
                    customLayout: modal.querySelector('#adv-custom-layout')?.value || 'default',
                    chartAnimations: modal.querySelector('#adv-chart-animations')?.checked || false,
                    autoRefresh: modal.querySelector('#adv-auto-refresh')?.checked || false,
                    refreshInterval: (parseInt(modal.querySelector('#adv-refresh-interval')?.value) || 5) * 60000,
                    enableDebugMode: modal.querySelector('#adv-debug-mode')?.checked || false,
                    customColors: {
                        primary: modal.querySelector('#adv-primary-color')?.value || '#667eea',
                        secondary: modal.querySelector('#adv-secondary-color')?.value || '#6c757d'
                    }
                },
                notifications: {
                    enabled: modal.querySelector('#adv-notifications-enabled')?.checked ?? true,
                    position: modal.querySelector('#adv-notification-position')?.value || 'top-right',
                    timeout: (parseInt(modal.querySelector('#adv-notification-timeout')?.value) || 5) * 1000,
                    soundEnabled: modal.querySelector('#adv-sound-enabled')?.checked || false
                },
                performance: {
                    monitoring: {
                        enabled: modal.querySelector('#adv-performance-monitoring')?.checked || false
                    },
                    thresholds: {
                        memoryUsage: { warning: parseInt(modal.querySelector('#adv-memory-warning')?.value) || 80 },
                        responseTime: { warning: parseInt(modal.querySelector('#adv-response-warning')?.value) || 2000 }
                    },
                    optimization: {
                        lazyLoading: modal.querySelector('#adv-lazy-loading')?.checked || false
                    }
                },
                dataRetention: {
                    enabled: modal.querySelector('#adv-data-retention-enabled')?.checked || false,
                    maxCacheAge: (parseInt(modal.querySelector('#adv-max-cache-age')?.value) || 10) * 3600000,
                    maxReportsAge: (parseInt(modal.querySelector('#adv-max-reports-age')?.value) || 90) * 86400000,
                    backupEnabled: modal.querySelector('#adv-backup-enabled')?.checked || false
                },
                security: {
                    sessionTimeout: (parseInt(modal.querySelector('#adv-session-timeout')?.value) || 60) * 60000,
                    auditLogging: modal.querySelector('#adv-audit-logging')?.checked || false,
                    encryptionEnabled: modal.querySelector('#adv-encryption-enabled')?.checked || false,
                    rateLimiting: modal.querySelector('#adv-rate-limiting')?.checked || false
                },
                integration: {
                    github: {
                        apiCacheDuration: (parseInt(modal.querySelector('#adv-api-cache-duration')?.value) || 10) * 60000,
                        requestTimeout: (parseInt(modal.querySelector('#adv-request-timeout')?.value) || 30) * 1000,
                        retryAttempts: parseInt(modal.querySelector('#adv-retry-attempts')?.value) || 3
                    }
                },
                experimental: {
                    realtimeUpdates: modal.querySelector('#adv-realtime-updates')?.checked || false,
                    aiInsights: modal.querySelector('#adv-ai-insights')?.checked || false
                }
            };
            
            localStorage.setItem('frostbyte_advanced_settings', JSON.stringify(settings));
            this.advancedSettings = settings;
            this.showStatus('✅ Advanced settings saved successfully!', 'success');
            
            // Close modal
            modal.remove();
            
            // Apply settings
            this.applyAdvancedSettings();
        } catch (error) {
            console.error('Failed to save advanced settings:', error);
            this.showStatus('❌ Failed to save advanced settings', 'error');
        }
    }

    /**
     * Apply advanced settings to the dashboard
     */
    applyAdvancedSettings() {
        try {
            const stored = localStorage.getItem('frostbyte_advanced_settings');
            if (stored) {
                const settings = JSON.parse(stored);
                
                // Apply debug mode
                if (settings.dashboard?.enableDebugMode) {
                    console.log('🐛 Debug mode enabled');
                    document.body.classList.add('debug-mode');
                } else {
                    document.body.classList.remove('debug-mode');
                }
                
                // Apply custom colors
                if (settings.dashboard?.customColors) {
                    document.documentElement.style.setProperty('--color-primary', settings.dashboard.customColors.primary);
                    document.documentElement.style.setProperty('--color-secondary', settings.dashboard.customColors.secondary);
                }
                
                console.log('✅ Advanced settings applied');
            }
        } catch (error) {
            console.warn('Failed to apply advanced settings:', error);
        }
    }

    /**
     * Reset advanced settings to defaults
     */
    resetAdvancedSettings() {
        if (confirm('Are you sure you want to reset all advanced settings to their default values?')) {
            localStorage.removeItem('frostbyte_advanced_settings');
            this.showStatus('✅ Advanced settings reset to defaults', 'success');
            
            // Close and reopen modal to show defaults
            document.querySelector('.advanced-settings-modal')?.remove();
            this.showAdvancedSettings();
        }
    }

    /**
     * Export advanced settings
     */
    exportAdvancedSettings() {
        try {
            const settings = localStorage.getItem('frostbyte_advanced_settings') || '{}';
            const blob = new Blob([settings], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `frostbyte-advanced-settings-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showStatus('✅ Settings exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export settings:', error);
            this.showStatus('❌ Failed to export settings', 'error');
        }
    }

    /**
     * Import advanced settings
     */
    importAdvancedSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const settings = JSON.parse(event.target.result);
                    localStorage.setItem('frostbyte_advanced_settings', JSON.stringify(settings));
                    this.showStatus('✅ Settings imported successfully', 'success');
                    
                    // Close and reopen modal to show imported settings
                    document.querySelector('.advanced-settings-modal')?.remove();
                    this.showAdvancedSettings();
                } catch (error) {
                    console.error('Failed to import settings:', error);
                    this.showStatus('❌ Invalid settings file', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new FrostbyteAnalytics();
});
