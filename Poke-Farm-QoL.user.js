// ==UserScript==
// @name         Poké Farm QoL NEW
// @namespace    https://github.com/KaizokuBento/
// @author       Bentomon
// @homepage	 https://github.com/KaizokuBento/PokeFarmShelter
// @downloadURL  https://github.com/KaizokuBento/PokeFarmShelter/raw/master/Poke-Farm-QoL.user.js
// @description  Quality of Life changes to Pokéfarm!
// @match        https://pokefarm.com/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @resource     QoLSettingsMenuHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/Test/resources/templates/qolSettingsMenuHTML.html
// @resource     shelterSettingsHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/Test/resources/templates/shelterOptionsHTML.html
// @resource     QoLCSS                 https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/Test/resources/css/pfqol.css
// @updateURL    https://github.com/KaizokuBento/PokeFarmQoL/raw/master/Poke-Farm-QoL.user.js
// @version      0.0.2
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==


(function($) {
    'use strict';
    /////////////////////////////////////
    // Welcome to my first ever script!//
    // Let's hope everything works~    //
    /////////////////////////////////////

	let PFQoL = (function PFQoL() {

		const DEFAULT_USER_SETTINGS = { // default settings when the script gets loaded the first time
		//userscript settings
		shelterEnable: true,
		//shelter settings
		shelterSettings: {
			newEgg: true,
			newPokemon: true,
			newShiny: true,
			newAlbino: true,
			newMelanistic: true,
			newPrehistoric: true,
			newDelta: true,
			newMega: true,
			newStarter: true,
			newCustomSprite: true,
			male: true,
			female: true,
			noGender: true,
			},
		};

		const SETTINGS_SAVE_KEY = 'QoLSettings'; // the name of the local storage
		
		const VARIABLES = { // all the variables that are going to be used in fn
			userSettings : DEFAULT_USER_SETTINGS,
		}

		const TEMPLATES = { // all the new/changed HTML for the userscript
			headerSettingsLinkHTML	: `<a href=https://pokefarm.com/farm#tab=1>QoL Userscript Settings</a href>`,
			qolSettingsMenuHTML		: GM_getResourceText('QoLSettingsMenuHTML'),
			shelterSettingsHTML		: GM_getResourceText('shelterSettingsHTML'),
		};

		const fn = { // all the functions for the script
			/** background stuff */
			backwork : { // background, stuff the user won't interact with but is needed for the userscript to work
				setupHTML() { // injects the HTML changes from TEMPLATES into the site
					// Header link to Userscript settings
					document.querySelector('#head-right').insertAdjacentHTML('beforebegin', TEMPLATES.headerSettingsLinkHTML);

					// QoL userscript Settings Menu in farmnews
					if(window.location.href.indexOf("farm#tab=1") != -1){ // Creating the QoL Settings Menu in farmnews
						document.querySelector('#farmnews').insertAdjacentHTML("afterbegin", TEMPLATES.qolSettingsMenuHTML);
						
					}
					
					// shelter Settings Menu
					if (window.location.href.indexOf("shelter") != -1) {
						document.querySelector("#shelterupgrades").insertAdjacentHTML("afterend", TEMPLATES.shelterSettingsHTML);
						document.querySelector("#shelteroptionsqol").insertAdjacentHTML("beforebegin", "<h3>QoL Settings</h3>");
					}
				},
				setupCSS() { // All the CSS changes are added here
					GM_addStyle(GM_getResourceText('QoLCSS'));
				},
				setupInitialSettings() { // Makes the local storage save key QoLSettings with default user settings on first start
					if (localStorage.getItem(SETTINGS_SAVE_KEY) === null) {
						localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(VARIABLES.userSettings));
					} else {
						localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(VARIABLES.userSettings));
					}
				},
				startup() { // All the functions that are run to start the script on Pokéfarm
					return {
						'setting up CSS'	: fn.backwork.setupCSS,
						'setting up HTML' 	: fn.backwork.setupHTML,
						'setting settings'	: fn.backwork.setupInitialSettings,
						'will this work?'	: fn.API.userscriptSettings,
					}
				},
				init() { // Starts all the functions.
						console.log('Starting up ..');
						let startup = fn.backwork.startup();
						for (let message in startup) {
							if (!startup.hasOwnProperty(message)) {
								continue;
							}
							console.log(message);
							startup[message]();
						}
					},
			}, // end of backwork

			/** public stuff */
			API : { // the actual seeable and interactable part of the userscript
				userscriptSettings () {
					if(window.location.href.indexOf("farm#tab=1") != -1){
						if($('#shelterOn').prop('checked')) {
							alert("It's checked");
						} else {
							alert("you unchecked");
						}
					}
				},
			}, // end of API
		}; // end of fn

		fn.backwork.init();

		return fn.API;
	})(); // end of PFQoL function
})(jQuery); //end of userscript