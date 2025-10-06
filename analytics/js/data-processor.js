/**
 * Frostbyte Analytics Dashboard - Data Processing Utilities
 * Handles parsing and analysis of usage reports from GitHub issues
 */

class DataProcessor {
    constructor(configManager) {
        this.config = configManager;
        this.userTracker = new Set();
        this.totalMetrics = {
            clicks: 0,
            notes: 0,
            sessions: 0
        };
    }

    /**
     * Parse and process usage reports from GitHub issues
     */
    processUsageReports(issues) {
        console.log(`📊 Processing ${issues.length} issues...`);
        
        // Reset tracking
        this.userTracker.clear();
        this.totalMetrics = { clicks: 0, notes: 0, sessions: 0 };
        
        const processedReports = issues.map(issue => {
            const report = {
                id: issue.number,
                title: issue.title,
                createdAt: new Date(issue.created_at),
                updatedAt: new Date(issue.updated_at),
                labels: issue.labels?.map(l => l.name) || [],
                body: issue.body || '',
                author: issue.user?.login || 'unknown',
                state: issue.state,
                url: issue.html_url,
                type: this.determineReportType(issue),
                userData: this.extractUserData(issue.body || ''),
                analytics: this.extractAnalytics(issue.body || ''),
                metadata: this.extractMetadata(issue)
            };

            // Track unique users
            if (report.userData.userHash) {
                this.userTracker.add(this.normalizeUserId(report.userData.userHash, report.type));
            }

            // Accumulate metrics
            if (report.analytics.buttonClicks) {
                this.totalMetrics.clicks += report.analytics.buttonClicks;
            }
            if (report.analytics.notesCreated) {
                this.totalMetrics.notes += report.analytics.notesCreated;
            }
            if (report.userData.sessionDuration) {
                this.totalMetrics.sessions++;
            }

            return report;
        }).filter(report => report.type !== 'unknown');
        
        console.log(`✅ Processed ${processedReports.length} valid reports`);
        console.log(`👥 Found ${this.userTracker.size} unique users`);
        console.log(`🖱️ Total clicks: ${this.totalMetrics.clicks}`);
        console.log(`📝 Total notes: ${this.totalMetrics.notes}`);
        console.log(`⏱️ Total sessions: ${this.totalMetrics.sessions}`);
        
        return processedReports;
    }

    /**
     * Determine the type of report from issue data
     */
    determineReportType(issue) {
        const labels = issue.labels?.map(l => l.name.toLowerCase()) || [];
        const title = issue.title?.toLowerCase() || '';
        const body = issue.body?.toLowerCase() || '';
        
        // Check labels first
        if (labels.some(label => label.includes('usage-analytics') || label.includes('analytics'))) {
            return 'usage-analytics';
        }
        if (labels.some(label => label.includes('feedback'))) {
            return 'feedback';
        }
        if (labels.some(label => label.includes('email-analysis') || label.includes('email'))) {
            return 'email-analysis';
        }
        
        // Check content
        if (title.includes('usage') || title.includes('analytics') || body.includes('usage report')) {
            return 'usage-analytics';
        }
        if (title.includes('feedback') || body.includes('feedback')) {
            return 'feedback';
        }
        if (title.includes('email') || body.includes('email analysis')) {
            return 'email-analysis';
        }
        
        return 'unknown';
    }

    /**
     * Extract user data from issue body
     */
    extractUserData(body) {
        const userData = {};
        
        if (!body) return userData;
        
        // First try to extract from JSON data
        const jsonData = this.extractJSONData(body);
        if (jsonData) {
            userData.userHash = jsonData.userHash || null;
            userData.sessionDuration = jsonData.sessionDuration || 0;
            userData.version = jsonData.version || null;
            userData.reportTimestamp = jsonData.reportTimestamp ? new Date(jsonData.reportTimestamp) : null;
            return userData;
        }
        
        // Fallback to markdown parsing
        
        // Extract User ID/Hash with multiple patterns
        const userIdPatterns = [
            /\*\*User ID:\*\*\s*(\w+)/i,
            /User ID:\s*(\w+)/i,
            /\*\*User Hash:\*\*\s*(\w+)/i,
            /User Hash:\s*(\w+)/i,
            /user[_\s]+(\w+)/i,
            /\*\*Agent ID:\*\*\s*(\w+)/i,
            /Agent ID:\s*(\w+)/i
        ];
        
        for (const pattern of userIdPatterns) {
            const match = body.match(pattern);
            if (match && match[1].length >= 3) {
                userData.userHash = match[1];
                break;
            }
        }
        
        // Extract Session Duration
        const durationPatterns = [
            /\*\*Session Duration:\*\*\s*(\d+)\s*minutes?/i,
            /Session Duration:\s*(\d+)\s*minutes?/i,
            /Duration:\s*(\d+)\s*minutes?/i,
            /Session:\s*(\d+)\s*min/i
        ];
        
        for (const pattern of durationPatterns) {
            const match = body.match(pattern);
            if (match) {
                const duration = parseInt(match[1]);
                if (duration > 0 && duration < 1440) { // Max 24 hours
                    userData.sessionDuration = duration;
                    break;
                }
            }
        }
        
        // Extract App Version
        const versionPatterns = [
            /\*\*App Version:\*\*\s*([\d.]+)/i,
            /App Version:\s*([\d.]+)/i,
            /Version:\s*([\d.]+)/i,
            /v([\d.]+)/i
        ];
        
        for (const pattern of versionPatterns) {
            const match = body.match(pattern);
            if (match) {
                userData.version = match[1];
                break;
            }
        }
        
        // Extract timestamp information
        const timestampPatterns = [
            /\*\*Timestamp:\*\*\s*(.+)/i,
            /Timestamp:\s*(.+)/i,
            /Generated on:\s*(.+)/i
        ];
        
        for (const pattern of timestampPatterns) {
            const match = body.match(pattern);
            if (match) {
                const timestamp = new Date(match[1].trim());
                if (!isNaN(timestamp.getTime())) {
                    userData.reportTimestamp = timestamp;
                    break;
                }
            }
        }
        
        return userData;
    }

    /**
     * Extract analytics data from issue body
     */
    extractAnalytics(body) {
        const analytics = {};
        
        if (!body) return analytics;
        
        // First try to extract JSON data
        const jsonData = this.extractJSONData(body);
        if (jsonData) {
            // Extract from structured JSON format
            analytics.buttonClicks = this.getTotalButtonClicks(jsonData.buttonUsage || []);
            analytics.clicksByCategory = this.categorizeButtonUsage(jsonData.buttonUsage || []);
            analytics.notesCreated = jsonData.noteStatistics?.totalNotesSaved || 0;
            analytics.sessionDuration = jsonData.sessionDuration || 0;
            analytics.features = this.extractFeaturesFromJSON(jsonData);
            analytics.sessionMetrics = {
                averageLength: jsonData.noteStatistics?.averageLength || 0,
                averageWordCount: jsonData.noteStatistics?.averageWordCount || 0,
                percentWithNumbers: jsonData.noteStatistics?.percentWithNumbers || 0,
                notesWithDAE: jsonData.noteStatistics?.notesWithDAE || 0
            };
            analytics.rawData = jsonData; // Store for detailed analysis
            return analytics;
        }
        
        // Fallback to markdown parsing for older reports
        analytics.buttonClicks = this.extractButtonClicks(body);
        analytics.clicksByCategory = this.extractClicksByCategory(body);
        
        // Extract notes created
        const notesPatterns = [
            /\*\*Total Notes Saved:\*\*\s*(\d+)/i,
            /Total Notes Saved:\s*(\d+)/i,
            /Notes Saved:\s*(\d+)/i,
            /Notes Created:\s*(\d+)/i,
            /(\d+)\s*notes?\s*created/i
        ];
        
        for (const pattern of notesPatterns) {
            const match = body.match(pattern);
            if (match) {
                analytics.notesCreated = parseInt(match[1]);
                break;
            }
        }
        
        // Extract feature usage
        analytics.features = this.extractFeatureUsage(body);
        
        // Extract session metrics
        analytics.sessionMetrics = this.extractSessionMetrics(body);
        
        return analytics;
    }

    /**
     * Extract JSON data from issue body
     */
    extractJSONData(body) {
        try {
            // Look for JSON data in various patterns
            const jsonPatterns = [
                /```json\s*(\{[\s\S]*?\})\s*```/i,
                /```\s*(\{[\s\S]*?\})\s*```/i,
                /(\{[\s\S]*"userHash"[\s\S]*?\})/i,
                /(\{[\s\S]*"buttonUsage"[\s\S]*?\})/i,
                /Raw Analytics Data[^{]*(\{[\s\S]*?\})(?:\s*```|\s*$)/i
            ];
            
            for (const pattern of jsonPatterns) {
                const match = body.match(pattern);
                if (match) {
                    const jsonStr = match[1].trim();
                    const parsed = JSON.parse(jsonStr);
                    if (parsed && (parsed.userHash || parsed.buttonUsage || parsed.sessionDuration !== undefined)) {
                        console.log('📊 Successfully extracted JSON data from usage report');
                        return parsed;
                    }
                }
            }
            
            // Try to find JSON objects line by line
            const lines = body.split('\n');
            let jsonStart = -1;
            let braceCount = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                if (line.startsWith('{') && jsonStart === -1) {
                    jsonStart = i;
                    braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
                } else if (jsonStart !== -1) {
                    braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
                    
                    if (braceCount === 0) {
                        const jsonStr = lines.slice(jsonStart, i + 1).join('\n');
                        try {
                            const parsed = JSON.parse(jsonStr);
                            if (parsed && (parsed.userHash || parsed.buttonUsage || parsed.sessionDuration !== undefined)) {
                                console.log('📊 Successfully extracted multi-line JSON data');
                                return parsed;
                            }
                        } catch (e) {
                            // Continue searching
                        }
                        jsonStart = -1;
                        braceCount = 0;
                    }
                }
            }
            
        } catch (error) {
            console.warn('⚠️ Failed to parse JSON from usage report:', error.message);
        }
        
        return null;
    }

    /**
     * Get total button clicks from buttonUsage array
     */
    getTotalButtonClicks(buttonUsage) {
        if (!Array.isArray(buttonUsage)) return 0;
        
        return buttonUsage.reduce((total, [buttonName, clicks]) => {
            return total + (parseInt(clicks) || 0);
        }, 0);
    }

    /**
     * Categorize button usage from buttonUsage array
     */
    categorizeButtonUsage(buttonUsage) {
        const categories = {
            'quick-notes': 0,
            'email-processing': 0,
            'war-room': 0,
            'dae-template': 0,
            'settings': 0,
            'general': 0
        };
        
        if (!Array.isArray(buttonUsage)) return categories;
        
        buttonUsage.forEach(([buttonName, clicks]) => {
            const category = this.categorizeButton(buttonName || '');
            categories[category] += parseInt(clicks) || 0;
        });
        
        return categories;
    }

    /**
     * Extract features from JSON data
     */
    extractFeaturesFromJSON(jsonData) {
        const features = {};
        
        if (jsonData.buttonUsage && Array.isArray(jsonData.buttonUsage)) {
            // Extract feature types from button names
            jsonData.buttonUsage.forEach(([buttonName, clicks]) => {
                const featureType = this.getFeatureType(buttonName || '');
                features[featureType] = (features[featureType] || 0) + (parseInt(clicks) || 0);
            });
        }
        
        // Add note-taking feature if notes exist
        if (jsonData.noteStatistics?.totalNotesSaved > 0) {
            features['note-taking'] = jsonData.noteStatistics.totalNotesSaved;
        }
        
        // Add DAE feature if DAE notes exist
        if (jsonData.noteStatistics?.notesWithDAE > 0) {
            features['dae-reporting'] = jsonData.noteStatistics.notesWithDAE;
        }
        
        return features;
    }

    /**
     * Get feature type from button name
     */
    getFeatureType(buttonName) {
        if (!buttonName) return 'general';
        
        const name = buttonName.toLowerCase();
        
        if (name.includes('quick-note:')) return 'quick-notes';
        if (name.includes('dae-template:')) return 'dae-template';
        if (name.includes('email')) return 'email-processing';
        if (name.includes('war room') || name.includes('generate report')) return 'war-room';
        if (name.includes('settings') || name.includes('usage report')) return 'settings';
        
        return 'general';
    }

    /**
     * Extract button click data
     */
    extractButtonClicks(body) {
        let totalClicks = 0;
        
        // Look for "Most Used Buttons" section
        const buttonSectionMatch = body.match(/###[^#]*Most Used Buttons[^#]*\n([\s\S]*?)(?=\n###|\n\n|$)/i);
        
        if (buttonSectionMatch) {
            const buttonSection = buttonSectionMatch[1];
            const buttonPattern = /[-*]\s*\*\*([^*]+)\*\*:\s*(\d+)\s*clicks?/gi;
            const matches = [...buttonSection.matchAll(buttonPattern)];
            
            for (const match of matches) {
                const clicks = parseInt(match[2]);
                if (clicks > 0) {
                    totalClicks += clicks;
                }
            }
        } else {
            // Fallback patterns
            const fallbackPatterns = [
                /[-*]\s*\*\*[^*]+\*\*:\s*(\d+)\s*clicks?/gi,
                /\*\*[^*]+\*\*:\s*(\d+)\s*clicks?/gi,
                /(\d+)\s*clicks?/gi
            ];
            
            for (const pattern of fallbackPatterns) {
                const matches = [...body.matchAll(pattern)];
                for (const match of matches) {
                    totalClicks += parseInt(match[1]) || 0;
                }
                if (totalClicks > 0) break;
            }
        }
        
        return totalClicks;
    }

    /**
     * Extract clicks by category
     */
    extractClicksByCategory(body) {
        const categories = {
            'quick-notes': 0,
            'email-processing': 0,
            'war-room': 0,
            'settings': 0,
            'general': 0
        };
        
        // Look for button section
        const buttonSectionMatch = body.match(/###[^#]*Most Used Buttons[^#]*\n([\s\S]*?)(?=\n###|\n\n|$)/i);
        
        if (buttonSectionMatch) {
            const buttonSection = buttonSectionMatch[1];
            const buttonPattern = /[-*]\s*\*\*([^*]+)\*\*:\s*(\d+)\s*clicks?/gi;
            const matches = [...buttonSection.matchAll(buttonPattern)];
            
            for (const match of matches) {
                const buttonName = match[1]?.trim().toLowerCase() || '';
                const clicks = parseInt(match[2]) || 0;
                const category = this.categorizeButton(buttonName);
                categories[category] += clicks;
            }
        }
        
        return categories;
    }

    /**
     * Categorize button by name
     */
    categorizeButton(buttonName) {
        if (!buttonName) return 'general';
        
        const name = buttonName.toLowerCase();
        
        // Handle new format: "quick-note:Logged into Novar."
        if (name.includes('quick-note:')) {
            return 'quick-notes';
        }
        
        // Handle new format: "dae-template:Reporting Issues with IoT"
        if (name.includes('dae-template:')) {
            return 'dae-template';
        }
        
        // Email processing patterns
        if (name.includes('email') || name.includes('process') || name.includes('analysis')) {
            return 'email-processing';
        }
        
        // War room patterns
        if (name.includes('war room') || name.includes('generate report') || 
            name.includes('start') || name.includes('complete') || name.includes('copy')) {
            return 'war-room';
        }
        
        // Settings patterns
        if (name.includes('settings') || name.includes('usage report') || 
            name.includes('toggle') || name.includes('test') || name.includes('export')) {
            return 'settings';
        }
        
        // Legacy quick notes patterns (for older reports)
        if (name.includes('novar') || name.includes('opus') || name.includes('cpc') || 
            name.includes('aka65') || name.includes('storeview') || name.includes('comms') ||
            name.includes('logged into') || name.includes('checked') || name.includes('performed')) {
            return 'quick-notes';
        }
        
        return 'general';
    }

    /**
     * Extract feature usage data
     */
    extractFeatureUsage(body) {
        const features = {};
        
        // Look for various feature sections
        const featureSections = [
            'qa checklist',
            'email processor',
            'war room',
            'settings',
            'theme'
        ];
        
        for (const feature of featureSections) {
            const pattern = new RegExp(`${feature}[^\\n]*:?[^\\d]*(\\d+)`, 'gi');
            const match = body.match(pattern);
            if (match) {
                const count = parseInt(match[0].replace(/\D/g, '')) || 0;
                features[feature] = count;
            }
        }
        
        return features;
    }

    /**
     * Extract session metrics
     */
    extractSessionMetrics(body) {
        const metrics = {};
        
        // Extract dead air time
        const deadAirPattern = /dead air[^:]*:?\s*(\d+)/gi;
        const deadAirMatch = body.match(deadAirPattern);
        if (deadAirMatch) {
            metrics.deadAirTime = parseInt(deadAirMatch[0].replace(/\D/g, ''));
        }
        
        // Extract infractions
        const infractionPattern = /infractions?[^:]*:?\s*(\d+)/gi;
        const infractionMatch = body.match(infractionPattern);
        if (infractionMatch) {
            metrics.infractions = parseInt(infractionMatch[0].replace(/\D/g, ''));
        }
        
        return metrics;
    }

    /**
     * Extract metadata from issue
     */
    extractMetadata(issue) {
        return {
            number: issue.number,
            state: issue.state,
            author: issue.user?.login || 'unknown',
            assignees: issue.assignees?.map(a => a.login) || [],
            milestone: issue.milestone?.title || null,
            locked: issue.locked || false,
            comments: issue.comments || 0,
            reactions: issue.reactions?.total_count || 0
        };
    }

    /**
     * Normalize user ID for consistent tracking
     */
    normalizeUserId(userHash, reportType) {
        if (!userHash) return 'anonymous';
        
        let normalizedId = userHash;
        
        // Handle email analysis format
        if (reportType === 'email-analysis' && userHash.startsWith('user_')) {
            normalizedId = userHash.substring(5);
        } else if (userHash.includes('user_')) {
            const match = userHash.match(/user[_\s]+(\w+)/i);
            if (match) {
                normalizedId = match[1];
            }
        }
        
        return normalizedId.toLowerCase();
    }

    /**
     * Get metrics summary
     */
    getMetricsSummary() {
        return {
            totalUsers: this.userTracker.size,
            totalClicks: this.totalMetrics.clicks,
            totalNotes: this.totalMetrics.notes,
            totalSessions: this.totalMetrics.sessions,
            uniqueUsers: Array.from(this.userTracker)
        };
    }

    /**
     * Calculate trends between two time periods
     */
    calculateTrends(reports, periodDays = 7) {
        const now = new Date();
        const periodMs = periodDays * 24 * 60 * 60 * 1000;
        
        const currentPeriod = reports.filter(r => 
            now - r.createdAt <= periodMs
        );
        
        const previousPeriod = reports.filter(r => 
            now - r.createdAt > periodMs && now - r.createdAt <= periodMs * 2
        );
        
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };
        
        return {
            reports: calculateChange(currentPeriod.length, previousPeriod.length),
            clicks: calculateChange(
                currentPeriod.reduce((sum, r) => sum + (r.analytics.buttonClicks || 0), 0),
                previousPeriod.reduce((sum, r) => sum + (r.analytics.buttonClicks || 0), 0)
            ),
            notes: calculateChange(
                currentPeriod.reduce((sum, r) => sum + (r.analytics.notesCreated || 0), 0),
                previousPeriod.reduce((sum, r) => sum + (r.analytics.notesCreated || 0), 0)
            ),
            users: calculateChange(
                new Set(currentPeriod.map(r => r.userData.userHash).filter(Boolean)).size,
                new Set(previousPeriod.map(r => r.userData.userHash).filter(Boolean)).size
            )
        };
    }

    /**
     * Generate time-series data for charts
     */
    generateTimeSeriesData(reports, interval = 'day', limit = 30) {
        const data = [];
        const now = new Date();
        
        for (let i = limit - 1; i >= 0; i--) {
            const date = new Date(now);
            
            if (interval === 'day') {
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
            } else if (interval === 'week') {
                date.setDate(date.getDate() - (i * 7));
                date.setDate(date.getDate() - date.getDay()); // Start of week
                date.setHours(0, 0, 0, 0);
            } else if (interval === 'month') {
                date.setMonth(date.getMonth() - i);
                date.setDate(1);
                date.setHours(0, 0, 0, 0);
            }
            
            const endDate = new Date(date);
            if (interval === 'day') {
                endDate.setDate(endDate.getDate() + 1);
            } else if (interval === 'week') {
                endDate.setDate(endDate.getDate() + 7);
            } else if (interval === 'month') {
                endDate.setMonth(endDate.getMonth() + 1);
            }
            
            const periodReports = reports.filter(r => 
                r.createdAt >= date && r.createdAt < endDate
            );
            
            data.push({
                date: date,
                label: this.formatDateLabel(date, interval),
                reports: periodReports.length,
                clicks: periodReports.reduce((sum, r) => sum + (r.analytics.buttonClicks || 0), 0),
                notes: periodReports.reduce((sum, r) => sum + (r.analytics.notesCreated || 0), 0),
                users: new Set(periodReports.map(r => r.userData.userHash).filter(Boolean)).size
            });
        }
        
        return data;
    }

    /**
     * Format date label for charts
     */
    formatDateLabel(date, interval) {
        if (interval === 'day') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else if (interval === 'week') {
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 6);
            return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${endDate.getDate()}`;
        } else if (interval === 'month') {
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }
        return date.toLocaleDateString();
    }

    /**
     * Export processed data
     */
    exportData(reports, format = 'json') {
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                totalReports: reports.length,
                dateRange: {
                    from: reports.length > 0 ? Math.min(...reports.map(r => r.createdAt)) : null,
                    to: reports.length > 0 ? Math.max(...reports.map(r => r.createdAt)) : null
                },
                metrics: this.getMetricsSummary()
            },
            reports: reports,
            summary: {
                byType: this.groupByType(reports),
                byDate: this.generateTimeSeriesData(reports, 'day', 30),
                trends: this.calculateTrends(reports)
            }
        };
        
        if (format === 'csv') {
            return this.convertToCSV(reports);
        }
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Group reports by type
     */
    groupByType(reports) {
        const groups = {};
        
        reports.forEach(report => {
            if (!groups[report.type]) {
                groups[report.type] = [];
            }
            groups[report.type].push(report);
        });
        
        return groups;
    }

    /**
     * Convert reports to CSV format
     */
    convertToCSV(reports) {
        const headers = [
            'ID', 'Title', 'Type', 'Created', 'User', 'Version', 
            'Session Duration', 'Button Clicks', 'Notes Created', 'URL'
        ];
        
        const rows = reports.map(report => [
            report.id,
            `"${report.title.replace(/"/g, '""')}"`,
            report.type,
            report.createdAt.toISOString(),
            report.userData.userHash || '',
            report.userData.version || '',
            report.userData.sessionDuration || '',
            report.analytics.buttonClicks || 0,
            report.analytics.notesCreated || 0,
            report.url
        ]);
        
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }
}

// Export class
window.DataProcessor = DataProcessor;