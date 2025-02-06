#  GA4 Unified Tag for Webview (Web & App) | Commands Tag
The **GA4 Unified Tag for Webview (Web & App) | Commands Tag** Google Tag Manager (GTM) template routes analytics data to Google Analytics 4 (web) or Firebase Analytics (app) based on whether GTM is running in a webview. It supports event logging, user properties, ecommerce tracking, and consent management for both web and app environments.

It ensures seamless integration by dynamically deciding between `gtag` (Web) and Firebase's native bridge (App). This way, you can use a single event tag to track both environments (app and web).

You can even replace the existing Google Tag and GA4 default tag template with this one.

## Preface
This tag template won't be for everyone. This template is geared more toward GTM power users with advanced implementation practices that require a more robust UI. This tag template took inspiration from [WebMechanix Improved GA4 Tag Template for GTM](https://github.com/WebMechanix/gtm-improved-ga4) created by [Derek Cavaliero](https://github.com/derekcavaliero) that used a similar UI pattern.

## What it does

1. (Web) Load the gtag.js library if needed. With the possibility of changing the default domain (`www.googletagmanager.com`) and path (`/gtag/js`) to custom values.
2. (Web) Registers an arguments queue (`gtag`) on the default `dataLayer` global, with the possibility of changing them to custom names.
3. (Web and App) Implements a better UI that accepts a variable that returns a JavaScript object with the fields/parameters/properties you want to set. This object will be merged with any additional fields you set via a normal `key:value` table. Any object key conflicts will always use the explicitly defined value in the `key:value` table.
5. (Web) Supports sending the events to multiple Measurement IDs and groups (using `gtag` routing).
6. (Web) Supports all the features of the default **GA4** tag template (ecommerce, user properties, user-provided data etc.).
7. (Web) Supports all the features of the default **Google Tag** tag template (Configuration settings etc.).
8. (Web and App) Supports using a single event tag that will route the data either to the app or to the web depending on whether GTM is running in a webview, without the need to duplicate tags for both environments.
9. (App) Supports the Firebase Analytics methods:
    - [logEvent](https://firebase.google.com/docs/reference/kotlin/com/google/firebase/analytics/FirebaseAnalytics?hl=en#logEvent(java.lang.String,android.os.Bundle))
    - [setUserProperty](https://firebase.google.com/docs/reference/kotlin/com/google/firebase/analytics/FirebaseAnalytics?hl=en#setUserProperty(java.lang.String,java.lang.String))
    - [setUserId](https://firebase.google.com/docs/reference/kotlin/com/google/firebase/analytics/FirebaseAnalytics?hl=en#setUserId(java.lang.String))
    - [setDefaultEventParameters](https://firebase.google.com/docs/reference/kotlin/com/google/firebase/analytics/FirebaseAnalytics?hl=en#setDefaultEventParameters(android.os.Bundle))
    - [setAnalyticsCollectionEnabled](https://firebase.google.com/docs/reference/kotlin/com/google/firebase/analytics/FirebaseAnalytics?hl=en#setAnalyticsCollectionEnabled(boolean))
    - [resetAnalyticsData](https://firebase.google.com/docs/reference/kotlin/com/google/firebase/analytics/FirebaseAnalytics?hl=en#resetAnalyticsData())
    - [setConsent](https://firebase.google.com/docs/reference/kotlin/com/google/firebase/analytics/FirebaseAnalytics?hl=en#setConsent(java.util.Map%3Ccom.google.firebase.analytics.FirebaseAnalytics.ConsentType,com.google.firebase.analytics.FirebaseAnalytics.ConsentStatus%3E))

## Example
Below you will find a possible configuration scenario.

- Google Tag (`config` command). For web only.
![image](https://github.com/user-attachments/assets/05711ae1-6089-4a3e-803f-219170629e7d)

- Event Tag. For both web and app.
![image](https://github.com/user-attachments/assets/eed75123-0f80-46ac-b225-5239c0730a59)

- `setDefaultEventParams` for app.
![image](https://github.com/user-attachments/assets/57a31f69-8cb4-435e-816d-f2e678de8a43)

## Installation & Setup
### 1. Import the Template into GTM
1. Download the `tpl` file.
2. In **GTM**, navigate to **Templates** > **Tag Templates**.
3. Click **New** > **Import**.
4. Select the template file and save it.

This template has been submitted to the Google Tag Manager Template Gallery. Once it's approved, you don't need to manually import it anymore. Just search it via the GTM UI.

### 2. Implement necessary dependencies
For Firebase Analytics tracking in webviews, there are some steps you need to complete. that the native app has the **Javascript Handler** and the **Native Interfaces** implemented.

#### 2.1 Add the Firebase SDK to your app.
Use the [reference article from Google](https://firebase.google.com/docs/analytics/get-started).

#### 2.2 Implement a way to identify the webview
Implement a way to signal to the GTM container that it is running inside of a webview. 

You can use a cookie, query parameter, global variable, User Agent or any other data for this purpose.

[TO DO Reference to the app codebase where I do this]

#### 2.3 Implement the Javascript Handler in your webview
This is object is a global variable defined by us and it doesn't have anything to do with Firebase Analytics. You can change the name if you want. It holds the abstraction for calling the iOS or Android Firebase Analytics interfaces.

This global variable must be added either via the [GTM template](https://github.com/giovaniortolani/ga4-unified-tag-for-webview-web-app-firebase-analytics-handler-global-variable-initialization) `GA4 Unified Tag for Webview (Web & App) | Firebase Analytics Handler Global Variable Initialization`, or via the [source code](https://github.com/giovaniortolani/ga4-unified-tag-for-webview-web-app-firebase-analytics-handler-global-variable-initialization/blob/main/source-code-es6-version.js) by your developers.

- Via the [GTM template](https://github.com/giovaniortolani/ga4-unified-tag-for-webview-web-app-firebase-analytics-handler-global-variable-initialization) `GA4 Unified Tag for Webview (Web & App) | Firebase Analytics Handler Global Variable Initialization`
![image](https://github.com/user-attachments/assets/3182692b-2d72-404d-a1f4-10e6d122d572)

- Via the source code
![image](https://github.com/user-attachments/assets/edba2c6f-1f32-405d-ab50-69580ab55ab5)

It must be added before GTM starts sending events to Firebase (if adding via the GTM template, use the Initialization trigger; if adding via the source code, ensure that this code runs early on the page, ideally before GTM loads).

[TO DO - Add reference to the app code base where I do this]

Check the ["Implement JavaScript handler" section in the reference article from Google](https://firebase.google.com/docs/analytics/webview?platform=android#implement-javascript-handler).

#### 2.3 Implement the Native Interfaces in your webview

Add the Native Interface in your app source code.

Check the **"Implement native interface" section in the reference article from Google**:
- [Android](https://firebase.google.com/docs/analytics/webview?platform=android#implement_native_interface)
- [iOS](https://firebase.google.com/docs/analytics/webview?platform=ios#implement_native_interface)

If you have **separate code bases** for Android and iOS, you can follow the steps outline above in the referece article.

However, if you have the **same code base** for both (i.e., you use React Native, Flutter etc.), you can implement a common interface.
Some implementation examples:
- [React Native](https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md#the-windowreactnativewebviewpostmessage-method-and-onmessage-prop)
- [Flutter](https://stackoverflow.com/a/64429209/4043937)

[TO DO - Add reference to the app code base where I do this]

Make sure to use the same names for the Native Interfaces here and in the **2.2 Implement the Javascript Handler in your webview** section.

## Caveat

One point of caution here is that: since we are using `gtag`, it has the power to trigger GTM triggers if the event name used in the `gtag` call is an event used by a GTM trigger.

Reason: `gtag` is nothing more than a data layer push 
```js
window.gtag = function() { window.dataLayer.push(arguments); }.
```

Example: the call `gtag('event', 'purchase', { ... })` can trigger triggers that expect the event **'purchase'**. Whereas the call to `gtag('event', 'conversion', { ... })` can trigger triggers that expect the event **'conversion'**.

By default, the **'conversion'** event was left configured, as suggested by Google Ads documentation. However, the same caution applies: be sure to check for triggers that fire on this event.

Note that native Google Ads conversion tags in GTM use the **'purchase'** event. Nevertheless, no problems were identified in using **'conversion'** as the event name.

However, if product information is passed in the tag (via the `items` parameter), the template will use the **'purchase'** event, as mandated by the documentation. Here it is necessary to be careful, as it will trigger some triggers that expect the **'purchase'** event.

💡
To address this issue, simply create a variable of type *Data Layer* using the `eventModel.from_gtm_template` variable from the data layer (this template inserts this key in all its events).

- In the trigger, this variable should be inserted with the comparison *does not equal true*.
- Or, if you don't want to modify the original trigger, you can use an exception trigger. Add this variable to it with the comparison *equals true*.

## Limitations

### `dataLayer` array and `gtag` queue
Google's Sandboxed Javascript doesn't allow for the ability to customize what global variable is used for the `dataLayer` array and `gtag` queue. If you need to specify a non-default `dataLayer` and `gtag` global, you will need to edit the corresponding fields on the template and the template permissions as well.

### gtag.js is loaded from www.googletagmanager.com
Google's Sandboxed Javascript doesn't allow for the ability to customize what domain and path is used to load the `gtag.js` library. If you wish to load the `gtag.js` file in a non-default way (e.g. proxy through a sGTM container or other 1st party means) you will need to edit the corresponding fields on the template and the template permissions as well.

### Built-in consent checks
This tag template has not yet been adjusted to use built-in consent checks for things like consent-mode that the default GA4 tag templates do.

## Author(s)
[Giovani Ortolani Barbosa](https://www.linkedin.com/in/giovani-ortolani-barbosa/)
