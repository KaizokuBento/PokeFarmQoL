// ==UserScript==
// @name         Poké Farm QoL NEW
// @namespace    https://github.com/KaizokuBento/
// @author       Bentomon
// @homepage	 https://github.com/KaizokuBento/PokeFarmShelter
// @downloadURL  https://github.com/KaizokuBento/PokeFarmShelter/raw/master/Poke-Farm-QoL.user.js
// @description  Quality of Life changes to Pokéfarm!
// @match        https://pokefarm.com/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @resource     QoLSettingsMenuHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/qolSettingsMenuHTML.html
// @resource     shelterSettingsHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/shelterOptionsHTML.html
// @version      0.0.1
// @grant        GM_getResourceText
// ==/UserScript==


(function($) {
    'use strict';
    /////////////////////////////////////
    // Welcome to my first ever script!//
    // Let's setup the Settings first. //
    /////////////////////////////////////

	let PFQoL = (function PFQoL() {

		const DEFAULT_USER_SETTINGS = {
		shelterEnable: true,
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

		const SETTINGS_SAVE_KEY = 'QoLSettings';
		
		const VARIABLES = {
			settings: DEFAULT_USER_SETTINGS,
		};

		const TEMPLATES = {
			headerSettingsLinkHTML	: `<a href=https://pokefarm.com/farm#tab=1>QoL Userscript Settings</a href>`,
			qolSettingsMenuHTML		: GM_getResourceText('QoLSettingsMenuHTML'),
			shelterSettingsHTML		: GM_getResourceText('shelterOptionsHTML'),
		};

		const fn = {
			/** background stuff */
			backwork : {
				setupHTML(){
					// Header link to Userscript settings
					let headerHTML = document.getElementById("head-right");
					headerHTML.insertAdjacentHTML('beforebegin', TEMPLATES.headerSettingsLinkHTML);

					// QoL userscript Settings Menu in farmnews
					if(window.location.href.indexOf("farm#tab=1") != -1){ // Creating the QoL Settings Menu in farmnews
						let qolSettingsHTML = document.getElementById("farmnews");
						qolSettingsHTML.insertAdjacentHTML("afterbegin", TEMPLATES.qolSettingsMenuHTML);
					}
				},
				
				saveSettings() {
                    localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(VARIABLES.settings));
                },
                loadSettings() {
                    let settings = localStorage.getItem(SETTINGS_SAVE_KEY);

                    try {
                        settings = JSON.parse(settings);

                        VARIABLES.settings = _.defaultsDeep(settings, DEFAULT_USER_SETTINGS);
                    } catch (e) {
                        log('Failed to parse settings ..');
                    }
                    fn.backwork.saveSettings();
                },
				
				startup() {
					return {
						'setting up HTML' 	: fn.backwork.setupHTML,
						'Loading settings'	: fn.backwork.loadSettings,
					}
				},
				init() {
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
			},

			/** public stuff */
			API : {
			},
		};

		fn.backwork.init();

		return fn.API;
	})(); // end of PFQoL function
})(jQuery); //end of userscript