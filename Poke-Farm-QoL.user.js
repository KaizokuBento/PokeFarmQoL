// ==UserScript==
// @name         Poké Farm QoL NEW
// @namespace    https://github.com/KaizokuBento/
// @author       Bentomon
// @homepage	 https://github.com/KaizokuBento/PokeFarmShelter
// @downloadURL  https://github.com/KaizokuBento/PokeFarmShelter/raw/master/Poke-Farm-QoL.user.js
// @description  Quality of Life changes to Pokéfarm!
// @match        https://pokefarm.com/*
// @resource     QoLSettingsMenuHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/qolSettingsMenuHTML.html
// @resource     shelterSettingsHTML    https://raw.githubusercontent.com/KaizokuBento/PokeFarmQoL/master/resources/templates/shelterOptionsHTML.html
// @version      0.0.1
// @grant        GM_getResourceText
// ==/UserScript== 


(function() {
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
			}
	};
	
		const SETTINGS_KEY = 'QoLSettings';
		
		const TEMPLATES = {
			headerSettingsLinkHTML	: `<a href=https://pokefarm.com/farm#tab=1>QoL Userscript Settings</a href>`,
			qolSettingsMenuHTML		: GM_getResourceText('QoLSettingsMenuHTML')
			shelterSettingsHTML		: GM_getResourceText('shelterOptionsHTML'),
	
		const QOL_CSS = `
		Empty for now
		`
	

	
		////////////////////////////////////////
		// Creating HTML QoL settings page    //
		// Added on farmnews                  //
		////////////////////////////////////////
	
		if(window.location.href.indexOf("farm#tab=1") != -1){ // Creating the QoL Settings Menu in farmnews
			const qolSettingsMenuHTML = `
		<div class = panel>
			<h3>QoL Settings</h3>
			<div>
				<p>Settings Page for the Poké Farm QoL Userscript! Check which features you want to enable.</p>
				<table>
					<tbody>
						<tr>
							<td>
								<label>
									<input id="shelterOption" type="checkbox" v-model="userSettings.shelterEnable"> Advanced Shelter Search
								</label>
							</td>
							<td>
								<button type = "submit" button id = "saveusersetting">Save Settings</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		`;
		
			//Inject the HTML on the farmnewspage
			const qolSettingsMenu = document.getElementById("farmnews");
			qolSettingsMenu.insertAdjacentHTML("afterbegin", qolSettingsMenuHTML); 
		}
	
		//Loading saving Settings TEST

	})();
})(); //end of userscript