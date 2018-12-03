// ==UserScript==
// @name         Poké Farm QoL
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Quality of Life chan
// @author       Bentomon
// @match        https://pokefarm.com/shelter
// @require      http://code.jquery.com/jquery-3.3.1.js
// @grant        GM_addStyle
// ==/UserScript==

(function($) {
    'use strict';
        /////////////////////////////////////
        // Welcome to my first ever script!//
        // Let's setup the Settings first. //
        /////////////////////////////////////

    const DEFAULT_USER_SETTINGS = {
    noUserSettingsYet: true,
    aLotOfJavascriptExperience: false,
    };

    const SETTINGS_KEY = 'UserSettings';

        ///////////////////////////////////////
        // Changes to CSS                    //
        // I should probably put this in Git.//
        ///////////////////////////////////////

    const PFQOL_STYLES = `
    /* Tooltip container */
.tooltip {
position: relative;
display: inline-block;
border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

    /* Tooltip text */
.tooltip .tooltiptext {
visibility: hidden;
width: 500px;
background-color: #555;
color: #fff;
text-align: center;
padding: 5px 0;
border-radius: 6px;

    /* Position the tooltip text */
position: absolute;
z-index: 1;
bottom: 125%;
left: 50%;
margin-left: -60px;

    /* Fade in tooltip */
opacity: 0;
transition: opacity 0.3s;
}

/* Tooltip arrow */
.tooltip .tooltiptext::after {
content: "";
position: absolute;
top: 100%;
left: 50%;
margin-left: -5px;
border-width: 5px;
border-style: solid;
border-color: #555 transparent transparent transparent;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
visibility: visible;
opacity: 1;
}
    `;

// Add the CSS to the website
function insertCss( code ) {
    var style = document.createElement('style');
    style.type = 'text/css';
    if (style.styleSheet) {
        // IE
        style.styleSheet.cssText = code;
    } else {
        // Other browsers
        style.innerHTML = code;
    }
    document.getElementsByTagName("head")[0].appendChild( style );
}

// INJECT THE CSS INTO FUNCTION
insertCss(PFQOL_STYLES);

        /////////////////////////////////////
        // Shelter QoL                     //
        /////////////////////////////////////

    //Shelter Search and Success Variables/constants or whatever they are called
    const shelterDivCreate = document.getElementById("sheltercommands");
    const shelterSearch = document.getElementById("shelterarea").getElementsByClassName("tooltip_content");
    const shelterSearchCustom = document.getElementById("shelterarea").getElementsByClassName("pokemon");

    //Creating shelter Success Div and then we need to be able to find that div and adding some CSS that's not yet visible if you don't find a new Pokémon
    shelterDivCreate.insertAdjacentHTML('beforebegin', "<div id='sheltersuccess'></div>");
    const shelterSuccess = document.getElementById("sheltersuccess");
    shelterSuccess.style.textAlign = "center";
    shelterSuccess.style.background = "#e2ffcd";

    //Shelter User Settings start settings
    var newEgg = localStorage.getItem('newEggSetting', newEgg);
    var newPokemon = localStorage.getItem('newPokemonSetting', newPokemon);
    var newShiny = localStorage.getItem('newShinySetting', newShiny);
    var newAlbino = localStorage.getItem('newAlbinoSetting', newAlbino);
    var newMelanistic = localStorage.getItem('newMelanisticSetting', newMelanistic);
    var newPrehistoric = localStorage.getItem('newPrehistoricSetting', newPrehistoric);
    var newDelta = localStorage.getItem("newDeltaSetting", newDelta);
    var newMega = localStorage.getItem("newMegaSetting", newMega);
    var newStarter = localStorage.getItem("newStarterSetting", newStarter);
    var male = localStorage.getItem("newMaleSetting", male);
    var female = localStorage.getItem("newFemaleSetting", female);
    var none = localStorage.getItem("newNoneSetting", none);
    var allGender = localStorage.getItem("newAllGenderSetting", allGender);
    var customSearch = localStorage.getItem("newCustomSearchSetting", customSearch);
    var customSearchInput = localStorage.getItem("newCustomSearchInput", customSearchInput);
    var customInputTextField = localStorage.getItem("newCustomTextField", customInputTextField);

    //Shelter Option menu Variable/constants or whatever they are called
    const shelterOptionHeader = document.getElementById("shelterupgrades");
    const shelterOptionMenu = document.getElementById("shelterupgrades");

    //Shelter Option menu HTML
    const shelterOptionHTML = `
<div id = shelteroptionsqol>
<p> Check the boxes of Pokémon you wish to find in the shelter!</p>
<table>
<tbody>
<tr>
<td><input type =checkbox id = chknewEgg value = true/><label for = chknewEgg>New Egg</label></td>
<td><input type =checkbox id = chknewPokemon value = true/><label for = chknewPokemon>New Pokémon</label></td>
</tr>
<tr>
<td><input type =checkbox id = chknewShiny value = true/><label for = chknewShiny>Shiny</label></td>
<td><input type =checkbox id = chknewAlbino value = true/><label for = chknewAlbino>Albino</label></td>
</tr>
<tr>
<td><input type =checkbox id = chknewMelanistic value = true/><label for = chknewMelanistic>Melanistic</label></td>
<td><input type =checkbox id = chknewPrehistoric value = true/><label for = chknewPrehistoric>Prehistoric</label></td>
</tr>
<tr>
<td><input type =checkbox id = chknewDelta value = true/><label for = chknewDelta>Delta</label></td>
<td><input type =checkbox id = chknewMega value = true/><label for = chknewMega>Mega</label></td>
</tr>
<tr>
<td><input type =checkbox id = chknewStarter value = true/><label for = chknewStarter>Starter</label></td>
</tr>
</tbody>
</table>
<p>Gender</p>
<table>
<tbody>
<tr>
<td><input type =checkbox id = chkmale value = true/><label for = chkmale>Male</label></td>
<td><input type =checkbox id = chkfemale value = true/><label for = chkfemale>Female</label></td>
</tr>
<td><input type =checkbox id = chknone value = true/><label for = chknone>No gender</label></td>
</tr>
</tbody>
</table>
<p>Custom Search</p>
<div class="tooltip">Custom Search Help
<span class="tooltiptext">To custom search a Pokémon or Egg you check the "custom" checkbox and you need the 'IMAGE CODE' from that Pokémon or Egg.
<br>Example: I want to find a Charmander. This is the image code for Charmander:<br>
"pfq-static.com/img/pkmn/5/l/t.png".<br>
Paste that in the textfield and save settings.<br>
Voila, you can now find charmanders in the Shelter!<br><br>
<a href="https://docs.google.com/spreadsheets/d/1rD1VZNTQRYXMOVKvGasjmMdMJu-iheE-ajsFkfs4QXA/edit?usp=sharing">List of Eggs Image Codes</a><br><br>
More information that probably helps more then my explanation:<br>
<br>
<a href="https://pokefarm.com/forum/thread/127552/Site-Skins-How-To-and-Helpful-CSS>"Pokémon Modifications" > "Make Shelter Pokemon Stand Out"</a><br>
</div>
<table>
<tbody>
<tr>
<td><input type =checkbox id = chkcustom value = true/><label for = chkcustom>Custom</label></td>
<td><input type="text" id = chkcustominput name="customsearch"><br>
</tr>
<tr>
<td><button type = "submit" button id = "saveshelter">Save Settings</button></td>
</tr>
</tbody>
</table>
</div>
    `;

    //Shelter Option menu
    shelterOptionMenu.insertAdjacentHTML('afterend', shelterOptionHTML);
    //Shelter Option Header
    shelterOptionHeader.insertAdjacentHTML('afterend', "<h3>QoL Settings</h3>");

    //Shelter Option menu Function to save the data
    document.getElementById("saveshelter").addEventListener("click", saveShelter);
    function saveShelter(){
        //get variables
        //searches for the checkboxes
        var chknewEgg = document.getElementById("chknewEgg");
        var chknewPokemon = document.getElementById("chknewPokemon");
        var chknewShiny = document.getElementById("chknewShiny");
        var chknewAlbino = document.getElementById("chknewAlbino");
        var chknewMelanistic = document.getElementById("chknewMelanistic");
        var chknewPrehistoric = document.getElementById("chknewPrehistoric");
        var chknewDelta = document.getElementById("chknewDelta");
        var chknewMega = document.getElementById("chknewMega");
        var chknewStarter = document.getElementById("chknewStarter");
        var chkmale = document.getElementById("chkmale");
        var chkfemale = document.getElementById("chkfemale");
        var chknone = document.getElementById("chknone");
        var chkCustom = document.getElementById("chkcustom");
        var chkCustomInput = document.getElementById("chkcustominput");
        //checks which checkboxes are checked when the settings are saved
        if (chknewEgg.checked == true){
            newEgg = true;
        } else {
            newEgg = false;
        }
        localStorage.setItem("newEggSetting", JSON.stringify(newEgg));
         if (chknewPokemon.checked == true){
            newPokemon = true;
        } else {
            newPokemon = false;
        }
        localStorage.setItem("newPokemonSetting", JSON.stringify(newPokemon));
         if (chknewShiny.checked == true){
            newShiny = true;
        } else {
            newShiny = false;
        }
        localStorage.setItem("newShinySetting", JSON.stringify(newShiny));
         if (chknewAlbino.checked == true){
            newAlbino = true;
        } else {
            newAlbino = false;
        }
        localStorage.setItem("newAlbinoSetting", JSON.stringify(newAlbino));
         if (chknewMelanistic.checked == true){
            newMelanistic = true;
        } else {
            newMelanistic = false;
        }
         localStorage.setItem("newMelanisticSetting", JSON.stringify(newMelanistic));
         if (chknewPrehistoric.checked == true){
            newPrehistoric = true;
        } else {
            newPrehistoric = false;
        }
        localStorage.setItem("newPrehistoricSetting", JSON.stringify(newPrehistoric));
        if (chknewDelta.checked == true){
            newDelta = true;
        } else {
            newDelta = false;
        }
        localStorage.setItem("newDeltaSetting", JSON.stringify(newDelta));
        if (chknewMega.checked == true){
            newMega = true;
        } else {
            newMega = false;
        }
        localStorage.setItem("newMegaSetting", JSON.stringify(newMega));
        if (chknewStarter.checked == true){
            newStarter = true;
        } else {
            newStarter = false;
        }
        localStorage.setItem("newStarterSetting", JSON.stringify(newStarter));
        if (chkmale.checked == true){
            male = true;
        } else {
            male = false;
        }
        localStorage.setItem("newMaleSetting", JSON.stringify(male));
        if (chkfemale.checked == true){
            female = true;
        } else {
            female = false;
        }
        localStorage.setItem("newFemaleSetting", JSON.stringify(female));
        if (chknone.checked == true){
            none = true;
        } else {
            none = false;
        }
        localStorage.setItem("newNoneSetting", JSON.stringify(none));
        if (chknone.checked == true && chkmale.checked == true && chkfemale.checked == true){
            allGender = true;
        } else {
            allGender = false;
        }
        localStorage.setItem("newAllGenderSetting", JSON.stringify(allGender));
        if (chknone.checked == false && chkmale.checked == false && chkfemale.checked == false){
            alert("You need to select at least 1 Gender type in the QoL settings!");
        }
        if (chkCustom.checked == true){
            customSearch = true;
            if (customSearchInput = document.getElementById("chkcustominput").value == ""){
                customInputTextField = false;
                if (customSearchInput = "Ha you can't find this!"){
                    customSearchInput = "Ha you can't find this!";
                }
            } else {
                customInputTextField = true;
                if (customSearchInput = document.getElementById("chkcustominput").value == ""){
                    customSearchInput = "Ha you can't find this!";
                } else if (customSearchInput == document.getElementById("chkcustominput").value){
                    customSearchInput = document.getElementById("chkcustominput").value;
                } else {
                    customSearchInput = document.getElementById("chkcustominput").value;
                }
            }
        } else {
            customSearch = false;
        }
        localStorage.setItem("newCustomSearchSetting", JSON.stringify(customSearch));
        localStorage.setItem("newCustomSearchInput", customSearchInput);
        localStorage.setItem("newCustomTextField", JSON.stringify(customInputTextField));
    }


    //Check boxes that have been selected (out of the localstorage)
    var chknewEgg = document.getElementById("chknewEgg");
    var chknewPokemon = document.getElementById("chknewPokemon");
    var chknewShiny = document.getElementById("chknewShiny");
    var chknewAlbino = document.getElementById("chknewAlbino");
    var chknewMelanistic = document.getElementById("chknewMelanistic");
    var chknewPrehistoric = document.getElementById("chknewPrehistoric");
    var chknewDelta = document.getElementById("chknewDelta");
    var chknewMega = document.getElementById("chknewMega");
    var chknewStarter = document.getElementById("chknewStarter");
    var chkmale = document.getElementById("chkmale");
    var chkfemale = document.getElementById("chkfemale");
    var chknone = document.getElementById("chknone");
    var chkCustom = document.getElementById("chkcustom");
    var chkCustomInput = document.getElementById("chkcustominput");

    var newEggLoad = localStorage.getItem('newEggSetting');
    var newPokemonLoad = localStorage.getItem('newPokemonSetting');
    var newShinyLoad = localStorage.getItem('newShinySetting');
    var newAlbinoLoad = localStorage.getItem('newAlbinoSetting');
    var newMelanisticLoad = localStorage.getItem('newMelanisticSetting');
    var newPrehistoricLoad = localStorage.getItem('newPrehistoricSetting');
    var newDeltaLoad = localStorage.getItem("newDeltaSetting", newDelta);
    var newMegaLoad = localStorage.getItem("newMegaSetting", newMega);
    var newStarterLoad = localStorage.getItem("newStarterSetting", newStarter);
    var newFemaleLoad = localStorage.getItem("newMaleSetting", male);
    var newMaleLoad = localStorage.getItem("newFemaleSetting", female);
    var newNoneLoad = localStorage.getItem("newNoneSetting", none);
    var newCustomSearchSettingLoad = localStorage.getItem("newCustomSearchSetting", customSearch);
    var newCustomSearchInputLoad = localStorage.getItem("newCustomSearchInput", customSearchInput);

    if ((/true/i).test(newEggLoad) == true){
        chknewEgg.checked = true;
    }
    if ((/true/i).test(newPokemonLoad) == true){
        chknewPokemon.checked = true;
    }
    if ((/true/i).test(newShinyLoad) == true){
        chknewShiny.checked = true;
    }
    if ((/true/i).test(newAlbinoLoad) == true){
        chknewAlbino.checked = true;
    }
    if ((/true/i).test(newMelanisticLoad) == true){
        chknewMelanistic.checked = true;
    }
    if ((/true/i).test(newPrehistoricLoad) == true){
        chknewPrehistoric.checked = true;
    }
    if ((/true/i).test(newDeltaLoad) == true){
        chknewDelta.checked = true;
    }
    if ((/true/i).test(newMegaLoad) == true){
        chknewMega.checked = true;
    }
    if ((/true/i).test(newStarterLoad) == true){
        chknewStarter.checked = true;
    }
    if ((/true/i).test(newFemaleLoad) == true){
        chkfemale.checked = true;
    }
    if ((/true/i).test(newMaleLoad) == true){
        chkmale.checked = true;
    }
    if ((/true/i).test(newNoneLoad) == true){
        chknone.checked = true;
    }
    if ((/true/i).test(newCustomSearchSettingLoad) == true){
        chkCustom.checked = true;
    }
    if ((/true/i).test(customInputTextField) == false || customInputTextField == "false"){
        chkCustomInput.value = null;
    } else {
        chkCustomInput.value = localStorage.getItem("newCustomSearchInput", customSearchInput);
    }

    //Looking for changes in the DOM if the buttons change on click.
    const target = document.getElementById('sheltercommands');
    const config = {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true
    };

    function subscriber(mutations) {
        mutations.forEach((mutation) => {
            // makes sure that the shelterSuccess div is empty when you reload the shelter.
            if (mutation.type == 'attributes') {
                shelterSuccess.innerHTML="";
                shelterSuccess.style.padding = "";
            }
            // Searches for results and displays if result is successfull
            if (mutation.type == 'attributes') {
                for (var i = 0; i < shelterSearch.length; i++) {
                    //newEgg search
                    if(newEgg == true){
                        if(shelterSearch[i].innerHTML.startsWith("Egg")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>New Egg found!</div>");
                        }
                    }
                    //newPokemon search
                    if(newPokemon == true && allGender == true || newPokemon == "true" && allGender == "true"){
                        if(shelterSearch[i].innerHTML.includes("Pokémon")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>New Pokémon found!</div>");
                        }
                    }
                    if(newPokemon == true && female == true && allGender == false || newPokemon == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("Pokémon") && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>New Female Pokémon found!</div>");
                        }
                    }
                    if(newPokemon == true && male == true && allGender == false || newPokemon == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("Pokémon") && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>New Male Pokémon found!</div>");
                        }
                    }
                    if(newPokemon == true && none == true && allGender == false || newPokemon == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("Pokémon") && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>New no gender Pokémon found!</div>");
                        }
                    }
                    //newShiny search
                    if(newShiny == true && allGender == true || newShiny == "true" && allGender == "true"){
                        if(shelterSearch[i].innerHTML.includes("shiny.png")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Shiny Pokémon found!</div>");
                        }
                    }
                    if(newShiny == true && female == true && allGender == false || newShiny == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("shiny.png") && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Female Shiny Pokémon found!</div>");
                        }
                    }
                    if(newShiny == true && male == true && allGender == false || newShiny == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("shiny.png") && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Male Shiny Pokémon found!</div>");
                        }
                    }
                    if(newShiny == true && none == true && allGender == false || newShiny == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("shiny.png") && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>No gender Shiny Pokémon found!</div>");
                        }
                    }
                    //newAlbino search
                    if(newAlbino == true && allGender == true || newAlbino == "true" && allGender == "true"){
                        if(shelterSearch[i].innerHTML.includes("albino.png")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Albino Pokémon found!</div>");
                        }
                    }
                    if(newAlbino == true && female == true && allGender == false || newAlbino == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("albino.png") && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Female Albino Pokémon found!</div>");
                        }
                    }
                    if(newAlbino == true && male == true && allGender == false || newAlbino == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("albino.png") && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Male Albino Pokémon found!</div>");
                        }
                    }
                    if(newAlbino == true && none == true && allGender == false || newAlbino == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("albino.png") && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>No gender Albino Pokémon found!</div>");
                        }
                    }
                    //newMelanistic search
                    if(newMelanistic == true && allGender == true || newMelanistic == "true" && allGender == "true"){
                        if(shelterSearch[i].innerHTML.includes("melanistic.png")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Melanistic Pokémon found!</div>");
                        }
                    }
                    if(newMelanistic == true && female == true && allGender == false || newMelanistic == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("melanistic.png") && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Female Melanistic Pokémon found!</div>");
                        }
                    }
                    if(newMelanistic == true && male == true && allGender == false || newMelanistic == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("melanistic.png") && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Male Melanistic Pokémon found!</div>");
                        }
                    }
                    if(newMelanistic == true && none == true && allGender == false || newMelanistic == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("melanistic.png") && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>No gender Melanistic Pokémon found!</div>");
                        }
                    }
                    //newDelta search
                    if(newDelta == true && allGender == true || newDelta == "true" && allGender == "true"){
                        if(shelterSearch[i].innerHTML.includes("/_delta/")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Delta Pokémon found!</div>");
                        }
                    }
                    if(newDelta == true && female == true && allGender == false || newDelta == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("/_delta/") && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Female Delta Pokémon found!</div>");
                        }
                    }
                    if(newDelta == true && male == true && allGender == false || newDelta == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("/_delta/") && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Male Delta Pokémon found!</div>");
                        }
                    }
                    if(newDelta == true && none == true && allGender == false || newDelta == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("/_delta/") && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>No gender Delta Pokémon found!</div>");
                        }
                    }
                    //newPrehistoric search
                    if(newPrehistoric == true && allGender == true || newPrehistoric == "true" && allGender == "true"){
                        if(shelterSearch[i].innerHTML.includes("prehistoric.png")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Prehistoric Pokémon found!</div>");
                        }
                    }
                    if(newPrehistoric == true && female == true && allGender == false || newPrehistoric == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("prehistoric.png") && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Female Prehistoric Pokémon found!</div>");
                        }
                    }
                    if(newPrehistoric == true && male == true && allGender == false || newPrehistoric == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("prehistoric.png") && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Male Prehistoric Pokémon found!</div>");
                        }
                    }
                    if(newPrehistoric == true && none == true && allGender == false || newPrehistoric == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("prehistoric.png") && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>No gender Prehistoric Pokémon found!</div>");
                        }
                    }
                    //newMega search
                    if(newMega == true && allGender == true || newMega == "true" && allGender == "true"){
                        if(shelterSearch[i].innerHTML.includes("mega.png")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Mega Pokémon found!</div>");
                        }
                    }
                    if(newMega == true && female == true && allGender == false || newMega == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("mega.png") && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Female Mega Pokémon found!</div>");
                        }
                    }
                    if(newMega == true && male == true && allGender == false || newMega == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("mega.png") && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Male Mega Pokémon found!</div>");
                        }
                    }
                    if(newMega == true && none == true && allGender == false || newMega == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("mega.png") && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>No gender Mega Pokémon found!</div>");
                        }
                    }
                    //newStarter search
                    if(newStarter == true && allGender == true || newStarter == "true" && allGender == "true"){
                        if(shelterSearch[i].innerHTML.includes("starter.png")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Starter Pokémon found!</div>");
                        }
                    }
                    if(newStarter == true && female == true && allGender == false || newStarter == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("starter.png") && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Female Starter Pokémon found!</div>");
                        }
                    }
                    if(newStarter == true && male == true && allGender == false || newStarter == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("starter.png") && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Male Starter Pokémon found!</div>");
                        }
                    }
                    if(newStarter == true && none == true && allGender == false || newStarter == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes("starter.png") && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>No gender Starter Pokémon found!</div>");
                        }
                    }
                    //newCustom search
                    if(customSearch == true && allGender == true || customSearch == "true" && allGender == "true"){
                        if(shelterSearchCustom[i].innerHTML.includes(customSearchInput)){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Custom Search Pokémon/Egg found!</div>");
                        }
                    }
                    if(customSearch == true && female == true && allGender == false || customSearch == "true" && female == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes(customSearchInput) && shelterSearch[i].innerHTML.includes("[F]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Female Custom Search Pokémon/Egg found!</div>");
                        }
                    }
                    if(customSearch == true && male == true && allGender == false || customSearch == "true" && male == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes(customSearchInput) && shelterSearch[i].innerHTML.includes("[M]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>Male Custom Search Pokémon/Egg found!!</div>");
                        }
                    }
                    if(customSearch == true && none == true && allGender == false || customSearch == "true" && none == "true" && allGender == "false"){
                        if(shelterSearch[i].innerHTML.includes(customSearchInput) && shelterSearch[i].innerHTML.includes("[N]")){
                            shelterSuccess.style.padding = "36px 4px 4px";
                            shelterSuccess.insertAdjacentHTML('beforeend', "<div>No gender Custom Search Pokémon/Egg found!</div>");
                        }
                    }
                }
            }
        })
    }



    const observer = new MutationObserver(subscriber);
    observer.observe(target, config);

        //////////////////////////////////////
        // Start the process of changing CSS//
        //////////////////////////////////////

    //function addGlobalStyle(css) {
     //   GM_addStyle(PFQOL_STYLES);
    //}
})();
