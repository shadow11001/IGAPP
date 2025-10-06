/**
 * User Journey Analytics
 * Tracks user behavior patterns, session flows, and navigation paths
 */
class UserJourneyAnalytics {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.journeyPaths = new Map();
        this.sessionFlows = new Map();
        this.userBehaviorPatterns = new Map();
        this.conversionFunnels = new Map();
    }

    /**
     * Analyze user journeys from reports
     */
    analyzeUserJourneys(reports) {
        console.log('🗺️ Analyzing user journeys...');
        
        const journeyData = {
            userPaths: this.extractUserPaths(reports),
            sessionFlows: this.analyzeSessionFlows(reports),
            behaviorPatterns: this.identifyBehaviorPatterns(reports),
            conversionFunnels: this.buildConversionFunnels(reports),
            dropoffPoints: this.findDropoffPoints(reports),
            userSegments: this.segmentUsers(reports)
        };
        
        console.log('📊 User journey analysis complete:', journeyData);
        return journeyData;
    }

    /**
     * Extract user navigation paths
     */
    extractUserPaths(reports) {
        const userPaths = new Map();
        const userSessions = this.groupReportsByUserSession(reports);
        
        for (const [userId, sessions] of userSessions) {
            const paths = [];
            
            sessions.forEach(session => {
                const sessionPath = this.buildSessionPath(session);
                if (sessionPath.length > 1) {
                    paths.push(sessionPath);
                }
            });
            
            if (paths.length > 0) {
                userPaths.set(userId, {
                    totalSessions: sessions.length,
                    paths: paths,
                    commonPath: this.findMostCommonPath(paths),
                    uniqueFeatures: this.getUniqueFeatures(paths)
                });
            }
        }
        
        return this.summarizeUserPaths(userPaths);
    }

    /**
     * Group reports by user session
     */
    groupReportsByUserSession(reports) {
        const userSessions = new Map();
        
        reports.forEach(report => {
            if (!report.user || !report.user.login) return;
            
            const userId = report.user.login;
            const timestamp = new Date(report.created_at).getTime();
            
            if (!userSessions.has(userId)) {
                userSessions.set(userId, []);
            }
            
            const userReports = userSessions.get(userId);
            
            // Group by session (reports within 30 minutes of each other)
            let currentSession = userReports.find(session => {
                const lastReport = session[session.length - 1];
                const timeDiff = timestamp - new Date(lastReport.created_at).getTime();
                return timeDiff < 30 * 60 * 1000; // 30 minutes
            });
            
            if (!currentSession) {
                currentSession = [];
                userReports.push(currentSession);
            }
            
            currentSession.push(report);
        });
        
        return userSessions;
    }

    /**
     * Build session path from reports
     */
    buildSessionPath(sessionReports) {
        const path = [];
        
        sessionReports.forEach(report => {
            // Extract button sequences from JSON data if available
            if (report.analytics.rawData && report.analytics.rawData.buttonUsage) {
                const buttonSequence = this.extractButtonSequence(report.analytics.rawData.buttonUsage);
                path.push(...buttonSequence);
            } else {
                // Fallback: try to extract from analytics clicksByCategory
                if (report.analytics.clicksByCategory) {
                    Object.entries(report.analytics.clicksByCategory).forEach(([category, count]) => {
                        if (count > 0) {
                            // Add category-based steps
                            for (let i = 0; i < Math.min(count, 3); i++) { // Limit to 3 to avoid overwhelming
                                path.push(this.simplifyFeatureName(category));
                            }
                        }
                    });
                }
            }
        });
        
        return path;
    }

    /**
     * Extract button sequence from buttonUsage array
     */
    extractButtonSequence(buttonUsage) {
        const sequence = [];
        
        if (!Array.isArray(buttonUsage)) return sequence;
        
        // Sort by click count to get most used buttons first
        const sortedButtons = buttonUsage
            .filter(([name, count]) => name && count > 0)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10); // Limit to top 10 buttons per session
        
        sortedButtons.forEach(([buttonName, count]) => {
            const simplifiedName = this.simplifyButtonName(buttonName);
            // Add each button based on its usage count (max 3 times)
            for (let i = 0; i < Math.min(count, 3); i++) {
                sequence.push(simplifiedName);
            }
        });
        
        return sequence;
    }

    /**
     * Simplify button name for flow analysis
     */
    simplifyButtonName(buttonName) {
        if (!buttonName) return 'unknown';
        
        const name = buttonName.toLowerCase();
        
        // Map to simplified flow steps
        if (name.includes('quick-note:')) {
            const action = name.split('quick-note:')[1];
            if (action.includes('logged into')) return 'login';
            if (action.includes('checked comms')) return 'check-comms';
            if (action.includes('checked temps')) return 'check-temps';
            if (action.includes('checked alarms')) return 'check-alarms';
            if (action.includes('all good')) return 'status-ok';
            return 'quick-note';
        }
        
        if (name.includes('dae-template:')) return 'dae-report';
        if (name.includes('email')) return 'email-process';
        if (name.includes('war room')) return 'war-room';
        if (name.includes('settings')) return 'settings';
        
        return 'other-action';
    }

    /**
     * Simplify feature name for flow analysis
     */
    simplifyFeatureName(featureName) {
        const featureMap = {
            'quick-notes': 'quick-note',
            'email-processing': 'email-process',
            'war-room': 'war-room',
            'dae-template': 'dae-report',
            'settings': 'settings',
            'general': 'other-action'
        };
        
        return featureMap[featureName] || featureName;
    }
    buildSessionPath(sessionReports) {
        const path = [];
        
        sessionReports
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .forEach(report => {
                if (report.features && report.features.length > 0) {
                    report.features.forEach(feature => {
                        path.push({
                            feature: feature,
                            timestamp: new Date(report.created_at),
                            duration: this.calculateFeatureDuration(report),
                            clicks: this.extractClickCount(report),
                            notes: this.extractNotesCount(report)
                        });
                    });
                }
            });
        
        return path;
    }

    /**
     * Analyze session flows
     */
    analyzeSessionFlows(reports) {
        const flows = new Map();
        const userSessions = this.groupReportsByUserSession(reports);
        
        for (const [userId, sessions] of userSessions) {
            sessions.forEach(session => {
                const flow = this.analyzeSessionFlow(session);
                if (flow.transitions.length > 0) {
                    const flowKey = flow.pattern;
                    if (!flows.has(flowKey)) {
                        flows.set(flowKey, {
                            pattern: flowKey,
                            count: 0,
                            users: new Set(),
                            avgDuration: 0,
                            conversionRate: 0,
                            transitions: flow.transitions
                        });
                    }
                    
                    const flowData = flows.get(flowKey);
                    flowData.count++;
                    flowData.users.add(userId);
                    flowData.avgDuration = (flowData.avgDuration * (flowData.count - 1) + flow.duration) / flowData.count;
                }
            });
        }
        
        return this.rankSessionFlows(flows);
    }

    /**
     * Analyze individual session flow
     */
    analyzeSessionFlow(session) {
        const path = this.buildSessionPath(session);
        const transitions = [];
        const features = path.map(step => step.feature);
        
        for (let i = 0; i < features.length - 1; i++) {
            transitions.push({
                from: features[i],
                to: features[i + 1],
                duration: path[i + 1].timestamp - path[i].timestamp
            });
        }
        
        return {
            pattern: features.join(' → '),
            transitions: transitions,
            duration: path.length > 0 ? 
                (path[path.length - 1].timestamp - path[0].timestamp) / 1000 : 0,
            features: features.length,
            startFeature: features[0] || null,
            endFeature: features[features.length - 1] || null
        };
    }

    /**
     * Identify behavior patterns
     */
    identifyBehaviorPatterns(reports) {
        const patterns = {
            powerUsers: this.identifyPowerUsers(reports),
            explorers: this.identifyExplorers(reports),
            focusedUsers: this.identifyFocusedUsers(reports),
            bounceUsers: this.identifyBounceUsers(reports),
            returningUsers: this.identifyReturningUsers(reports)
        };
        
        return this.analyzePatternDistribution(patterns);
    }

    /**
     * Identify power users (high feature usage, long sessions)
     */
    identifyPowerUsers(reports) {
        const userMetrics = this.calculateUserMetrics(reports);
        const powerUsers = [];
        
        for (const [userId, metrics] of userMetrics) {
            if (metrics.uniqueFeatures > 5 && 
                metrics.avgSessionDuration > 300 && // 5 minutes
                metrics.totalSessions > 3) {
                powerUsers.push({
                    userId: userId,
                    score: this.calculatePowerUserScore(metrics),
                    metrics: metrics
                });
            }
        }
        
        return powerUsers.sort((a, b) => b.score - a.score);
    }

    /**
     * Identify explorers (try many different features)
     */
    identifyExplorers(reports) {
        const userMetrics = this.calculateUserMetrics(reports);
        const explorers = [];
        
        for (const [userId, metrics] of userMetrics) {
            const explorationScore = metrics.uniqueFeatures / Math.max(metrics.totalSessions, 1);
            if (explorationScore > 2 && metrics.uniqueFeatures > 3) {
                explorers.push({
                    userId: userId,
                    explorationScore: explorationScore,
                    metrics: metrics
                });
            }
        }
        
        return explorers.sort((a, b) => b.explorationScore - a.explorationScore);
    }

    /**
     * Build conversion funnels
     */
    buildConversionFunnels(reports) {
        const funnels = new Map();
        
        // Define common funnel paths based on actual button usage patterns
        const funnelDefinitions = [
            {
                name: 'Novar Login Flow',
                steps: ['login', 'check-comms', 'check-temps', 'status-ok']
            },
            {
                name: 'Issue Resolution Flow', 
                steps: ['login', 'check-comms', 'check-alarms', 'dae-report']
            },
            {
                name: 'Quick Note Flow',
                steps: ['login', 'quick-note', 'status-ok']
            },
            {
                name: 'Advanced User Flow',
                steps: ['login', 'multiple-checks', 'dae-report', 'settings']
            }
        ];
        
        funnelDefinitions.forEach(funnel => {
            const funnelData = this.analyzeFunnelConversion(reports, funnel.steps);
            funnels.set(funnel.name, {
                definition: funnel,
                stepConversions: funnelData.stepConversions,
                totalUsers: funnelData.totalUsers,
                completionRate: funnelData.completionRate,
                dropoffPoints: funnelData.dropoffPoints
            });
        });
        
        return funnels;
    }

    /**
     * Analyze funnel conversion rates
     */
    analyzeFunnelConversion(reports, steps) {
        const userPaths = this.extractUserPaths(reports);
        const stepConversions = [];
        const userStepCompletion = new Map();
        
        // Track which users complete each step
        for (const [userId, pathData] of userPaths.userPaths || new Map()) {
            const userSteps = new Set();
            
            pathData.paths.forEach(path => {
                path.forEach(step => {
                    userSteps.add(step);
                });
            });
            
            userStepCompletion.set(userId, userSteps);
        }
        
        const totalUsers = userStepCompletion.size;
        let previousStepUsers = totalUsers;
        
        steps.forEach((step, index) => {
            const usersCompletingStep = Array.from(userStepCompletion.values())
                .filter(userSteps => userSteps.has(step)).length;
            
            const conversionRate = previousStepUsers > 0 ? 
                (usersCompletingStep / previousStepUsers) * 100 : 0;
            
            stepConversions.push({
                step: step,
                users: usersCompletingStep,
                conversionRate: conversionRate,
                dropoffRate: 100 - conversionRate
            });
            
            previousStepUsers = usersCompletingStep;
        });
        
        const completionRate = stepConversions.length > 0 ? 
            stepConversions[stepConversions.length - 1].conversionRate : 0;
        
        const dropoffPoints = stepConversions
            .filter(step => step.dropoffRate > 20)
            .map(step => ({
                step: step.step,
                dropoffRate: step.dropoffRate
            }));
        
        completionRate,
            dropoffPoints
        };
    }

    /**
     * Analyze funnel conversion rates
     */
    analyzeFunnelConversion(reports, steps) {
        const userPaths = this.extractUserPaths(reports);
        const stepConversions = [];
        const userStepCompletion = new Map();
        
        // Track which users complete each step
        for (const [userId, pathData] of userPaths.userPaths || new Map()) {
            const userSteps = new Set();
            
            pathData.paths.forEach(path => {
                path.forEach(step => {
                    userSteps.add(step);
                });
            });
            
            userStepCompletion.set(userId, userSteps);
        }
        
        const totalUsers = userStepCompletion.size;
        let previousStepUsers = totalUsers;
        
        steps.forEach((step, index) => {
            const usersCompletingStep = Array.from(userStepCompletion.values())
                .filter(userSteps => userSteps.has(step)).length;
            
            const conversionRate = previousStepUsers > 0 ? 
                (usersCompletingStep / previousStepUsers) * 100 : 0;
            
            stepConversions.push({
                step: step,
                users: usersCompletingStep,
                conversionRate: conversionRate,
                dropoffRate: 100 - conversionRate
            });
            
            previousStepUsers = usersCompletingStep;
        });
        
        const completionRate = stepConversions.length > 0 ? 
            stepConversions[stepConversions.length - 1].conversionRate : 0;
        
        const dropoffPoints = stepConversions
            .filter(step => step.dropoffRate > 20)
            .map(step => ({
                step: step.step,
                dropoffRate: step.dropoffRate
            }));
        
        return {
            stepConversions,
            totalUsers,
            completionRate,
            dropoffPoints
        };
    }

    /**
     * Find drop-off points in user journeys
     */
    findDropoffPoints(reports) {
        const userJourneys = this.extractUserPaths(reports);
        const funnelResults = {
            totalUsers: userJourneys.totalUsers,
            stepConversions: [],
            dropoffRates: [],
            avgTimeToConvert: 0
        };
        
        steps.forEach((step, index) => {
            const usersAtStep = this.countUsersAtStep(userJourneys, steps.slice(0, index + 1));
            const conversionRate = index === 0 ? 100 : 
                (usersAtStep / funnelResults.stepConversions[0].users) * 100;
            
            funnelResults.stepConversions.push({
                step: step,
                users: usersAtStep,
                conversionRate: conversionRate
            });
            
            if (index > 0) {
                const dropoff = funnelResults.stepConversions[index - 1].users - usersAtStep;
                const dropoffRate = (dropoff / funnelResults.stepConversions[index - 1].users) * 100;
                funnelResults.dropoffRates.push({
                    fromStep: steps[index - 1],
                    toStep: step,
                    dropoffUsers: dropoff,
                    dropoffRate: dropoffRate
                });
            }
        });
        
        return funnelResults;
    }

    /**
     * Find drop-off points in user journeys
     */
    findDropoffPoints(reports) {
        const userSessions = this.groupReportsByUserSession(reports);
        const dropoffAnalysis = new Map();
        
        for (const [userId, sessions] of userSessions) {
            sessions.forEach(session => {
                const path = this.buildSessionPath(session);
                if (path.length > 1) {
                    const lastFeature = path[path.length - 1].feature;
                    const sessionDuration = (path[path.length - 1].timestamp - path[0].timestamp) / 1000;
                    
                    // Consider it a dropoff if session is short or ends abruptly
                    if (sessionDuration < 60 || path.length < 3) { // Less than 1 minute or < 3 features
                        if (!dropoffAnalysis.has(lastFeature)) {
                            dropoffAnalysis.set(lastFeature, {
                                feature: lastFeature,
                                dropoffCount: 0,
                                totalSessions: 0,
                                avgTimeBeforeDropoff: 0
                            });
                        }
                        
                        const dropoffData = dropoffAnalysis.get(lastFeature);
                        dropoffData.dropoffCount++;
                        dropoffData.avgTimeBeforeDropoff = 
                            (dropoffData.avgTimeBeforeDropoff * (dropoffData.dropoffCount - 1) + sessionDuration) / 
                            dropoffData.dropoffCount;
                    }
                }
            });
        }
        
        return this.rankDropoffPoints(dropoffAnalysis);
    }

    /**
     * Segment users based on behavior
     */
    segmentUsers(reports) {
        const userMetrics = this.calculateUserMetrics(reports);
        const segments = {
            'Power Users': [],
            'Casual Users': [],
            'New Users': [],
            'At-Risk Users': [],
            'Feature Explorers': []
        };
        
        for (const [userId, metrics] of userMetrics) {
            const segment = this.classifyUserSegment(metrics);
            if (segments[segment]) {
                segments[segment].push({
                    userId: userId,
                    metrics: metrics,
                    lastActivity: metrics.lastActivity
                });
            }
        }
        
        return this.enrichUserSegments(segments);
    }

    /**
     * Calculate comprehensive user metrics
     */
    calculateUserMetrics(reports) {
        const userMetrics = new Map();
        
        reports.forEach(report => {
            if (!report.user || !report.user.login) return;
            
            const userId = report.user.login;
            const timestamp = new Date(report.created_at);
            
            if (!userMetrics.has(userId)) {
                userMetrics.set(userId, {
                    totalReports: 0,
                    uniqueFeatures: new Set(),
                    totalClicks: 0,
                    totalNotes: 0,
                    sessions: [],
                    firstActivity: timestamp,
                    lastActivity: timestamp,
                    totalDuration: 0
                });
            }
            
            const metrics = userMetrics.get(userId);
            metrics.totalReports++;
            
            if (report.features) {
                report.features.forEach(feature => metrics.uniqueFeatures.add(feature));
            }
            
            metrics.totalClicks += this.extractClickCount(report);
            metrics.totalNotes += this.extractNotesCount(report);
            
            if (timestamp < metrics.firstActivity) {
                metrics.firstActivity = timestamp;
            }
            if (timestamp > metrics.lastActivity) {
                metrics.lastActivity = timestamp;
            }
        });
        
        // Calculate derived metrics
        for (const [userId, metrics] of userMetrics) {
            const daysSinceFirst = (metrics.lastActivity - metrics.firstActivity) / (1000 * 60 * 60 * 24);
            metrics.uniqueFeatures = metrics.uniqueFeatures.size;
            metrics.avgReportsPerDay = daysSinceFirst > 0 ? metrics.totalReports / daysSinceFirst : metrics.totalReports;
            metrics.engagementScore = this.calculateEngagementScore(metrics);
            metrics.totalSessions = this.estimateSessionCount(userId, reports);
            metrics.avgSessionDuration = metrics.totalDuration / Math.max(metrics.totalSessions, 1);
        }
        
        return userMetrics;
    }

    /**
     * Helper methods
     */
    calculateFeatureDuration(report) {
        // Estimate based on content or default to 30 seconds per feature
        return 30;
    }

    extractClickCount(report) {
        if (report.body && typeof report.body === 'string') {
            const clickMatch = report.body.match(/(\d+)\s*clicks?/i);
            return clickMatch ? parseInt(clickMatch[1]) : 0;
        }
        return 0;
    }

    extractNotesCount(report) {
        if (report.body && typeof report.body === 'string') {
            const noteMatch = report.body.match(/(\d+)\s*notes?/i);
            return noteMatch ? parseInt(noteMatch[1]) : 0;
        }
        return 0;
    }

    calculatePowerUserScore(metrics) {
        return (metrics.uniqueFeatures * 2) + 
               (metrics.avgSessionDuration / 60) + 
               (metrics.totalSessions * 1.5) +
               (metrics.totalClicks / 10);
    }

    calculateEngagementScore(metrics) {
        const recencyScore = this.calculateRecencyScore(metrics.lastActivity);
        const frequencyScore = Math.min(metrics.avgReportsPerDay * 10, 100);
        const depthScore = Math.min(metrics.uniqueFeatures * 5, 100);
        
        return (recencyScore + frequencyScore + depthScore) / 3;
    }

    calculateRecencyScore(lastActivity) {
        const daysSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastActivity < 1) return 100;
        if (daysSinceLastActivity < 7) return 80;
        if (daysSinceLastActivity < 30) return 60;
        if (daysSinceLastActivity < 90) return 40;
        return 20;
    }

    estimateSessionCount(userId, reports) {
        // Simple estimation based on time gaps between reports
        const userReports = reports
            .filter(r => r.user && r.user.login === userId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        let sessions = 1;
        for (let i = 1; i < userReports.length; i++) {
            const timeDiff = new Date(userReports[i].created_at) - new Date(userReports[i-1].created_at);
            if (timeDiff > 30 * 60 * 1000) { // 30 minutes gap = new session
                sessions++;
            }
        }
        
        return sessions;
    }

    classifyUserSegment(metrics) {
        const daysSinceFirst = (Date.now() - metrics.firstActivity) / (1000 * 60 * 60 * 24);
        const daysSinceLast = (Date.now() - metrics.lastActivity) / (1000 * 60 * 60 * 24);
        
        if (daysSinceFirst < 7) return 'New Users';
        if (daysSinceLast > 30) return 'At-Risk Users';
        if (metrics.uniqueFeatures > 5 && metrics.totalSessions > 5) return 'Power Users';
        if (metrics.uniqueFeatures > 8) return 'Feature Explorers';
        return 'Casual Users';
    }

    // Placeholder methods for complex analysis
    findMostCommonPath(paths) { return paths[0] || []; }
    getUniqueFeatures(paths) { return new Set(); }
    summarizeUserPaths(userPaths) { return { totalUsers: userPaths.size, commonPaths: [] }; }
    rankSessionFlows(flows) { return Array.from(flows.values()).sort((a, b) => b.count - a.count); }
    analyzePatternDistribution(patterns) { return patterns; }
    identifyFocusedUsers(reports) { return []; }
    identifyBounceUsers(reports) { return []; }
    identifyReturningUsers(reports) { return []; }
    countUsersAtStep(journeys, steps) { return 0; }
    rankDropoffPoints(analysis) { return Array.from(analysis.values()).sort((a, b) => b.dropoffCount - a.dropoffCount); }
    enrichUserSegments(segments) { return segments; }
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.UserJourneyAnalytics = UserJourneyAnalytics;
}

// Export for use in other modules (Node.js)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserJourneyAnalytics;
}