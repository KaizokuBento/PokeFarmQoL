// ==UserScript==
// @name         Poké Farm QoL
// @namespace    https://github.com/KaizokuBento/
// @author       Bentomon
// @homepage	 https://github.com/KaizokuBento/PokeFarmShelter
// @downloadURL  https://github.com/KaizokuBento/PokeFarmShelter/raw/master/Poke-Farm-QoL.user.js
// @description  Quality of Life changes to Pokéfarm!
// @version      1.1.0
// @match        https://pokefarm.com/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require      https://raw.githubusercontent.com/lodash/lodash/4.17.4/dist/lodash.min.js
// @require https://cdn.rawgit.com/omichelsen/compare-versions/v3.1.0/index.js
// @resource     QolHubHTML	            https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/qolHubHTML.html
// @resource     shelterSettingsHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/dev/resources/templates/shelterOptionsHTML.html
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
				fieldByBerry: false,
				fieldByMiddle: false,
				fieldByGrid: false,
				fieldClickCount: true,
			},
		};

		const SETTINGS_SAVE_KEY = 'QoLSettings';

		const VARIABLES = { // all the variables that are going to be used in fn
			userSettings : DEFAULT_USER_SETTINGS,

			shelterCustomArray : [],

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
			qolHubLinkHTML			: `<li data-name="QoL"><a title="QoL Settings"><img src="https://i.imgur.com/L6KRli5.png" alt="QoL Settings">QoL</a></li>`,
			qolHubUpdateLinkHTML	: `<li data-name="QoLupdate"><a href=\"https://github.com/KaizokuBento/PokeFarmQoL/raw/master/Poke-Farm-QoL.user.js\" target=\"_blank\"><img src="https://i.imgur.com/SJhgsU8.png" alt="QoL Update">QoL Update Available!</a></li>`,
			qolSettingsMenuHTML		: GM_getResourceText('QoLSettingsMenuHTML'),
			shelterSettingsHTML		: GM_getResourceText('shelterSettingsHTML'),
			massReleaseSelectHTML	: `<label id="selectallfish"><input id="selectallfishcheckbox" type="checkbox">Select all</label>`,
			fieldSortHTML			: `<div id="fieldorder"><label><input type="checkbox" class="qolsetting qolalone" data-key="fieldByBerry"/>Sort by berries</label><label><input type="checkbox" class="qolsetting qolalone" data-key="fieldByMiddle"/>Sort in the middle</label><label><input type="checkbox" class="qolsetting qolalone" data-key="fieldByGrid"/>Align to grid</label><label><input type="checkbox" class="qolsetting" data-key="fieldClickCount"/>Click counter</label></div>`,
			qolHubHTML				: GM_getResourceText('QolHubHTML'),
		}

		const OBSERVERS = {
			shelterObserver: new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					fn.API.shelterCustomSearch();
				});
			}),

			fieldsObserver: new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					fn.API.fieldSorter();
				});
			}),
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
				checkForUpdate() {
					let version ="";
					GM_xmlhttpRequest({
						method: 'GET',
						url: 'https://api.github.com/repos/KaizokuBento/PokeFarmQoL/contents/Poke-Farm-QoL.user.js',
						responseType: 'json',
						onload: function(data) {
							let match = atob(data.response.content).match(/\/\/\s+@version\s+([^\n]+)/);
							version = match[1];
							if (compareVersions(GM_info.script.version, version) < 0) {
								document.querySelector("li[data-name*='QoL']").insertAdjacentHTML('afterend', TEMPLATES.qolHubUpdateLinkHTML);
							}
						}
					});
				},

				loadSettings() { // initial settings on first run and setting the variable settings key


					if (localStorage.getItem(SETTINGS_SAVE_KEY) === null) {
						fn.backwork.saveSettings();
					} else {
						try {
							let countScriptSettings = Object.keys(VARIABLES.userSettings).length + Object.keys(VARIABLES.userSettings.shelterSettings).length + Object.keys(VARIABLES.userSettings.fieldSortSettings).length;
							let localStorageString = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));
							let countLocalStorageSettings = Object.keys(localStorageString).length + Object.keys(localStorageString.shelterSettings).length + Object.keys(localStorageString.fieldSortSettings).length;
							if (countLocalStorageSettings < countScriptSettings) { // adds new objects (settings) to the local storage
								let defaultsSetting = VARIABLES.userSettings;
								let userSetting = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));
								let newSetting = $.extend(true,{}, defaultsSetting, userSetting);

								VARIABLES.userSettings = newSetting;
								fn.backwork.saveSettings();
							}
							if (countLocalStorageSettings > countScriptSettings) { // removes objects from the local storage if they don't exist anymore. Not yet possible..
								//let defaultsSetting = VARIABLES.userSettings;
								//let userSetting = JSON.parse(localStorage.getItem(SETTINGS_SAVE_KEY));

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
					for (let key in VARIABLES.userSettings.fieldSortSettings) {
                        if (!VARIABLES.userSettings.fieldSortSettings.hasOwnProperty(key)) {
                            continue;
                        }
                        let value = VARIABLES.userSettings.fieldSortSettings[key];
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

					// shelter Settings Menu
					if (VARIABLES.userSettings.shelterEnable === true && window.location.href.indexOf("shelter") != -1) {
						$('.tabbed_interface.horizontal>div').removeClass('tab-active');
						$('.tabbed_interface.horizontal>ul>li').removeClass('tab-active');
						document.querySelector('.tabbed_interface.horizontal>ul').insertAdjacentHTML('afterbegin', '<li class="tab-active"><label>QoL</label></li>');
						document.querySelector('.tabbed_interface.horizontal>ul').insertAdjacentHTML('afterend', TEMPLATES.shelterSettingsHTML);
						$('#shelteroptionsqol').addClass('tab-active');

						let shelterSuccessCss = $('#sheltercommands').css('background-color');
						document.querySelector('#sheltercommands').insertAdjacentHTML('beforebegin', '<div id="sheltersuccess" style="background-color:'+shelterSuccessCss+';"></div>');
						fn.backwork.populateSettingsPage();
					}

					// fishing select all button on caught fishing
					if (VARIABLES.userSettings.releaseSelectAll === true && window.location.href.indexOf("fishing") != -1 && $('#caughtfishcontainer').length > 0) {
						document.querySelector('#caughtfishcontainer label').insertAdjacentHTML('beforeend', TEMPLATES.massReleaseSelectHTML);
					}

					// fields sorter
					if (VARIABLES.userSettings.fieldSort === true && window.location.href.indexOf("fields/") != -1) {
						document.querySelector('#field_field').insertAdjacentHTML('afterend', TEMPLATES.fieldSortHTML);


						fn.backwork.populateSettingsPage();
					}
				},
				setupCSS() { // All the CSS changes are added here
					GM_addStyle(GM_getResourceText('QoLCSS'));
				},

				setupObservers() { // all the Observers that needs to run
					if (VARIABLES.userSettings.shelterEnable === true && window.location.href.indexOf("shelter") != -1) { //observe changes on the shelter page
						OBSERVERS.shelterObserver.observe(document.querySelector('#shelterarea'), {
							childList: true,
						});
					}

					if (VARIABLES.userSettings.fieldSort === true && window.location.href.indexOf("fields/") != -1) { //observe pokemon changes on the fields page
						OBSERVERS.fieldsObserver.observe(document.querySelector('#field_field'), {
							childList: true,
						});
					}

					if (VARIABLES.userSettings.fieldSort === true && window.location.href.indexOf("fields/") != -1) { //observe settings changes on the fields page
						OBSERVERS.fieldsObserver.observe(document.querySelector('#fieldorder'), {
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
				qolHubBuild() {
					document.querySelector('body').insertAdjacentHTML('beforeend', TEMPLATES.qolHubHTML);
					$('#core').addClass('scrolllock');
					let qolHubCssBackgroundHead = $('.qolHubHead.qolHubSuperHead').css('background-color');
					let qolHubCssTextColorHead = $('.qolHubHead.qolHubSuperHead').css('color');
					let qolHubCssBackground = $('.qolHubTable').css('background-color');
					let qolHubCssTextColor = $('.qolHubTable').css('color');
					$('.qolHubHead').css({"backgroundColor":""+qolHubCssBackgroundHead+"","color":""+qolHubCssTextColorHead+""});
					$('.qolChangeLogHead').css({"backgroundColor":""+qolHubCssBackgroundHead+"","color":""+qolHubCssTextColorHead+""});
					$('.qolopencloselist.qolChangeLogContent').css({"backgroundColor":""+qolHubCssBackground+"","color":""+qolHubCssTextColor+""});

					fn.backwork.populateSettingsPage();
				},
				qolHubClose() {
					$('.dialog').remove();
					$('#core').removeClass('scrolllock');
				},

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
							VARIABLES.shelterCustomArray.push(textElement);
							VARIABLES.userSettings.shelterSettings.findCustom = VARIABLES.shelterCustomArray.toString()
							console.log(VARIABLES.shelterCustomArray.toString());
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

					if (JSON.stringify(VARIABLES.userSettings.fieldSortSettings).indexOf(element) >= 0) { // field sort settings
						if (VARIABLES.userSettings.fieldSortSettings[element] === false ) {
							VARIABLES.userSettings.fieldSortSettings[element] = true;
							if (element === "fieldByBerry") {
								VARIABLES.userSettings.fieldSortSettings.fieldByMiddle = false;
								VARIABLES.userSettings.fieldSortSettings.fieldByGrid = false;
							} else if (element === "fieldByMiddle") {
								VARIABLES.userSettings.fieldSortSettings.fieldByBerry = false;
								VARIABLES.userSettings.fieldSortSettings.fieldByGrid = false;
							} else if (element === "fieldByGrid") {
								VARIABLES.userSettings.fieldSortSettings.fieldByBerry = false;
								VARIABLES.userSettings.fieldSortSettings.fieldByMiddle = false;
							}
						} else if (VARIABLES.userSettings.fieldSortSettings[element] === true ) {
							VARIABLES.userSettings.fieldSortSettings[element] = false;
						} else if (typeof VARIABLES.userSettings.fieldSortSettings[element] === 'string') {
							VARIABLES.userSettings.fieldSortSettings[element] = textElement;
						}
					}
					fn.backwork.saveSettings();
				},

				shelterAddTextField() {
					let theField = `<div class='numberDiv'><label><input type="text" class="qolsetting" data-key="findCustom"/></label><input type='button' value='Remove' id='removeShelterTextfield'></div>`;
					let numberDiv = $('#searchkeys>div').length + 1
					$('#searchkeys').append(theField);
					$('.numberDiv').removeClass('numberDiv').addClass(""+numberDiv+"");
					//VARIABLES.userSettings.findCustom();
				},
				shelterRemoveTextfield(byebye, key) { //add a loop to change all the classes of divs (amount of divs) so it fits with the save keys
					console.log(key);
					VARIABLES.shelterCustomArray = $.grep(VARIABLES.shelterCustomArray, function(value) {
						return value != key;
					});
					VARIABLES.userSettings.shelterSettings.findCustom = VARIABLES.shelterCustomArray.toString()

					fn.backwork.saveSettings();
					$(byebye).parent().remove();
					
					let i;
					for(i = 0; i < $('#searchkeys>div').length + 1; i++) {
						let rightDiv = i + 1;
						let divOne = i - 1;
						if ($('.0').children().attr('class') === JSON.stringify(1)) {
							$('.0').children().removeClass().addClass(''+i+'');
						} else {
							$('.'+i+'').next().removeClass().addClass(''+rightDiv+'');
						}
					}

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
					if (VARIABLES.userSettings.fieldSort === true) {
						$('input.qolalone').on('change', function() {
							$('input.qolalone').not(this).prop('checked', false);
						});
						let fieldOrderCssColor = $('#field_field').css('background-color');
						let fieldOrderCssBorder = $('#field_field').css('border');
						$("#fieldorder").css("background-color", ""+fieldOrderCssColor+"");
						$("#fieldorder").css("border", ""+fieldOrderCssBorder+"");

						if (VARIABLES.userSettings.fieldSortSettings.fieldByBerry === true) { //sort field by berries
							$('.fieldmon').removeClass("qolSortMiddle");
							$('.field').removeClass("qolGridField");
							$('.fieldmon').removeClass("qolGridPokeSize");
							$('.fieldmon>img').removeClass("qolGridPokeImg");

							if($('#field_field [data-flavour*="any-"]').length) {
								$('#field_field [data-flavour*="any-"]').addClass("qolAnyBerry");
							}
							if($('#field_field [data-flavour*="sour-"]').length) {
								$('#field_field [data-flavour*="sour-"]').addClass("qolSourBerry");
							}
							if($('#field_field [data-flavour*="spicy-"]').length) {
								$('#field_field [data-flavour*="spicy-"]').addClass("qolSpicyBerry");
							}
							if($('#field_field [data-flavour*="dry-"]').length) {
								$('#field_field [data-flavour*="dry-"]').addClass("qolDryBerry");
							}
							if($('#field_field [data-flavour*="sweet-"]').length) {
								$('#field_field [data-flavour*="sweet-"]').addClass("qolSweetBerry");
							}
							if($('#field_field [data-flavour*="bitter-"]').length) {
								$('#field_field [data-flavour*="bitter-"]').addClass("qolBitterBerry");
							}
						}
						if (VARIABLES.userSettings.fieldSortSettings.fieldByMiddle === true) { //sort field in the middle
							$('#field_field [data-flavour*="any-"]').removeClass("qolAnyBerry");
							$('#field_field [data-flavour*="sour-"]').removeClass("qolSourBerry");
							$('#field_field [data-flavour*="spicy-"]').removeClass("qolSpicyBerry");
							$('#field_field [data-flavour*="dry-"]').removeClass("qolDryBerry");
							$('#field_field [data-flavour*="sweet-"]').removeClass("qolSweetBerry");
							$('#field_field [data-flavour*="bitter-"]').removeClass("qolBitterBerry");
							$('.field').removeClass("qolGridField");
							$('.fieldmon').removeClass("qolGridPokeSize");
							$('.fieldmon>img').removeClass("qolGridPokeImg");

							$('.fieldmon').addClass("qolSortMiddle");
						}

						if (VARIABLES.userSettings.fieldSortSettings.fieldByGrid === true) { //sort field in a grid
							$('#field_field [data-flavour*="any-"]').removeClass("qolAnyBerry");
							$('#field_field [data-flavour*="sour-"]').removeClass("qolSourBerry");
							$('#field_field [data-flavour*="spicy-"]').removeClass("qolSpicyBerry");
							$('#field_field [data-flavour*="dry-"]').removeClass("qolDryBerry");
							$('#field_field [data-flavour*="sweet-"]').removeClass("qolSweetBerry");
							$('#field_field [data-flavour*="bitter-"]').removeClass("qolBitterBerry");
							$('.fieldmon').removeClass("qolSortMiddle");

							$('.field').addClass("qolGridField");
							$('.fieldmon').addClass("qolGridPokeSize");
							$('.fieldmon>img').addClass("qolGridPokeImg");
						}

						if (VARIABLES.userSettings.fieldSortSettings.fieldByBerry === false && VARIABLES.userSettings.fieldSortSettings.fieldByMiddle === false && VARIABLES.userSettings.fieldSortSettings.fieldByGrid === false) {
							$('#field_field [data-flavour*="any-"]').removeClass("qolAnyBerry");
							$('#field_field [data-flavour*="sour-"]').removeClass("qolSourBerry");
							$('#field_field [data-flavour*="spicy-"]').removeClass("qolSpicyBerry");
							$('#field_field [data-flavour*="dry-"]').removeClass("qolDryBerry");
							$('#field_field [data-flavour*="sweet-"]').removeClass("qolSweetBerry");
							$('#field_field [data-flavour*="bitter-"]').removeClass("qolBitterBerry");
							$('.fieldmon').removeClass("qolSortMiddle");
							$('.field').removeClass("qolGridField");
							$('.fieldmon').removeClass("qolGridPokeSize");
							$('.fieldmon>img').removeClass("qolGridPokeImg");
						}

						//Pokémon click counter
						if (VARIABLES.userSettings.fieldSortSettings.fieldClickCount === false) {
							$('#pokemonclickcount').remove();
						} else if (VARIABLES.userSettings.fieldSortSettings.fieldClickCount === true) {
							let pokemonFed = $(".fieldmon").map(function(){return $(this).attr("data-fed");}).get();

							let pokemonClicked = 0;
							for (var i = 0; i < pokemonFed.length; i++) {
								pokemonClicked += pokemonFed[i] << 0;
							}

							let pokemonInField = $('.fieldpkmncount').text();

							$('#pokemonclickcount').remove(); //make sure no duplicates are being produced
							document.querySelector('.fielddata').insertAdjacentHTML('beforeend','<div id="pokemonclickcount">'+pokemonClicked+' / '+pokemonInField+' Clicked</div>');
							if (JSON.stringify(pokemonClicked) === pokemonInField) {
								$('#pokemonclickcount').css({"color" : "#059121"});
							}
							if (pokemonClicked !== JSON.parse(pokemonInField)) {
								$('#pokemonclickcount').css({"color" : "#a30323"});
							}
						}
					}
				},
			}, // end of API
		}; // end of fn

		fn.backwork.init();

		return fn.API;
	})(); // end of PFQoL function

	$(document).on('click', 'li[data-name*="QoL"]', (function() { //open QoL hub
		PFQoL.qolHubBuild();
	}));

	$(document).on('click', '.closeHub', (function() { //close QoL hub
		PFQoL.qolHubClose();
	}));

	$(document).on('click', '.expandlist', (function() { //show hidden li in change log
		$(this).children('ul').slideToggle();
	}));

	$(document).on('change', '.qolsetting', (function() { //Changes QoL settings
		PFQoL.settingsChange(this.getAttribute('data-key'), $(this).val());
	}));

	$(document).on('change', '#shelteroptionsqol input', (function() { //shelter search
		PFQoL.shelterCustomSearch();
	}));

	$(document).on('click', '#sheltercommands ,#shelterarea', (function() { //shelter search
		PFQoL.shelterCustomSearch();
	}));

	$(document).on('click', '#addShelterTextfield', (function() { //add shelter text field
		PFQoL.shelterAddTextField();
	}));

	$(document).on('click', '#removeShelterTextfield', (function() { //remove shelter text field
		PFQoL.shelterRemoveTextfield(this, $(this).parent().find('input').val());
	}));

	$(document).on('click', '*[data-menu="release"]', (function() { //select all feature
		PFQoL.releaseFieldSelectAll();
    }));

	$(document).on('mouseover', '#caughtfishcontainer', (function() { //select all feature
		PFQoL.releaseFishSelectAll();
	}));

	$(document).on('click input', '#fieldorder, #field_field, #field_berries, #field_nav', (function() { //field sort
		PFQoL.fieldSorter();
	}));

	if(window.location.href.indexOf("fields/") != -1) { //field sort
		$(window).on('load', (function() {
			PFQoL.fieldSorter();
		}));
	}
})(jQuery); //end of userscript
