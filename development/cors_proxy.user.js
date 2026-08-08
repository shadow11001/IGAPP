// ==UserScript==
// @name         Dispatch Assistant CORS Proxy
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Bypasses CORS for Dispatch Assistant standalone file to pull ServiceChannel data
// @author       You
// @match        file:///*
// @match        https://em.walmart.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    // ---- TOKEN SNIFFER (runs on em.walmart.com) ----
    if (window.location.hostname === 'em.walmart.com') {
        const origOpen = XMLHttpRequest.prototype.open;
        const origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

        XMLHttpRequest.prototype.open = function(method, url) {
            this._url = url;
            origOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
            if (header.toLowerCase() === 'authorization' && this._url && this._url.includes('weiot-em-telemetryapi.prod.walmart.com')) {
                // Intercept and store the JWT
                console.log("[Dispatch Assistant] Sniffed IoT Telemetry API Token!");
                GM_setValue('iot_jwt_token', value);
            }
            origSetRequestHeader.apply(this, arguments);
        };
        // We do not execute the rest of the proxy script on the walmart domain
        return;
    }

    // ---- CORS PROXY (runs on file:///*) ----

    window.addEventListener('fetchFromServiceChannel', function(e) {
        if (!e.detail || !e.detail.woId) return;
        
        const woId = e.detail.woId;
        const createWoUrl = `https://www.servicechannel.com/sc/wo/WorkOrders/CreateWorkorderDetailsModel?id=${woId}`;
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: createWoUrl,
            headers: {
                "Accept": "application/json"
            },
            onload: function(createWoRes) {
                try {
                    if (createWoRes.status !== 200) {
                        return window.dispatchEvent(new CustomEvent('serviceChannelDataReady', { detail: { woId: woId, error: `Invalid status ${createWoRes.status}` } }));
                    }
                    const createWoData = JSON.parse(createWoRes.responseText);

                    // Helper to recursively find a key
                    const findKey = (obj, targetKey) => {
                        if (!obj || typeof obj !== 'object') return null;
                        if (obj[targetKey]) return obj[targetKey];
                        for (const key of Object.keys(obj)) {
                            const result = findKey(obj[key], targetKey);
                            if (result) return result;
                        }
                        return null;
                    };

                    const locationId = findKey(createWoData, 'LocationId');
                    
                    if (!locationId) {
                        window.dispatchEvent(new CustomEvent('serviceChannelDataReady', { detail: { woId: woId, error: 'No LocationId found' } }));
                        return;
                    }

                    // Extract StoreId, Priority, and Trade
                    const storeId = findKey(createWoData, 'StoreId');
                    const priority = findKey(createWoData, 'Priority');
                    let trade = findKey(createWoData, 'Trade');
                    
                    // Handle "FM - " prefix for Trade if it exists
                    if (trade && trade.startsWith("FM - ")) {
                        trade = trade.substring(5).toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                    } else if (trade) {
                        trade = trade.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                    }

                    let rack = '';
                    let systems = '';
                    const desc = findKey(createWoData, 'Description');
                    if (desc && typeof desc === 'string') {
                        const parts = desc.split('|');
                        for (let p of parts) {
                            if (p.includes('Rack Associated:')) {
                                rack = p.split('Rack Associated:')[1].trim();
                            } else if (p.includes('Systems Affected:')) {
                                systems = p.split('Systems Affected:')[1].trim();
                            }
                        }
                    }

                    let techName = findKey(createWoData, 'TechnicianName') || 
                                   findKey(createWoData, 'TechName') || 
                                   findKey(createWoData, 'CallerName') || 
                                   findKey(createWoData, 'Caller');
                                   
                    if (!techName || typeof techName === 'object') {
                        const prov = findKey(createWoData, 'Provider');
                        if (prov && typeof prov === 'object') {
                            techName = prov.PrimaryContact || prov.Name || "";
                        } else if (typeof prov === 'string') {
                            techName = prov;
                        } else {
                           techName = "";
                        }
                    }

                    const woData = {
                          store: storeId || "",
                          trade: trade || "",
                          priority: priority || "",
                          rack: rack,
                          systems: systems,
                          techName: techName,
                          status: findKey(createWoData, 'Status') || findKey(createWoData, 'StatusName') || "",
                          description: desc || "",
                          rawWoData: createWoData
                      };
                    
                    const notesUrl = `https://www.servicechannel.com/sc/Location/GetLocationNotes?locationId=${locationId}&includeEmptyValue=false`;
                    
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: notesUrl,
                        headers: {
                            "Accept": "application/json"
                        },
                        onload: function(notesRes) {
                            try {
                                if (notesRes.status !== 200) {
                                    return window.dispatchEvent(new CustomEvent('serviceChannelDataReady', { detail: { woId: woId, error: `Invalid status ${notesRes.status}` } }));
                                }
                                const notesData = JSON.parse(notesRes.responseText);
                                window.dispatchEvent(new CustomEvent('serviceChannelDataReady', { detail: { woId: woId, data: notesData, woData: woData } }));
                            } catch (err) {
                                window.dispatchEvent(new CustomEvent('serviceChannelDataReady', { detail: { woId: woId, error: 'Failed to parse notesData: ' + err.message } }));
                            }
                        },
                        onerror: function(err) {
                            window.dispatchEvent(new CustomEvent('serviceChannelDataReady', { detail: { woId: woId, error: err } }));
                        }
                    });
                    
                } catch (err) {
                    window.dispatchEvent(new CustomEvent('serviceChannelDataReady', { detail: { woId: woId, error: 'Failed to parse createWoData: ' + err.message } }));
                }
            },
            onerror: function(err) {
                window.dispatchEvent(new CustomEvent('serviceChannelDataReady', { detail: { woId: woId, error: err } }));
            }
        });
    });

    window.addEventListener('fetchFromSAOne', function(e) {
        if (!e.detail || !e.detail.storeNumber) return;
        
        const storeNum = e.detail.storeNumber;
        const saOneUrl = `https://saone.walmart.com/api/commonService?apiUrl=%2Fsiteinfo%2FsiteCurrentState&site=${storeNum}&countryCode=US`;
        
        GM_xmlhttpRequest({
            method: 'GET',
            url: saOneUrl,
            headers: {
                "Accept": "application/json"
            },
            onload: function(res) {
                try {
                    if (res.status !== 200) {
                        return window.dispatchEvent(new CustomEvent('saOneDataReady', { detail: { storeNumber: storeNum, error: `Invalid status ${res.status}` } }));
                    }
                    const data = JSON.parse(res.responseText);
                    window.dispatchEvent(new CustomEvent('saOneDataReady', { detail: { storeNumber: storeNum, data: data } }));
                } catch (err) {
                    window.dispatchEvent(new CustomEvent('saOneDataReady', { detail: { storeNumber: storeNum, error: 'Failed to parse SAOne response: ' + err.message } }));
                }
            },
            onerror: function(err) {
                window.dispatchEvent(new CustomEvent('saOneDataReady', { detail: { storeNumber: storeNum, error: err } }));
            }
        });
    });
    window.addEventListener('fetchFromIOT', function(e) {
        if (!e.detail || !e.detail.storeNumber) return;
        
        const storeNum = e.detail.storeNumber;
        const iotUrl = `https://weiot-em-telemetryapi.prod.walmart.com/api/sensors/getsensorhierarchy`;
        const payload = JSON.stringify({
             "cc": "US",
             "storeNo": storeNum,
             "rackIndex": null,
             "sensorIOType": null
        });

        // Retrieve the sniffed token from GM storage
        const currentToken = GM_getValue('iot_jwt_token');

        if (!currentToken) {
             window.dispatchEvent(new CustomEvent('iotDataReady', { detail: { storeNumber: storeNum, error: 'No IoT Auth Token sniffed yet. Please open a tab to https://em.walmart.com/ and let it load.' } }));
             return;
        }
        
        GM_xmlhttpRequest({
            method: 'POST',
            url: iotUrl,
            headers: {
                "Accept": "application/json, text/plain, */*",
                "Content-Type": "application/json",
                "x-tenant": "US",
                "lang": "en",
                "authorization": currentToken
            },
            data: payload,
            onload: function(res) {
                try {
                    if (res.status !== 200 && res.status !== 201) {
                        return window.dispatchEvent(new CustomEvent('iotDataReady', { detail: { storeNumber: storeNum, error: `Invalid status ${res.status}` } }));
                    }
                    const data = JSON.parse(res.responseText);
                    window.dispatchEvent(new CustomEvent('iotDataReady', { detail: { storeNumber: storeNum, data: data, assetString: e.detail.assetString } }));
                } catch (err) {
                    window.dispatchEvent(new CustomEvent('iotDataReady', { detail: { storeNumber: storeNum, error: 'Failed to parse IOT response: ' + err.message } }));
                }
            },
            onerror: function(err) {
                window.dispatchEvent(new CustomEvent('iotDataReady', { detail: { storeNumber: storeNum, error: err } }));
            }
        });
    });
})();
