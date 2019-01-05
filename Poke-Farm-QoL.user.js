// ==UserScript==
// @name         Poké Farm QoL NEW
// @namespace    https://github.com/KaizokuBento/
// @author       Bentomon
// @homepage	 https://github.com/KaizokuBento/PokeFarmShelter
// @downloadURL  https://github.com/KaizokuBento/PokeFarmShelter/raw/master/Poke-Farm-QoL.user.js
// @description  Quality of Life changes to Pokéfarm!
// @match        https://pokefarm.com/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://raw.githubusercontent.com/lodash/lodash/4.17.4/dist/lodash.min.js
// @resource     QoLSettingsMenuHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/Test/resources/templates/qolSettingsMenuHTML.html
// @resource     shelterSettingsHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/Test/resources/templates/shelterOptionsHTML.html
// @resource     QoLCSS                 https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/Test/resources/css/pfqol.css
// @updateURL    https://github.com/KaizokuBento/PokeFarmQoL/raw/Test/Poke-Farm-QoL.user.js
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
		//shelter settings
		shelterSettings: {
			shelterEnable: true,
			findNewEgg: false,
			findNewPokemon: false,
			findShiny: false,
			findAlbino: false,
			findMelanistic: false,
			findPrehistoric: false,
			findDelta: false,
			findMega: false,
			findStarter: false,
			findCustomSprite: false,
			findMale: false,
			findFemale: false,
			findNoGender: false,
			},
		};

		const SETTINGS_SAVE_KEY = 'QoLSettings'; // the name of the local storage

		const VARIABLES = { // all the variables that are going to be used in fn
			userSettings : DEFAULT_USER_SETTINGS,
			loadedSettings : JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY)),
		}

		const TEMPLATES = { // all the new/changed HTML for the userscript
			headerSettingsLinkHTML	: `<a href=https://pokefarm.com/farm#tab=1>QoL Userscript Settings</a href>`,
			qolSettingsMenuHTML		: GM_getResourceText('QoLSettingsMenuHTML'),
			shelterSettingsHTML		: GM_getResourceText('shelterSettingsHTML'),
		}

		const OBSERVERS = {
		}

		const fn = { // all the functions for the script
			/** background stuff */
			backwork : { // backgrounds tuff
				loadSettings() { // initial settings if they do not exist (first run)
					if (localStorage.getItem(SETTINGS_SAVE_KEY) === null) {
						fn.backwork.saveSettings();
					}
				},

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

				saveSettings() { // Save changed settings
					localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(VARIABLES.userSettings));
				},

				startup() { // All the functions that are run to start the script on Pokéfarm
					return {
						'loading Settings'	: fn.backwork.loadSettings,
						'setting up CSS'	: fn.backwork.setupCSS,
						'setting up HTML' 	: fn.backwork.setupHTML,
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
				userSettingsChange () { // change the usersettings
					if ($('#shelterOn').prop("checked")) {
						VARIABLES.userSettings.shelterEnable = true;
					} else {
						VARIABLES.userSettings.shelterEnable = false;
					}
					fn.backwork.saveSettings();
				},

				settingsChange (element) {
					if (JSON.stringify(VARIABLES.userSettings).indexOf(element) >= 0) {
						console.log("this is "+element);
						console.log("is this working?"+JSON.stringify(VARIABLES.userSettings.shelterSettings[element]));
						if (JSON.stringify(VARIABLES.userSettings.shelterSettings[element]) === "false" ) {
							console.log("was false now true");
							VARIABLES.userSettings.shelterSettings[element] = true;
						} else if (JSON.stringify(VARIABLES.userSettings.shelterSettings[element]) === "true" ) {
							console.log("was true now false");
							VARIABLES.userSettings.shelterSettings[element] = false;
						}
					}
					fn.backwork.saveSettings();
				},

				/* shelterSettingsChange () { // change the shelter settings
					if ($('#chkNewEgg').prop("checked")) {
						VARIABLES.userSettings.findNewEgg = true;
					} else {
						VARIABLES.userSettings.findNewEgg = false;
					}

					if ($('#chkNewPokemon').prop("checked")) {
						VARIABLES.userSettings.findNewPokemon = true;
					} else {
						VARIABLES.userSettings.findNewPokemon = false;
					}

					if ($('#chkShiny').prop("checked")) {
						VARIABLES.userSettings.findShiny = true;
					} else {
						VARIABLES.userSettings.findShiny = false;
					}

					if ($('#chkAlbino').prop("checked")) {
						VARIABLES.userSettings.findAlbino = true;
					} else {
						VARIABLES.userSettings.findAlbino = false;
					}

					if ($('#chkMelanistic').prop("checked")) {
						VARIABLES.userSettings.findMelanistic = true;
					} else {
						VARIABLES.userSettings.findMelanistic = false;
					}

					if ($('#chkPrehistoric').prop("checked")) {
						VARIABLES.userSettings.findPrehistoric = true;
					} else {
						VARIABLES.userSettings.findPrehistoric = false;
					}

					if ($('#chkDelta').prop("checked")) {
						VARIABLES.userSettings.findDelta = true;
					} else {
						VARIABLES.userSettings.findDelta = false;
					}

					if ($('#chkMega').prop("checked")) {
						VARIABLES.userSettings.findMega = true;
					} else {
						VARIABLES.userSettings.findMega = false;
					}

					if ($('#chkStarter').prop("checked")) {
						VARIABLES.userSettings.findStarter = true;
					} else {
						VARIABLES.userSettings.findStarter = false;
					}

					if ($('#chkCustomSprite').prop("checked")) {
						VARIABLES.userSettings.findCustomSprite = true;
					} else {
						VARIABLES.userSettings.findCustomSprite = false;
					}

					fn.backwork.saveSettings();
				}, */
			}, // end of API
		}; // end of fn

		fn.backwork.init();

		return fn.API;
	})(); // end of PFQoL function

	$(document).on('click', '#QoLSettings', (function() { // save userscript settings
		PFQoL.userSettingsChange ();
	}));

	//$(document).on('click', '#shelteroptionsqol', (function() { // save shelter settings
	//	PFQoL.shelterSettingsChange ();

	$(document).on('change', '.qolsetting', (function() {
		PFQoL.settingsChange(this.getAttribute('data-key'));
	}));

})(jQuery); //end of userscript