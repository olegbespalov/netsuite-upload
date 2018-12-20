# netsuite-upload VS Code plugin

[![Version](http://vsmarketplacebadge.apphb.com/version/tomastvrdy.netsuite-upload.svg)](https://marketplace.visualstudio.com/items?itemName=tomastvrdy.netsuite-upload)

**netsuite-upload** is a Visual Studio Code extension that allows you to manage your SuiteScript files directly from the IDE & helps you with defining of new momdules & module dependecies

## Features
### 1. NetSuite File Cabinet Management
Right-click the file/folder in the navigation panel to see the options:

- `Pull file from NetSuite` - downloads file from NetSuite
- `Push file to NetSuite` - uploads file to NetSuite
- `Delete file in NetSuite` - deletes file in NetSuite
- `Compare file with NetSuite` - compares your local version with the NetSuite one
- `Pull folder from NetSuite` - Download the folder content from NetSuite

![Snippet & commands](img/netsuite_upload.gif)  

### 2. Snippets & commands

- `Snippets for module initialization` - type *defineRestlet...*, choose your module type and hit enter
- `Commands for adding new NetSuite/custom dependencies` - open command line (`Ctrl`-`Shift`-`P`) and type
	- *add netsuite dependency* for choosing of the NetSuite built-in module from the list
	- *add custom dependency* for defining od custom dependecies 

![Snippet & commands](img/snippet_addModule.gif)  

## Setup
##### NetSuite setup
- Upload `netSuiteRestlet/vscodeExtensionRestlet.js` file somewhere in the `SuiteScripts` folder in NetSuite
- Create and deploy RESTlet using the file. (RESTlet URL will be set in the `settings.json`)

##### VSCode project setup
- Open your local root **SuiteScripts** folder in VSCode
- If not yet created, create one or update the project `settings.json` inside the `.vscode` folder
- Copy the following code to `settings.json` and update with your settings

##### OAuth Authentication
- If you wish to use OAuth authentication instead of basic authentication you can leave the authentication header blank and use the OAuth settings properties
- First generate an Integration record in NetSuite, make sure the 'token based authentication' scheme is checked, and save the token and secret
- Second log into a role you wish to use for authentication and from the manage tokens center generate a new token and secret using the Integration from the previous step
- Input the 4 values from above in the corresponding settings options along with the account number in the realm property

**settings.json**
```javascript
{
	// Authentication header
  	"netSuiteUpload.authentication": "NLAuth nlauth_account=<ACCOUNTID>, nlauth_email=<LOGIN>, nlauth_signature=<PASSWORD>, nlauth_role=<ROLE>",

	// Restlet URL
	"netSuiteUpload.restlet": "<RESTlet URL>",

	// Temporary folder (e.g. C:\\temp) - used for storing compared file
	"netSuiteUpload.tempFolder": "<TEMP FOLDER PATH>",
	// Oauth Integration Key
	"netSuiteUpload.netsuiteKey": "<INTEGRATION KEY>",
    // Oauth Integration Secret
	"netSuiteUpload.netsuiteSecret": "<INTEGRATION SECRET>",
    // Oauth Consumer Key
	"netSuiteUpload.consumerToken": "<CONSUMER KEY>",
    // Oauth Consumer Secret
	"netSuiteUpload.consumerSecret": "<CONSUMER SECRET>",
    // Account number
	"netSuiteUpload.realm": "<ACCOUNT NUMBER>"
}
```

## Limitation
The plugin is using RESTlet for the communication with the NetSuite which is having some governance limitation. Current implementation does not deal with this problem, so there could be a problem to pull folders containing a lot of items from NetSuite.