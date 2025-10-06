/**
 * Frostbyte Analytics - Performance Metrics Engine
 * Advanced analytics and performance tracking for user behavior
 */

class PerformanceAnalytics {
    constructor(dataProcessor) {
        this.dataProcessor = dataProcessor;
        this.cache = new Map();
    }

    /**
     * Calculate comprehensive performance metrics
     */
    getPerformanceMetrics(reports) {
        const cacheKey = `perf_${reports.length}_${reports[0]?.createdAt?.getTime() || 0}`;
        
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        const metrics = {
            sessionMetrics: this.calculateSessionMetrics(reports),
            featureAdoption: this.calculateFeatureAdoption(reports),
            userRetention: this.calculateUserRetention(reports),
            clickThroughRates: this.calculateClickThroughRates(reports),
            timeToAction: this.calculateTimeToAction(reports),
            errorRates: this.calculateErrorRates(reports),
            engagementScores: this.calculateEngagementScores(reports),
            cohortAnalysis: this.calculateCohortAnalysis(reports)
        };

        this.cache.set(cacheKey, metrics);
        return metrics;
    }

    /**
     * Calculate session-based metrics
     */
    calculateSessionMetrics(reports) {
        const sessions = this.groupByUser(reports);
        const sessionLengths = [];
        const sessionCounts = [];
        const bounceRate = [];

        Object.entries(sessions).forEach(([userHash, userReports]) => {
            const avgSessionLength = userReports.reduce((sum, report) => 
                sum + (report.userData.sessionDuration || 0), 0) / userReports.length;
            
            sessionLengths.push(avgSessionLength);
            sessionCounts.push(userReports.length);
            
            // Bounce rate: sessions with only 1 interaction
            const singleInteractionSessions = userReports.filter(r => 
                (r.analytics.buttonClicks || 0) <= 1).length;
            bounceRate.push(singleInteractionSessions / userReports.length);
        });

        return {
            averageSessionDuration: this.average(sessionLengths),
            medianSessionDuration: this.median(sessionLengths),
            averageSessionsPerUser: this.average(sessionCounts),
            bounceRate: this.average(bounceRate) * 100,
            totalActiveSessions: sessions.size,
            sessionDurationTrend: this.calculateTrend(sessionLengths, 7), // 7-day trend
            peakUsageHours: this.calculatePeakUsageHours(reports)
        };
    }

    /**
     * Calculate feature adoption rates
     */
    calculateFeatureAdoption(reports) {
        const featureUsage = {};
        const userFeatureAdoption = {};
        const totalUsers = new Set(reports.map(r => r.userData.userHash)).size;

        reports.forEach(report => {
            const userHash = report.userData.userHash;
            
            if (report.analytics.clicksByCategory) {
                Object.entries(report.analytics.clicksByCategory).forEach(([feature, clicks]) => {
                    if (!featureUsage[feature]) featureUsage[feature] = 0;
                    if (!userFeatureAdoption[feature]) userFeatureAdoption[feature] = new Set();
                    
                    featureUsage[feature] += clicks;
                    if (clicks > 0) {
                        userFeatureAdoption[feature].add(userHash);
                    }
                });
            }
        });

        const adoptionRates = {};
        const adoptionTrends = {};

        Object.keys(featureUsage).forEach(feature => {
            adoptionRates[feature] = (userFeatureAdoption[feature].size / totalUsers) * 100;
            adoptionTrends[feature] = this.calculateFeatureAdoptionTrend(reports, feature);
        });

        return {
            featureUsage,
            adoptionRates,
            adoptionTrends,
            mostAdoptedFeature: this.findMaxKey(adoptionRates),
            leastAdoptedFeature: this.findMinKey(adoptionRates),
            featureStickiness: this.calculateFeatureStickiness(reports)
        };
    }

    /**
     * Calculate user retention metrics
     */
    calculateUserRetention(reports) {
        const userFirstSeen = {};
        const userLastSeen = {};
        const retentionCohorts = {};

        reports.forEach(report => {
            const userHash = report.userData.userHash;
            const date = report.createdAt;

            if (!userFirstSeen[userHash] || date < userFirstSeen[userHash]) {
                userFirstSeen[userHash] = date;
            }
            if (!userLastSeen[userHash] || date > userLastSeen[userHash]) {
                userLastSeen[userHash] = date;
            }
        });

        // Calculate retention by cohort (weekly cohorts)
        Object.entries(userFirstSeen).forEach(([userHash, firstSeen]) => {
            const cohortWeek = this.getWeekKey(firstSeen);
            if (!retentionCohorts[cohortWeek]) {
                retentionCohorts[cohortWeek] = {
                    users: [],
                    week1: 0,
                    week2: 0,
                    week4: 0,
                    week8: 0
                };
            }
            retentionCohorts[cohortWeek].users.push(userHash);

            const daysSinceFirst = Math.floor((userLastSeen[userHash] - firstSeen) / (1000 * 60 * 60 * 24));
            
            if (daysSinceFirst >= 7) retentionCohorts[cohortWeek].week1++;
            if (daysSinceFirst >= 14) retentionCohorts[cohortWeek].week2++;
            if (daysSinceFirst >= 28) retentionCohorts[cohortWeek].week4++;
            if (daysSinceFirst >= 56) retentionCohorts[cohortWeek].week8++;
        });

        return {
            totalUsers: Object.keys(userFirstSeen).length,
            activeUsers: Object.keys(userLastSeen).length,
            retentionCohorts,
            averageUserLifespan: this.calculateAverageLifespan(userFirstSeen, userLastSeen),
            churRate: this.calculateChurnRate(userFirstSeen, userLastSeen),
            newVsReturning: this.calculateNewVsReturning(reports)
        };
    }

    /**
     * Calculate click-through rates
     */
    calculateClickThroughRates(reports) {
        const featureCTR = {};
        const overallCTR = {};

        reports.forEach(report => {
            const sessionDuration = report.userData.sessionDuration || 1;
            const totalClicks = report.analytics.buttonClicks || 0;
            
            // Overall CTR (clicks per minute)
            const ctr = totalClicks / (sessionDuration / 60);
            
            if (report.analytics.clicksByCategory) {
                Object.entries(report.analytics.clicksByCategory).forEach(([feature, clicks]) => {
                    if (!featureCTR[feature]) featureCTR[feature] = [];
                    featureCTR[feature].push(clicks / (sessionDuration / 60));
                });
            }

            if (!overallCTR[report.userData.userHash]) overallCTR[report.userData.userHash] = [];
            overallCTR[report.userData.userHash].push(ctr);
        });

        const avgFeatureCTR = {};
        Object.entries(featureCTR).forEach(([feature, rates]) => {
            avgFeatureCTR[feature] = this.average(rates);
        });

        return {
            averageCTR: this.average(Object.values(overallCTR).flat()),
            featureCTR: avgFeatureCTR,
            ctrTrends: this.calculateCTRTrends(reports),
            topPerformingFeatures: this.getTopN(avgFeatureCTR, 5)
        };
    }

    /**
     * Calculate time-to-action metrics
     */
    calculateTimeToAction(reports) {
        const timeToFirstClick = [];
        const timeToFeatureAdoption = {};
        
        reports.forEach(report => {
            const sessionStart = report.createdAt;
            const sessionDuration = report.userData.sessionDuration || 0;
            
            // Estimate time to first click (simplified)
            if (report.analytics.buttonClicks > 0) {
                const avgTimeToClick = sessionDuration / report.analytics.buttonClicks;
                timeToFirstClick.push(avgTimeToClick);
            }
            
            // Time to feature adoption
            if (report.analytics.clicksByCategory) {
                Object.entries(report.analytics.clicksByCategory).forEach(([feature, clicks]) => {
                    if (clicks > 0) {
                        if (!timeToFeatureAdoption[feature]) timeToFeatureAdoption[feature] = [];
                        timeToFeatureAdoption[feature].push(sessionDuration / clicks);
                    }
                });
            }
        });

        const avgTimeToFeature = {};
        Object.entries(timeToFeatureAdoption).forEach(([feature, times]) => {
            avgTimeToFeature[feature] = this.average(times);
        });

        return {
            averageTimeToFirstClick: this.average(timeToFirstClick),
            medianTimeToFirstClick: this.median(timeToFirstClick),
            timeToFeatureAdoption: avgTimeToFeature,
            quickestFeature: this.findMinKey(avgTimeToFeature),
            slowestFeature: this.findMaxKey(avgTimeToFeature)
        };
    }

    /**
     * Calculate error rates and issues
     */
    calculateErrorRates(reports) {
        const errorSessions = reports.filter(report => 
            report.type === 'error' || report.title.toLowerCase().includes('error')
        );
        
        const totalSessions = reports.length;
        const errorRate = (errorSessions.length / totalSessions) * 100;
        
        const errorTrends = this.calculateErrorTrends(reports);
        const errorCategories = this.categorizeErrors(errorSessions);

        return {
            totalErrors: errorSessions.length,
            errorRate,
            errorTrends,
            errorCategories,
            errorFreeSessionPercentage: 100 - errorRate,
            criticalErrors: errorSessions.filter(r => r.priority === 'critical').length
        };
    }

    /**
     * Calculate user engagement scores
     */
    calculateEngagementScores(reports) {
        const userEngagement = {};
        
        reports.forEach(report => {
            const userHash = report.userData.userHash;
            const sessionDuration = report.userData.sessionDuration || 0;
            const clicks = report.analytics.buttonClicks || 0;
            const notes = report.analytics.notesCreated || 0;
            
            // Engagement score formula
            const engagementScore = (
                (sessionDuration * 0.3) + 
                (clicks * 0.4) + 
                (notes * 0.3)
            ) / 10; // Normalize to 0-10 scale
            
            if (!userEngagement[userHash]) userEngagement[userHash] = [];
            userEngagement[userHash].push(engagementScore);
        });

        const avgUserEngagement = {};
        Object.entries(userEngagement).forEach(([userHash, scores]) => {
            avgUserEngagement[userHash] = this.average(scores);
        });

        const allScores = Object.values(avgUserEngagement);
        
        return {
            averageEngagementScore: this.average(allScores),
            medianEngagementScore: this.median(allScores),
            highlyEngagedUsers: allScores.filter(score => score > 7).length,
            lowEngagementUsers: allScores.filter(score => score < 3).length,
            engagementDistribution: this.calculateDistribution(allScores),
            engagementTrend: this.calculateEngagementTrend(reports)
        };
    }

    /**
     * Calculate cohort analysis
     */
    calculateCohortAnalysis(reports) {
        const cohorts = {};
        const userFirstSeen = {};
        
        // Group users by their first seen week
        reports.forEach(report => {
            const userHash = report.userData.userHash;
            const date = report.createdAt;
            
            if (!userFirstSeen[userHash] || date < userFirstSeen[userHash]) {
                userFirstSeen[userHash] = date;
            }
        });
        
        // Create cohorts
        Object.entries(userFirstSeen).forEach(([userHash, firstSeen]) => {
            const cohortWeek = this.getWeekKey(firstSeen);
            if (!cohorts[cohortWeek]) {
                cohorts[cohortWeek] = {
                    users: new Set(),
                    totalSessions: 0,
                    totalClicks: 0,
                    totalNotes: 0,
                    retentionRates: {}
                };
            }
            cohorts[cohortWeek].users.add(userHash);
        });
        
        // Calculate cohort metrics
        reports.forEach(report => {
            const userHash = report.userData.userHash;
            const cohortWeek = this.getWeekKey(userFirstSeen[userHash]);
            
            if (cohorts[cohortWeek]) {
                cohorts[cohortWeek].totalSessions++;
                cohorts[cohortWeek].totalClicks += report.analytics.buttonClicks || 0;
                cohorts[cohortWeek].totalNotes += report.analytics.notesCreated || 0;
            }
        });

        return cohorts;
    }

    // Helper methods
    groupByUser(reports) {
        return reports.reduce((groups, report) => {
            const user = report.userData.userHash;
            if (!groups[user]) groups[user] = [];
            groups[user].push(report);
            return groups;
        }, {});
    }

    average(numbers) {
        return numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0;
    }

    median(numbers) {
        const sorted = numbers.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    calculateTrend(values, periods) {
        if (values.length < periods) return 0;
        const recent = values.slice(-periods);
        const previous = values.slice(-periods * 2, -periods);
        return previous.length ? ((this.average(recent) - this.average(previous)) / this.average(previous)) * 100 : 0;
    }

    findMaxKey(obj) {
        return Object.keys(obj).reduce((a, b) => obj[a] > obj[b] ? a : b, Object.keys(obj)[0]);
    }

    findMinKey(obj) {
        return Object.keys(obj).reduce((a, b) => obj[a] < obj[b] ? a : b, Object.keys(obj)[0]);
    }

    getTopN(obj, n) {
        return Object.entries(obj)
            .sort(([,a], [,b]) => b - a)
            .slice(0, n)
            .reduce((result, [key, value]) => {
                result[key] = value;
                return result;
            }, {});
    }

    getWeekKey(date) {
        const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
        return `week_${week}`;
    }

    calculatePeakUsageHours(reports) {
        const hourlyUsage = Array(24).fill(0);
        
        reports.forEach(report => {
            const hour = report.createdAt.getHours();
            hourlyUsage[hour]++;
        });
        
        const maxUsage = Math.max(...hourlyUsage);
        const peakHour = hourlyUsage.indexOf(maxUsage);
        
        return {
            peakHour,
            peakUsage: maxUsage,
            hourlyDistribution: hourlyUsage
        };
    }

    calculateFeatureAdoptionTrend(reports, feature) {
        const weeklyAdoption = {};
        
        reports.forEach(report => {
            if (report.analytics.clicksByCategory?.[feature] > 0) {
                const week = this.getWeekKey(report.createdAt);
                if (!weeklyAdoption[week]) weeklyAdoption[week] = new Set();
                weeklyAdoption[week].add(report.userData.userHash);
            }
        });
        
        return Object.entries(weeklyAdoption)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([week, users]) => ({
                week,
                adoptedUsers: users.size
            }));
    }

    calculateFeatureStickiness(reports) {
        const userFeatureUsage = {};
        
        reports.forEach(report => {
            const userHash = report.userData.userHash;
            if (!userFeatureUsage[userHash]) userFeatureUsage[userHash] = {};
            
            if (report.analytics.clicksByCategory) {
                Object.keys(report.analytics.clicksByCategory).forEach(feature => {
                    if (!userFeatureUsage[userHash][feature]) userFeatureUsage[userHash][feature] = 0;
                    userFeatureUsage[userHash][feature]++;
                });
            }
        });
        
        const stickiness = {};
        Object.values(userFeatureUsage).forEach(userFeatures => {
            Object.entries(userFeatures).forEach(([feature, sessions]) => {
                if (!stickiness[feature]) stickiness[feature] = [];
                stickiness[feature].push(sessions);
            });
        });
        
        const avgStickiness = {};
        Object.entries(stickiness).forEach(([feature, sessions]) => {
            avgStickiness[feature] = this.average(sessions);
        });
        
        return avgStickiness;
    }

    calculateDistribution(values) {
        const buckets = { low: 0, medium: 0, high: 0 };
        
        values.forEach(value => {
            if (value < 3) buckets.low++;
            else if (value < 7) buckets.medium++;
            else buckets.high++;
        });
        
        return buckets;
    }

    // Additional helper methods would continue here...
    calculateAverageLifespan(userFirstSeen, userLastSeen) {
        const lifespans = Object.keys(userFirstSeen).map(userHash => {
            const first = userFirstSeen[userHash];
            const last = userLastSeen[userHash];
            return Math.floor((last - first) / (1000 * 60 * 60 * 24)); // days
        });
        
        return this.average(lifespans);
    }

    calculateChurnRate(userFirstSeen, userLastSeen) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const churnedUsers = Object.keys(userLastSeen).filter(userHash => 
            userLastSeen[userHash] < thirtyDaysAgo
        );
        
        return (churnedUsers.length / Object.keys(userLastSeen).length) * 100;
    }

    calculateNewVsReturning(reports) {
        const userSessions = {};
        
        reports.forEach(report => {
            const userHash = report.userData.userHash;
            if (!userSessions[userHash]) userSessions[userHash] = 0;
            userSessions[userHash]++;
        });
        
        const newUsers = Object.values(userSessions).filter(sessions => sessions === 1).length;
        const returningUsers = Object.values(userSessions).filter(sessions => sessions > 1).length;
        
        return {
            newUsers,
            returningUsers,
            newUserPercentage: (newUsers / (newUsers + returningUsers)) * 100
        };
    }

    calculateCTRTrends(reports) {
        const weeklyCTR = {};
        
        reports.forEach(report => {
            const week = this.getWeekKey(report.createdAt);
            const sessionDuration = report.userData.sessionDuration || 1;
            const ctr = (report.analytics.buttonClicks || 0) / (sessionDuration / 60);
            
            if (!weeklyCTR[week]) weeklyCTR[week] = [];
            weeklyCTR[week].push(ctr);
        });
        
        return Object.entries(weeklyCTR)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([week, ctrs]) => ({
                week,
                averageCTR: this.average(ctrs)
            }));
    }

    calculateErrorTrends(reports) {
        const weeklyErrors = {};
        const weeklyTotal = {};
        
        reports.forEach(report => {
            const week = this.getWeekKey(report.createdAt);
            const isError = report.type === 'error' || report.title.toLowerCase().includes('error');
            
            if (!weeklyErrors[week]) weeklyErrors[week] = 0;
            if (!weeklyTotal[week]) weeklyTotal[week] = 0;
            
            if (isError) weeklyErrors[week]++;
            weeklyTotal[week]++;
        });
        
        return Object.keys(weeklyTotal)
            .sort()
            .map(week => ({
                week,
                errorRate: (weeklyErrors[week] || 0) / weeklyTotal[week] * 100,
                totalErrors: weeklyErrors[week] || 0,
                totalSessions: weeklyTotal[week]
            }));
    }

    categorizeErrors(errorSessions) {
        const categories = {
            authentication: 0,
            network: 0,
            ui: 0,
            data: 0,
            other: 0
        };
        
        errorSessions.forEach(report => {
            const title = report.title.toLowerCase();
            const body = report.body.toLowerCase();
            
            if (title.includes('auth') || title.includes('login') || title.includes('token')) {
                categories.authentication++;
            } else if (title.includes('network') || title.includes('connection') || title.includes('api')) {
                categories.network++;
            } else if (title.includes('ui') || title.includes('interface') || title.includes('display')) {
                categories.ui++;
            } else if (title.includes('data') || title.includes('load') || title.includes('save')) {
                categories.data++;
            } else {
                categories.other++;
            }
        });
        
        return categories;
    }

    calculateEngagementTrend(reports) {
        const weeklyEngagement = {};
        
        reports.forEach(report => {
            const week = this.getWeekKey(report.createdAt);
            const sessionDuration = report.userData.sessionDuration || 0;
            const clicks = report.analytics.buttonClicks || 0;
            const notes = report.analytics.notesCreated || 0;
            
            const engagementScore = (
                (sessionDuration * 0.3) + 
                (clicks * 0.4) + 
                (notes * 0.3)
            ) / 10;
            
            if (!weeklyEngagement[week]) weeklyEngagement[week] = [];
            weeklyEngagement[week].push(engagementScore);
        });
        
        return Object.entries(weeklyEngagement)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([week, scores]) => ({
                week,
                averageEngagement: this.average(scores),
                totalSessions: scores.length
            }));
    }
}

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.PerformanceAnalytics = PerformanceAnalytics;
}