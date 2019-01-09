// ==UserScript==
// @name         Poké Farm QoL
// @namespace    https://github.com/KaizokuBento/
// @author       Bentomon
// @homepage	 https://github.com/KaizokuBento/PokeFarmShelter
// @downloadURL  https://github.com/KaizokuBento/PokeFarmShelter/raw/master/Poke-Farm-QoL.user.js
// @description  Quality of Life changes to Pokéfarm!
// @version      1.0.7
// @match        https://pokefarm.com/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://raw.githubusercontent.com/lodash/lodash/4.17.4/dist/lodash.min.js
// @resource     QoLSettingsMenuHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/qolSettingsMenuHTML.html
// @resource     shelterSettingsHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/shelterOptionsHTML.html
// @resource     QoLCSS                 https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/css/pfqol.css
// @updateURL    https://github.com/KaizokuBento/PokeFarmQoL/raw/master/Poke-Farm-QoL.user.js
// @connect      github.com
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_info
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
			releaseSelectAll: true,
			fieldSort: true,
			//shelter settings
			shelterSettings : {
				findCustom: "",
				findNewEgg: true,
				findNewPokemon: true,
				findShiny: true,
				findAlbino: true,
				findMelanistic: true,
				findPrehistoric: true,
				findDelta: true,
				findMega: true,
				findStarter: true,
				findCustomSprite: true,
				findMale: true,
				findFemale: true,
				findNoGender: true,
				customEgg: true,
				customPokemon: true,
				customPng: false,
			},
			fieldSortSettings : {
				fieldByBerry: true,
				fieldByMiddle: false,
			},
		};

		const SETTINGS_SAVE_KEY = 'QoLSettings';

		const VARIABLES = { // all the variables that are going to be used in fn
			userSettings : DEFAULT_USER_SETTINGS,

			shelterSearch : [
				"findCustom", "", "custom search key", '<img src="//pfq-static.com/img/pkmn/heart_1.png/t=1427152952">',
				"findNewEgg", "Egg", "new egg", '<img src="//pfq-static.com/img/pkmn/egg.png/t=1451852195">',
				"findNewPokemon", "Pokémon", "new Pokémon", '<img src="//pfq-static.com/img/pkmn/pkmn.png/t=1451852507">',
				"findShiny", "[SHINY]", "Shiny", '<img src="//pfq-static.com/img/pkmn/shiny.png/t=1400179603">',
				"findAlbino","[ALBINO]", "Albino", '<img src="//pfq-static.com/img/pkmn/albino.png/t=1414662094">',
				"findMelanistic", "[MELANISTIC]", "Melanistic", '<img src="//pfq-static.com/img/pkmn/melanistic.png/t=1435353274">',
				"findPrehistoric", "[PREHISTORIC]", "Prehistoric", '<img src="//pfq-static.com/img/pkmn/prehistoric.png/t=1465558964">',
				"findDelta", "[DELTA", "Delta", "Delta", '<img src="//pfq-static.com/img/pkmn/_delta/dark.png/t=1501325214">',
				"findMega", "[MEGA]", "Mega", '<img src="//pfq-static.com/img/pkmn/mega.png/t=1400179603">',
				"findStarter", "[STARTER]", "Starter", '<img src="//pfq-static.com/img/pkmn/starter.png/t=1484919510">',
				"findCustomSprite", "[CUSTOM SPRITE]", "Custom Sprite", '<img src="//pfq-static.com/img/pkmn/cs.png/t=1405806997">',
				"findMale", "[M]", "Male", '<img src="//pfq-static.com/img/pkmn/gender_m.png/t=1401213006">',
				"findFemale", "[F]", "Female", '<img src="//pfq-static.com/img/pkmn/gender_f.png/t=1401213007">',
				"findNoGender", "[N]", "No Gender", '<img src="//pfq-static.com/img/pkmn/gender_n.png/t=1401213004">',
			],
		}

		const TEMPLATES = { // all the new/changed HTML for the userscript
			qolHubLinkHTML			: `<li data-name="QoL"><a href="/farm#tab=1" title="QoL Settings"><img src="https://i.imgur.com/L6KRli5.png" alt="QoL Settings">QoL</a></li>`,
			qolHubUpdateLinkHTML	: `<li data-name="QoLupdate"><a href=\"https://github.com/KaizokuBento/PokeFarmQoL/raw/master/Poke-Farm-QoL.user.js\" target=\"_blank\"><img src="https://i.imgur.com/SJhgsU8.png" alt="QoL Update">QoL Update Available!</a></li>`,
			qolSettingsMenuHTML		: GM_getResourceText('QoLSettingsMenuHTML'),
			shelterSettingsHTML		: GM_getResourceText('shelterSettingsHTML'),
		}

		const OBSERVERS = {
			shelterObserver: new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					fn.API.shelterCustomSearch();
				});
			})
		}

		const fn = { // all the functions for the script
			helpers: {
				toggleSetting(key, set = false) {
                    if (typeof set === 'boolean') {
                        let element = document.querySelector(`.qolsetting[data-key="${key}"]`);
                        if (element && element.type === 'checkbox') {
                            element.checked = set;
                        }
                    }
					if (typeof set === 'string') {
                        let element = document.querySelector(`.qolsetting[data-key="${key}"]`);
                        if (element && element.type === 'text') {
                            element.value = set;
                        }
                    }
                },

			},
			/** background stuff */
			backwork : { // backgrounds stuff
				versionCompare(v1, v2) {
					var regex = new RegExp("(\.0+)+");
					v1 = v1.replace(regex, "").split(".");
					v2 = v2.replace(regex, "").split(".");
					var min = Math.min(v1.length, v2.length);

					var diff = 0;
					for (var i = 0; i < min; i++) {
						diff = parseInt(v1[i], 10) - parseInt(v2[i], 10);
						if (diff !== 0) {
							return diff;
						}
					}
                return v1.length - v2.length;
				},
				checkForUpdate() {
					var version ="";
					GM_xmlhttpRequest({
						method: 'GET',
						url: 'https://api.github.com/repos/KaizokuBento/PokeFarmQoL/contents/Poke-Farm-QoL.user.js',
						responseType: 'json',
						onload: function(data) {
							var match = atob(data.response.content).match(/\/\/\s+@version\s+([^\n]+)/);
							version = match[1];
							if (fn.backwork.versionCompare(GM_info.script.version, version) < 0) {
								document.querySelector("li[data-name*='QoL']").insertAdjacentHTML('afterend', TEMPLATES.qolHubUpdateLinkHTML);
							}
						}
					});
				},

				loadSettings() { // initial settings on first run and setting the variable settings key
				let countScriptSettings = Object.keys(VARIABLES.userSettings).length + Object.keys(VARIABLES.userSettings.shelterSettings).length + Object.keys(VARIABLES.userSettings.fieldSortSettings).length;
				let localStorageString = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));

					if (localStorage.getItem(SETTINGS_SAVE_KEY) === null) {
						fn.backwork.saveSettings();
					} else { 
						try {
							let countLocalStorageSettings = Object.keys(localStorageString).length + Object.keys(localStorageString.shelterSettings).length + Object.keys(localStorageString.fieldSortSettings).length;
							if (countLocalStorageSettings != countScriptSettings) {
								fn.backwork.saveSettings();
							}
						}
						catch(err) {
							fn.backwork.saveSettings();
						}
						if (localStorage.getItem(SETTINGS_SAVE_KEY) != VARIABLES.userSettings) {
						VARIABLES.userSettings = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));
						}
					}
				},
				saveSettings() { // Save changed settings
					localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(VARIABLES.userSettings));
				},
				populateSettingsPage() { // checks all settings checkboxes that are true in the settings
                    for (let key in VARIABLES.userSettings) {
                        if (!VARIABLES.userSettings.hasOwnProperty(key)) {
                            continue;
                        }
                        let value = VARIABLES.userSettings[key];
                        if (typeof value === 'boolean') {
                            fn.helpers.toggleSetting(key, value, false);
                            continue;
                        }

                       if (typeof value === 'string') {
                            fn.helpers.toggleSetting(key, value, false);
                            continue;
					   }
                    }
					for (let key in VARIABLES.userSettings.shelterSettings) {
                        if (!VARIABLES.userSettings.shelterSettings.hasOwnProperty(key)) {
                            continue;
                        }
                        let value = VARIABLES.userSettings.shelterSettings[key];
                        if (typeof value === 'boolean') {
                            fn.helpers.toggleSetting(key, value, false);
                            continue;
                        }

                       if (typeof value === 'string') {
                            fn.helpers.toggleSetting(key, value, false);
                            continue;
					   }
                    }
                },

				setupHTML() { // injects the HTML changes from TEMPLATES into the site

					// Header link to Userscript settings
					document.querySelector("li[data-name*='Lucky Egg']").insertAdjacentHTML('afterend', TEMPLATES.qolHubLinkHTML);

					// QoL userscript Settings Menu in farmnews
					if(window.location.href.indexOf("farm#tab=1") != -1){ // Creating the QoL Settings Menu in farmnews
						document.querySelector('#farmnews').insertAdjacentHTML("afterbegin", TEMPLATES.qolSettingsMenuHTML);
						fn.backwork.populateSettingsPage();
					}

					// shelter Settings Menu
					if (VARIABLES.userSettings.shelterEnable === true && window.location.href.indexOf("shelter") != -1) {
						document.querySelector("#shelterupgrades").insertAdjacentHTML("afterend", TEMPLATES.shelterSettingsHTML);
						document.querySelector("#shelteroptionsqol").insertAdjacentHTML("beforebegin", "<h3>QoL Settings</h3>");
						document.querySelector('#sheltercommands').insertAdjacentHTML('beforebegin', "<div id='sheltersuccess'></div>");
						fn.backwork.populateSettingsPage();
					}
					
					// fishing select all button on caught fishing
					if (VARIABLES.userSettings.releaseSelectAll === true && window.location.href.indexOf("fishing") != -1 && $('#caughtfishcontainer').length > 0) {
						document.querySelector('#caughtfishcontainer label').insertAdjacentHTML('beforeend', '<label id="selectallfish"><input id="selectallfishcheckbox" type="checkbox">Select all</label>');
					}
				},
				setupCSS() { // All the CSS changes are added here
					GM_addStyle(GM_getResourceText('QoLCSS'));
				},

				setupObservers() { // all the Observers that needs to run
					if (window.location.href.indexOf("shelter") != -1) {
						OBSERVERS.shelterObserver.observe(document.querySelector('#shelterarea'), {
							childList: true,
						});
					}
				},

				startup() { // All the functions that are run to start the script on Pokéfarm
					return {
						'loading Settings'		: fn.backwork.loadSettings,
						'checking for update'	: fn.backwork.checkForUpdate,
						'setting up CSS'		: fn.backwork.setupCSS,
						'setting up HTML' 		: fn.backwork.setupHTML,
						'setting up Observers'	: fn.backwork.setupObservers,
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
				settingsChange(element, textElement) {
					if (JSON.stringify(VARIABLES.userSettings).indexOf(element) >= 0) { // userscript settings
						if (VARIABLES.userSettings[element] === false ) {
							VARIABLES.userSettings[element] = true;
						} else if (VARIABLES.userSettings[element] === true ) {
							VARIABLES.userSettings[element] = false;
						} else if (typeof VARIABLES.userSettings[element] === 'string') {
							VARIABLES.userSettings[element] = textElement;
						}
					}
					if (JSON.stringify(VARIABLES.userSettings.shelterSettings).indexOf(element) >= 0) { // shelter settings
						if (VARIABLES.userSettings.shelterSettings[element] === false ) {
							VARIABLES.userSettings.shelterSettings[element] = true;
						} else if (VARIABLES.userSettings.shelterSettings[element] === true ) {
							VARIABLES.userSettings.shelterSettings[element] = false;
						} else if (typeof VARIABLES.userSettings.shelterSettings[element] === 'string') {
							VARIABLES.userSettings.shelterSettings[element] = textElement;
						}
					}
					if (VARIABLES.userSettings.shelterSettings.customPng === true) {
						if (VARIABLES.userSettings.shelterSettings.customEgg === true || VARIABLES.userSettings.shelterSettings.customPokemon === true) {
							alert("If you select 'By img code' then you have to de-select 'Custom Egg' & 'Custom Pokémon'. Can't find both at the same time.");
						}
					}

					if (VARIABLES.userSettings.shelterSettings.findMale === false && VARIABLES.userSettings.shelterSettings.findFemale === false && VARIABLES.userSettings.shelterSettings.findNoGender === false) {
						alert("You need to select at least 1 of the 3 genders to custom find a Pokémon!");
					}
					fn.backwork.saveSettings();
				},

				shelterCustomSearch() { // search whatever you want to find in the shelter
					const shelterValueArray = [];
					VARIABLES.shelterSearch[1] = VARIABLES.userSettings.shelterSettings.findCustom; //change customsearch in array to find what you need
					document.querySelector('#sheltersuccess').innerHTML="";

					for (let key in VARIABLES.userSettings.shelterSettings) { //loop to find all the shelter Settings
						let value = VARIABLES.userSettings.shelterSettings[key];
						if (value === true || value != "") { //creates an array of items that should be found
							if (VARIABLES.shelterSearch.indexOf(key) >=0) {
								let searchKey = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(key) + 1];
								shelterValueArray.push(searchKey);
							}
						}
					}

					for (let key in shelterValueArray) { // all the search stuff that's being done
						let value = shelterValueArray[key];

						if (value.startsWith("[") && value != "[M]" && value != "[F]" && value != "[N]") { //img[TITLE] search. Shiny, Albino, Melanistic, Prehistoric, Mega, Starter & Custom Sprite
							if ($("img[title*='"+value+"']").length) {
								let searchResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 1];
								let imgResult = $("img[title*='"+value+"']").length+" - "+searchResult;
								let imgFitResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 2];

								if ($("img[title*='"+value+"']").length > 1) {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+imgResult+'s found '+imgFitResult+'</div>');
								} else {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+imgResult+' found '+imgFitResult+'</div>');
								}
							}
						}

						if (value === "Pokémon") { //tooltip_content search. new pokémon
							if ($("#shelterarea .tooltip_content:contains("+value+")").length) {
								let searchResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 1];
								let tooltipResult = $("#shelterarea .tooltip_content:contains("+value+")").length+" "+searchResult;
								let imgFitResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 2];

								if ($("#shelterarea .tooltip_content:contains("+value+")").length > 1) {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+'s found '+imgFitResult+'</div>');
								} else {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+' found '+imgFitResult+'</div>');
								}
							}
						}

						if (value === "Egg") { //tooltip_content search. new egg.
							if ($("#shelterarea .tooltip_content:contains("+value+")").length) {
								let allEggFinds = $("#shelterarea .tooltip_content:contains("+value+")").length;
								let allKnownEggFinds = $("#shelterarea .tooltip_content:contains( "+value+")").length;
								let newEggFinds = allEggFinds - allKnownEggFinds;

								let searchResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 1];
								let newEggResult = newEggFinds+" "+searchResult;
								let imgFitResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 2];

								if (newEggFinds > 1) {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+newEggResult+'s found '+imgFitResult+'</div>');
								} else if (newEggFinds === 1) {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+newEggResult+' found '+imgFitResult+'</div>');
								}
							}
						}


						if (value != "Egg" && value != "Pokémon" && value.startsWith("[") === false && VARIABLES.userSettings.shelterSettings.customPokemon === true) { //custom search with pokemon & genders
							VARIABLES.shelterSearch[2] = VARIABLES.userSettings.shelterSettings.findCustom; // this is the custom search from the textbox

							if (shelterValueArray.indexOf("[M]") >0) {
								if ($("#shelterarea .tooltip_content:contains("+value+") img[title*='[M]']").length) {
									let searchResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 1];
									let imgGender = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf("[M]") +2];
									let tooltipResult = $("#shelterarea .tooltip_content:contains("+value+") img[title*='[M]']").length+" Male "+imgGender+" "+searchResult;
									let imgFitResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 2];

									if ($("#shelterarea .tooltip_content:contains("+value+") img[title*='[M]']").length > 1) {
										document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+'s found '+imgFitResult+'</div>');
									} else {
										document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+' found '+imgFitResult+'</div>');
									}
								}
							}

							if (shelterValueArray.indexOf("[F]") >0) {
								if ($("#shelterarea .tooltip_content:contains("+value+") img[title*='[F]']").length) {
									let searchResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 1];
									let imgGender = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf("[F]") +2];
									let tooltipResult = $("#shelterarea .tooltip_content:contains("+value+") img[title*='[F]']").length+" Female "+imgGender+" "+searchResult;
									let imgFitResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 2];

									if ($("#shelterarea .tooltip_content:contains("+value+") img[title*='[F]']").length > 1) {
										document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+'s found '+imgFitResult+'</div>');
									} else {
										document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+' found '+imgFitResult+'</div>');
									}
								}
							}

							if (shelterValueArray.indexOf("[N]") >0) {
								if ($("#shelterarea .tooltip_content:contains("+value+") img[title*='[N]']").length) {
									let searchResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 1];
									let imgGender = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf("[N]") +2];
									let tooltipResult = $("#shelterarea .tooltip_content:contains("+value+") img[title*='[N]']").length+" Genderless "+imgGender+" "+searchResult;
									let imgFitResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 2];

									if ($("#shelterarea .tooltip_content:contains("+value+") img[title*='[N]']").length > 1) {
										document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+'s found '+imgFitResult+'</div>');
									} else {
										document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+' found '+imgFitResult+'</div>');
									}
								}
							}
						}

						if (value != "Egg" && value != "Pokémon" && value.startsWith("[") === false && VARIABLES.userSettings.shelterSettings.customEgg === true) { //custom search with eggs
							if ($('#shelterarea .tooltip_content:contains('+value+'):contains("Egg")').length) {
								let searchResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 1];
								let tooltipResult = $('#shelterarea .tooltip_content:contains('+value+'):contains("Egg")').length+" "+searchResult;
								let imgFitResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 2];

								if ($('#shelterarea .tooltip_content:contains('+value+'):contains("Egg")').length > 1) {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+' Eggs found '+imgFitResult+'</div>');
								} else {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+' egg found '+imgFitResult+'</div>');
								}
							}
						}

						if (value != "Egg" && value != "Pokémon" && value.startsWith("[") === false && VARIABLES.userSettings.shelterSettings.customPng === true) { //custom search with img code
							if ($('#shelterarea img[src*="'+value+'"]').length) {
								let searchResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 1];
								let amountOfEggs = $('#shelterarea img[src*="'+value+'"]').length / 2
								let tooltipResult = amountOfEggs+"   <img src="+value+">";
								let imgFitResult = VARIABLES.shelterSearch[VARIABLES.shelterSearch.indexOf(value) + 2];

								if (amountOfEggs > 1) {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+'s found '+imgFitResult+'</div>');
								} else {
									document.querySelector('#sheltersuccess').insertAdjacentHTML('beforeend','<div id="shelterfound">'+tooltipResult+' found '+imgFitResult+'</div>');
								}
							}
						}
					}
				}, // end of shelterCustomSearch

				releaseFieldSelectAll() {
					if (VARIABLES.userSettings.releaseSelectAll === true) {
						document.querySelector('#massreleaselist label').insertAdjacentHTML('beforeend', '<label id="selectallfield"><input id="selectallfieldcheckbox" type="checkbox">Select all</label>');
						$("#selectallfieldcheckbox").click(function(){
							$('input:checkbox').not(this).prop('checked', this.checked);
						});
					}
				},
				releaseFishSelectAll() {
					if (VARIABLES.userSettings.releaseSelectAll === true) {
						$("#selectallfishcheckbox").click(function(){
							$('input:checkbox').not(this).prop('checked', this.checked);
						});
					}
				},
				
				fieldSorter() {
					if (VARIABLES.userSettings.fieldSortSettings.fieldByBerry = true) {
						console.log("fieldByBerry");
					} else if (VARIABLES.userSettings.fieldSortSettings.fieldByMiddle = true) {
						console.log("fieldByMiddle");
					}
				},
			}, // end of API
		}; // end of fn

		fn.backwork.init();

		return fn.API;
	})(); // end of PFQoL function

	$(document).on('input', '.qolsetting', (function() {
		PFQoL.settingsChange(this.getAttribute('data-key'), $(this).val());
	}));

	$(document).on('change', '#shelteroptionsqol input', (function() {
		PFQoL.shelterCustomSearch();
	}));

	$(document).on('click', '#sheltercommands ,#shelterarea', (function() {
		PFQoL.shelterCustomSearch();
	}));

	$(document).on('click', '*[data-menu="release"]', (function() {
		PFQoL.releaseFieldSelectAll();
    }));
	
	$(document).on('mouseover', '#caughtfishcontainer', (function() {
		PFQoL.releaseFishSelectAll();
	}));	
})(jQuery); //end of userscript
