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
            const userId = report.userData?.userHash || report.author || 'anonymous';
            const timestamp = new Date(report.createdAt).getTime();
            
            if (!userSessions.has(userId)) {
                userSessions.set(userId, []);
            }
            
            const userReports = userSessions.get(userId);
            
            // Group by session (reports within 30 minutes of each other)
            let currentSession = userReports.find(session => {
                const lastReport = session[session.length - 1];
                const timeDiff = timestamp - new Date(lastReport.createdAt).getTime();
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
            if (report.analytics?.rawData?.buttonUsage) {
                const buttonSequence = this.extractButtonSequence(report.analytics.rawData.buttonUsage);
                path.push(...buttonSequence);
            } else if (report.analytics?.clicksByCategory) {
                // Fallback: try to extract from analytics clicksByCategory
                Object.entries(report.analytics.clicksByCategory).forEach(([category, count]) => {
                    if (count > 0) {
                        // Add category-based steps
                        for (let i = 0; i < Math.min(count, 3); i++) { // Limit to 3 to avoid overwhelming
                            path.push(this.simplifyFeatureName(category));
                        }
                    }
                });
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
            if (action && action.includes('logged into')) return 'login';
            if (action && action.includes('checked comms')) return 'check-comms';
            if (action && action.includes('checked temps')) return 'check-temps';
            if (action && action.includes('checked alarms')) return 'check-alarms';
            if (action && action.includes('all good')) return 'status-ok';
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

    /**
     * Analyze session flows
     */
    analyzeSessionFlows(reports) {
        const flowPatterns = new Map();
        const userSessions = this.groupReportsByUserSession(reports);
        
        for (const [userId, sessions] of userSessions) {
            sessions.forEach(session => {
                const flow = this.buildSessionPath(session);
                if (flow.length > 1) {
                    const flowKey = flow.join(' → ');
                    if (!flowPatterns.has(flowKey)) {
                        flowPatterns.set(flowKey, {
                            pattern: flow,
                            count: 0,
                            users: new Set()
                        });
                    }
                    
                    const flowData = flowPatterns.get(flowKey);
                    flowData.count++;
                    flowData.users.add(userId);
                }
            });
        }
        
        return this.rankSessionFlows(flowPatterns);
    }

    /**
     * Identify behavior patterns
     */
    identifyBehaviorPatterns(reports) {
        return {
            powerUsers: this.identifyPowerUsers(reports),
            explorers: this.identifyExplorers(reports),
            focusedUsers: this.identifyFocusedUsers(reports),
            bounceUsers: this.identifyBounceUsers(reports),
            returningUsers: this.identifyReturningUsers(reports)
        };
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
        if (userPaths.userPaths) {
            for (const [userId, pathData] of userPaths.userPaths) {
                const userSteps = new Set();
                
                pathData.paths.forEach(path => {
                    path.forEach(step => {
                        userSteps.add(step);
                    });
                });
                
                userStepCompletion.set(userId, userSteps);
            }
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
        // Simple implementation - identify where users commonly stop
        const dropoffAnalysis = new Map();
        const userSessions = this.groupReportsByUserSession(reports);
        
        for (const [userId, sessions] of userSessions) {
            sessions.forEach(session => {
                const path = this.buildSessionPath(session);
                if (path.length > 0) {
                    const lastStep = path[path.length - 1];
                    if (!dropoffAnalysis.has(lastStep)) {
                        dropoffAnalysis.set(lastStep, { dropoffCount: 0, users: new Set() });
                    }
                    dropoffAnalysis.get(lastStep).dropoffCount++;
                    dropoffAnalysis.get(lastStep).users.add(userId);
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
            powerUsers: [],
            newUsers: [],
            returningUsers: [],
            atRiskUsers: []
        };
        
        for (const [userId, metrics] of userMetrics) {
            const segment = this.classifyUserSegment(metrics);
            if (segments[segment]) {
                segments[segment].push({ userId, metrics });
            }
        }
        
        return this.enrichUserSegments(segments);
    }

    // Helper methods with simple implementations
    calculateUserMetrics(reports) {
        const userMetrics = new Map();
        
        reports.forEach(report => {
            const userId = report.userData?.userHash || report.author || 'anonymous';
            if (!userMetrics.has(userId)) {
                userMetrics.set(userId, {
                    totalSessions: 0,
                    totalClicks: 0,
                    totalNotes: 0,
                    uniqueFeatures: new Set(),
                    avgSessionDuration: 0,
                    lastActivity: report.createdAt
                });
            }
            
            const metrics = userMetrics.get(userId);
            metrics.totalSessions++;
            metrics.totalClicks += report.analytics?.buttonClicks || 0;
            metrics.totalNotes += report.analytics?.notesCreated || 0;
            
            if (report.analytics?.clicksByCategory) {
                Object.keys(report.analytics.clicksByCategory).forEach(feature => {
                    metrics.uniqueFeatures.add(feature);
                });
            }
            
            metrics.avgSessionDuration += report.userData?.sessionDuration || 0;
            
            if (report.createdAt > metrics.lastActivity) {
                metrics.lastActivity = report.createdAt;
            }
        });
        
        // Convert uniqueFeatures to count and calculate averages
        for (const [userId, metrics] of userMetrics) {
            metrics.uniqueFeatures = metrics.uniqueFeatures.size;
            metrics.avgSessionDuration = metrics.avgSessionDuration / metrics.totalSessions;
        }
        
        return userMetrics;
    }

    identifyPowerUsers(reports) {
        const userMetrics = this.calculateUserMetrics(reports);
        const powerUsers = [];
        
        for (const [userId, metrics] of userMetrics) {
            if (metrics.uniqueFeatures > 3 && 
                metrics.avgSessionDuration > 5 && // 5 minutes
                metrics.totalSessions > 2) {
                powerUsers.push({
                    userId: userId,
                    score: this.calculatePowerUserScore(metrics),
                    metrics: metrics
                });
            }
        }
        
        return powerUsers.sort((a, b) => b.score - a.score);
    }

    identifyExplorers(reports) {
        const userMetrics = this.calculateUserMetrics(reports);
        const explorers = [];
        
        for (const [userId, metrics] of userMetrics) {
            const explorationScore = metrics.uniqueFeatures / Math.max(metrics.totalSessions, 1);
            if (explorationScore > 1 && metrics.uniqueFeatures > 2) {
                explorers.push({
                    userId: userId,
                    explorationScore: explorationScore,
                    metrics: metrics
                });
            }
        }
        
        return explorers.sort((a, b) => b.explorationScore - a.explorationScore);
    }

    // Simple implementations for remaining methods
    identifyFocusedUsers(reports) { return []; }
    identifyBounceUsers(reports) { return []; }
    identifyReturningUsers(reports) { return []; }
    
    calculatePowerUserScore(metrics) {
        return metrics.totalClicks + (metrics.uniqueFeatures * 10) + (metrics.avgSessionDuration * 2);
    }
    
    classifyUserSegment(metrics) {
        if (metrics.totalSessions > 5 && metrics.uniqueFeatures > 3) return 'powerUsers';
        if (metrics.totalSessions === 1) return 'newUsers';
        if (metrics.totalSessions > 1) return 'returningUsers';
        return 'atRiskUsers';
    }
    
    findMostCommonPath(paths) { return paths[0] || []; }
    getUniqueFeatures(paths) { return new Set(); }
    summarizeUserPaths(userPaths) { return { totalUsers: userPaths.size, userPaths: userPaths }; }
    rankSessionFlows(flows) { return Array.from(flows.values()).sort((a, b) => b.count - a.count); }
    rankDropoffPoints(analysis) { return Array.from(analysis.values()).sort((a, b) => b.dropoffCount - a.dropoffCount); }
    enrichUserSegments(segments) { return segments; }
}

// Export class
window.UserJourneyAnalytics = UserJourneyAnalytics;