const callInWindow = require('callInWindow');
const getType = require('getType');
const logToConsole = require('logToConsole');
const Object = require('Object');
const makeTableMap = require('makeTableMap');
const containerVersion = require('getContainerVersion')();
const createArgumentsQueue = require('createArgumentsQueue');
const getTimestampMillis = require('getTimestampMillis');
const copyFromWindow = require('copyFromWindow');
const injectScript = require('injectScript');
const encodeUri = require('encodeUri');
const encodeUriComponent = require('encodeUriComponent');
const copyFromDataLayer = require('copyFromDataLayer');

/******* Helper Functions *******/

/**
 * Logs messages to the console based on debug mode or user preference.
 * Only logs to console, if:
 * - is on preview and debug mode, always
 * or
 * - production, if the checkbox data.enableLog is checked.
 * @param {string} message - The log message to display.
 * @param {*} content - Additional content to log, such as objects or variables.
 */
const log = (message, content) => {
  const logIdentifier = '[Firebase & GA4 Webview Global Handler] | command: ' + data.command;
  const isInPreviewOrDebugMode = containerVersion.previewMode || containerVersion.debugMode;
  if (data.enableLog || isInPreviewOrDebugMode) logToConsole(logIdentifier, '|', message, content);
};

/**
 * Merges two object literals together (non-recursively).
 *
 * @param object obj - The object to merge into.
 * @param object obj2 - The object to merge from.
 * @returns {Object}
 */
const mergeObj = (target, source) => {
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
};

/**
 * Merges settings from two table maps into an object literal
 *
 * @param {string} fromVar - The variable containing default settings.
 * @param {string} tableKey - The key for the table map containing overrides.
 * @returns {Object} - The merged settings object.
 */
const mergeSettings = (fromVar, tableKey) => {
  const defaults = getType(data[fromVar]) === 'object' ? data[fromVar] : {};
  const overrides = data[tableKey] && data[tableKey].length ? makeTableMap(data[tableKey], 'name', 'value') : {};
  return mergeObj(defaults, overrides);
};

/******* Main Functions *******/

/**
 * Firebase commands to interact with Firebase Analytics.
 */
const firebaseCommands = {
  firebaseAnalyticsHandlerName: data.firebaseAnalyticsHandlerName || 'firebaseAnalyticsHandler',
 
  logEvent: function logEvent(eventName, params) {
    log('Firebase command "logEvent"', arguments);
    callInWindow(firebaseCommands.firebaseAnalyticsHandlerName + '.logEvent', eventName, params);
  },
  setUserProperty: function setUserProperty(name, value) {
    log('Firebase command "setUserProperty"', arguments);
    callInWindow(firebaseCommands.firebaseAnalyticsHandlerName + '.setUserProperty', name, value);
  },
  setDefaultEventParameters: function setDefaultEventParameters(params) {
    log('Firebase command "setDefault EventParameters"', arguments);
    callInWindow(firebaseCommands.firebaseAnalyticsHandlerName + '.setDefaultEventParameters', params);
  },
  setUserId: function setUserId(userId) {
    log('Firebase command "setUserId"', arguments);
    callInWindow(firebaseCommands.firebaseAnalyticsHandlerName + '.setUserId', userId);
  },
  setAnalyticsCollectionEnabled: function setAnalyticsCollectionEnabled(value) {
    log('Firebase command "setAnalyticsCollectionEnabled"', arguments);
    callInWindow(firebaseCommands.firebaseAnalyticsHandlerName + '.setAnalyticsCollectionEnabled', value);
  },
  resetAnalyticsData: function resetAnalyticsData() {
    log('Firebase command "resetAnalyticsData"', arguments);
    callInWindow(firebaseCommands.firebaseAnalyticsHandlerName + '.resetAnalyticsData');
  },
  setConsent: function setConsent(consentSettings) {
    log('Firebase command "setConsent"', arguments);
    callInWindow(firebaseCommands.firebaseAnalyticsHandlerName + '.setConsent', consentSettings);
  },
  
};

/**
 * gtag commands to interact with Google Analytics.
 */
const gtagCommands = {
  event: function event(eventName, params) {
    const gtag = getOrSetGtagGlobal();
    log('gtag command "event"', arguments);
    gtag('event', data.eventName, params);
  },
  config: function config(measurementId, params) {
    const gtag = getOrSetGtagGlobal();
    log('gtag command "config"', arguments);
    gtag('config', measurementId, params);
  }
};

/**
 * Injects the gtag script into the page.
 *
 * @param {Function} gtag - The gtag function.
 * @param {string} dataLayerName - The name of the data layer.
 */
const injectGtagScript = (gtag, dataLayerName) => {
  /**
   * Gtag script definition.
   * If you want to load gtag from your own 1st party domain, 
   * you can change the hostname and path here.
   */
  const script = {
    hostname: data.gtagHostname || 'www.googletagmanager.com',
    path: data.gtagPath || '/gtag/js',
    queryParameters: {
      id: 'id=' + data.gtagMeasurementId,
      l: 'l=' + dataLayerName
    }
  };
  log('gtag.js script configuration', script);
  injectScript(
    'https://' +
      script.hostname +
      encodeUri(script.path) +
      '?' +
      encodeUriComponent(script.queryParameters.id) +
      '&' +
      encodeUriComponent(script.queryParameters.l) +
      '&cx=c',
    () => { log('gtag loaded successfully'); },
    () => { log('gtag failed to load'); },
    dataLayerName
  );
  const gtagJsTimestamp = getTimestampMillis();
  gtag('js', { getTime: () => { return gtagJsTimestamp; } });
};

/**
 * Ensures the gtag global function exists and returns it.
 *
 * @returns {Function} - The gtag function.
 */
const getOrSetGtagGlobal = () => {
  const namespace = data.namespaceName || 'gtag';
  const dataLayerName = data.dataLayerName || 'dataLayer';
  
  log('gtag global namespace and dataLayerName', {
    namespace: namespace,
    dataLayerName: dataLayerName
  });
  
  let gtag = copyFromWindow(namespace);
  if (!gtag) gtag = createArgumentsQueue(namespace, dataLayerName);
  if (data.loadGtag) injectGtagScript(gtag, dataLayerName);
  return gtag;
};

/**
 * Main function to execute the template logic.
 */
const main = () => {
  // Configuration Settings
  const configSettings = mergeSettings('configurationSettingsFromVariable', 'configurationSettingsList'); 
  log('configSettings', configSettings);
  
  // Event Parameters
  let parameters = mergeSettings('parametersFromVariable', 'parametersList');
  log('parameters', parameters);
  parameters = mergeObj(parameters, configSettings);
  
  // Ecommerce Data
  if (data.sendEcommerceData) {
    let ecommerce;
    switch(data.ecommerceDataSource) {
      case 'dataLayer':
        // Using data layer version 1 to avoid recursive merge. This is what GTM does under the hood.
        ecommerce = copyFromDataLayer('ecommerce', 1);
        break;
      case 'customObject':
        ecommerce = data.ecommerceDataObjectVariable;
        break;
    }
    log('ecommerce', ecommerce);
    parameters = mergeObj(parameters, ecommerce || {});
  }
  
  log('parameters after merging configSettings and ecommerce', parameters);

  // User Properties merging into one object (they can be present in configSettings, parameters or userProperties).
  let userProperties = mergeSettings('userPropertiesFromVariable', 'userPropertiesList');
  log('userProperties', userProperties);
  if (
    getType(configSettings.user_properties) === 'object' || 
    getType(parameters.user_properties) === 'object' ||
    getType(userProperties) === 'object'
  ) {
    userProperties = mergeObj(
      parameters.user_properties || {},
      mergeObj(userProperties || {}, configSettings.user_properties || {})
    );
    if (configSettings.user_properties) Object.delete(configSettings, 'user_properties');
    if (parameters.user_properties) Object.delete(parameters, 'user_properties');
  }
  log('userProperties after merging', userProperties);
  
  const userId = parameters.user_id || userProperties.user_id;

  const isRunningInWebview = !!data.isRunningInWebview;
  log('Is running in webview?', isRunningInWebview);
  
  const command = data.command;
  
  if (isRunningInWebview) {
    switch(command) {
      case 'event':
        if (userId) {
          Object.delete(parameters, 'user_id');
          Object.delete(userProperties, 'user_id');
          firebaseCommands.setUserId(userId);
        }
        Object.entries(userProperties).forEach((entry) => firebaseCommands.setUserProperty(entry[0], entry[1]));
        firebaseCommands.logEvent(data.eventName, parameters);
        break;
      case 'setUserProperty':
        if (userId) {
          Object.delete(userProperties, 'user_id');
          firebaseCommands.setUserId(userId);
        }
        Object.entries(userProperties).forEach((entry) => firebaseCommands[command](entry[0], entry[1]));
        break;
      case 'setDefaultEventParameters':
        if (userId) {
          Object.delete(parameters, 'user_id');
          firebaseCommands.setUserId(userId);
        }
        firebaseCommands[command](parameters);
        break;
      case 'setUserId':
        firebaseCommands[command](data.userId); // data.userId is from the template field.
        break;
      case 'setAnalyticsCollectionEnabled':
        const enabled = !!data.analyticsCollectionEnabled;
        firebaseCommands[command](enabled);
        break;
      case 'resetAnalyticsData':
        firebaseCommands[command]();
        break;
      case 'setConsent':
        const consentSettings = mergeSettings('consentSettingsFromVariable', 'consentSettingsList');
        log('consentSettings', consentSettings);
        firebaseCommands[command](consentSettings);
        break;
      default:
        log('No command will run in Firebase Analytics.');
    }
  } else {
    const measurementId = data.gtagMeasurementId;
    
    const userProvidedData = mergeSettings('userProvidedDataFromVariable', 'userProvidedDataList');
    log('userProvidedData', userProvidedData);
    // https://support.google.com/tagmanager/answer/13438771?hl=en#:~:text=x-,user_data,-object
    if (data.enableUserProvidedData && Object.entries(userProvidedData).length) parameters.user_data = userProvidedData;
    
    if (Object.entries(userProperties).length) parameters.user_properties = userProperties;
    
    if (data.dataLayerVariableFlagName) parameters[data.dataLayerVariableFlagName] = true;
 
    switch(command) {
      case 'event':
        parameters.send_to = [measurementId];
        if (data.sendTo) data.sendTo.forEach((destination) => parameters.send_to.push(destination.id));
        gtagCommands[command](data.eventName, parameters);
        break;
      case 'config':
        parameters.send_page_view = data.sendPageView;
        if (data.gtagGroups) {
          parameters.groups = ['default'];
          data.gtagGroups.forEach((group) => parameters.groups.push(group.name));
        }
        gtagCommands[command](measurementId, parameters);
        break;
      default:
        log('No command will run in Firebase Analytics.');
    }
  }
};

/**********************************************************************************************************/

// Entry point.
log('data: ', data);
main();
data.gtmOnSuccess();