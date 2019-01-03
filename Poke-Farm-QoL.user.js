// ==UserScript==
// @name         Poké Farm QoL NEW
// @namespace    https://github.com/KaizokuBento/
// @author       Bentomon
// @homepage	 https://github.com/KaizokuBento/PokeFarmShelter
// @downloadURL  https://github.com/KaizokuBento/PokeFarmShelter/raw/master/Poke-Farm-QoL.user.js
// @description  Quality of Life changes to Pokéfarm!
// @match        https://pokefarm.com/*
// @require      http://code.jquery.com/jquery-3.3.1.min.js
// @require        https://cdn.jsdelivr.net/npm/vue
// @resource     QoLSettingsMenuHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/qolSettingsMenuHTML.html
// @resource     shelterSettingsHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/shelterOptionsHTML.html
// @resource     QoLCSS                 https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/css/pfqol.css
// @updateURL    https://github.com/KaizokuBento/PokeFarmQoL/raw/master/Poke-Farm-QoL.user.js
// @version      0.0.1
// @grant        GM_getResourceText
// @grant        GM_addStyle
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
	
		var userSettings = null;

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
					document.querySelector('#head-right').insertAdjacentHTML('beforebegin', TEMPLATES.headerSettingsLinkHTML);

					// QoL userscript Settings Menu in farmnews
					if(window.location.href.indexOf("farm#tab=1") != -1){ // Creating the QoL Settings Menu in farmnews
						document.querySelector('#farmnews').insertAdjacentHTML("afterbegin", TEMPLATES.qolSettingsMenuHTML);
					}
				},
				setupCSS() {
					GM_addStyle(GM_getResourceText('QoLCSS'));
				},
				setupVue() {
                    new Vue({
                        debug  : true,
                        el     : '#rq-dt-table',
                        data   : VARIABLES,
                        methods: {
                            getTotal(section, item) {
                                if (!this.drop_tracker.hasOwnProperty(section)) {
                                    return 0;
                                }
                                if (!this.drop_tracker[section].hasOwnProperty(item)) {
                                    return 0;
                                }
                                let values = Object.values(this.drop_tracker[section][item]);

                                return values.reduce((carry, value) => carry + value.t, 0);
                            },
                            // getPerHour(section, item) {
                            //     let total = this.getTotal(section, item);
                            //     let diff = moment.tz(GAME_TIME_ZONE) - this.drop_tracker.trackerStart;
                            //     return values.reduce((carry, value) => carry + value.t, 0);
                            // },
                            colorClassFor(item) {
                                return {
                                    'crystals'          : item === 'crystals',
                                    'platinum'          : item === 'platinum coins',
                                    'gold'              : item === 'gold coins',
                                    'crafting_materials': item === 'crafting materials',
                                    'gem_fragments'     : item === 'gem fragments',
                                    'ruby'              : item === 'strength',
                                    'opal'              : item === 'health',
                                    'sapphire'          : item === 'coordination',
                                    'emerald'           : item === 'agility',
                                };
                            },
                            resetCategory(category) {
                                if (this.drop_tracker.actions.hasOwnProperty(category)) {
                                    this.drop_tracker.actions[category] = 0;
                                }
                                for (let section of ['random_drops', 'stats_drops']) {
                                    if (!this.drop_tracker.hasOwnProperty(section)) {
                                        continue;
                                    }
                                    for (let item in this.drop_tracker[section]) {
                                        if (!this.drop_tracker[section].hasOwnProperty(item)) {
                                            continue;
                                        }
                                        if (!this.drop_tracker[section][item].hasOwnProperty(category)) {
                                            continue;
                                        }
                                        if (null !== this.drop_tracker[section][item][category].a) {
                                            this.drop_tracker[section][item][category] = {t: 0, a: 0};
                                        } else {
                                            this.drop_tracker[section][item][category].t = 0;
                                        }
                                    }
                                }
                            },
                            resetDropTracker() {
                                for (let category in this.drop_tracker.actions) {
                                    if (!this.drop_tracker.actions.hasOwnProperty(category)) {
                                        continue;
                                    }
                                    this.resetCategory(category);
                                }
                                this.drop_tracker.trackerStart = moment.tz(GAME_TIME_ZONE).format('Do MMM Y HH:mm:ss');
                            },
                            dropRate(section, item, type) {
                                if (!this.drop_tracker.hasOwnProperty(section)) {
                                    return '';
                                }
                                if (!this.drop_tracker[section].hasOwnProperty(item)) {
                                    return '';
                                }
                                if (!this.drop_tracker[section][item].hasOwnProperty(type)) {
                                    return '';
                                }
                                let data        = this.drop_tracker[section][item][type];
                                let lookAtTotal = ['plundering', 'multi_drop', 'items', 'growth', 'multistat_chance'];
                                let base        = data.a ? data.a : data.t;
                                if (lookAtTotal.indexOf(item) !== -1 || section === 'stats_drops') {
                                    base = data.t;
                                }

                                let dropRate = ((base / this.drop_tracker.actions[type]) * 100);
                                if (isNaN(dropRate)) {
                                    return '-';
                                }

                                return dropRate.format(2) + '%';
                            },
                        }
                    });
                },
                loadSettings() {
                    let loadedSettings = localStorage.getItem(SETTINGS_SAVE_KEY);
					userSettings = _.defaultsDeep(loadedSettings, DEFAULT_USER_SETTINGS);

                    fn.backwork.saveSettings();
                },
				saveSettings() {
					localStorage.setItem(SETTINGS_SAVE_KEY, JSON.stringify(userSettings));
                },
				
				startup() {
					return {
						'setting up CSS'	: fn.backwork.setupCSS,
						'setting up HTML' 	: fn.backwork.setupHTML,
						'Loading settings'	: fn.backwork.loadSettings,
						'Setting up Vue'	: fn.backwork.setupVue,
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